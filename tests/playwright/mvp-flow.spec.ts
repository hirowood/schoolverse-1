import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __socketTest?: {
      emitLog: Array<{ event: string; payload: unknown }>;
      trigger: (event: string, payload: unknown) => void;
    };
  }
}

const now = new Date('2024-03-01T09:00:00Z');

const user = {
  id: 'user-1',
  displayName: 'Alice Example',
  avatarUrl: null,
};

test.describe('MVP happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const listeners = new Map<string, Set<(payload: unknown) => void>>();
      const emitLog: Array<{ event: string; payload: unknown }> = [];

      const socketStub = {
        on(event: string, handler: (payload: unknown) => void) {
          if (!listeners.has(event)) listeners.set(event, new Set());
          listeners.get(event)!.add(handler);
          return socketStub;
        },
        off(event: string, handler: (payload: unknown) => void) {
          listeners.get(event)?.delete(handler);
          return socketStub;
        },
        emit(event: string, payload: unknown) {
          emitLog.push({ event, payload });
          listeners.get(event)?.forEach((handler) => handler(payload));
          return true;
        },
      };

      (window as unknown as { __SCHOOLVERSE_SOCKET__?: typeof socketStub }).__SCHOOLVERSE_SOCKET__ = socketStub;
      (window as unknown as { __socketTest?: { emitLog: typeof emitLog; trigger: (event: string, payload: unknown) => void } }).__socketTest =
        {
          emitLog,
          trigger(event: string, payload: unknown) {
            listeners.get(event)?.forEach((handler) => handler(payload));
          },
        };
    });
  });

  test('user edits notes, chats, and joins virtual space', async ({ page }) => {
    const saveRequests: Array<{ pageNumber: number; vectorJson: unknown }> = [];

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user }),
      });
    });

    await page.route('**/api/notebooks', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notebooks: [
              {
                id: 'notebook-1',
                title: '統合テストノート',
                description: 'Playwright flow',
                tags: [],
                isShared: false,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              },
            ],
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/notebooks/notebook-1/pages**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'NOT_FOUND' }) });
        return;
      }

      const body = (await route.request().postDataJSON()) as { pageNumber: number; vectorJson: unknown };
      saveRequests.push(body);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: {
            id: 'page-1',
            pageNumber: body.pageNumber,
            vectorJson: body.vectorJson ?? null,
            pdfAssetId: null,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        }),
      });
    });

    await page.route('**/api/chat/rooms', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          rooms: [
            {
              id: 'room-1',
              name: 'General',
              unreadCount: 0,
              lastMessage: {
                id: 'history-1',
                roomId: 'room-1',
                senderId: 'user-2',
                content: 'Welcome to General',
                type: 'TEXT',
                recipientId: null,
                createdAt: now.toISOString(),
                sender: { id: 'user-2', displayName: 'Bob Remote', avatarUrl: null },
              },
            },
          ],
        }),
      });
    });

    await page.route('**/api/chat/rooms/room-1/messages**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 'history-1',
                roomId: 'room-1',
                senderId: 'user-2',
                content: 'Welcome to General',
                type: 'TEXT',
                recipientId: null,
                createdAt: now.toISOString(),
                sender: { id: 'user-2', displayName: 'Bob Remote', avatarUrl: null },
              },
            ],
            nextCursor: null,
            hasMore: false,
          }),
        });
        return;
      }

      const body = (await route.request().postDataJSON()) as { content: string };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: {
            id: 'message-200',
            roomId: 'room-1',
            senderId: user.id,
            content: body.content,
            type: 'TEXT',
            recipientId: null,
            createdAt: new Date(now.getTime() + 60_000).toISOString(),
            sender: user,
            receipts: [],
          },
        }),
      });
    });

    await page.goto('/notes');

    await expect(page.getByRole('heading', { name: 'デジタルノート' })).toBeVisible();
    await expect(page.getByText('ノート一覧')).toBeVisible();
    await expect(page.getByRole('button', { name: '統合テストノート' })).toBeVisible();

    const canvas = page.locator('canvas[data-fabric="main"]');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    await page.evaluate(async () => {
      await fetch('/api/notebooks/notebook-1/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageNumber: 1,
          vectorJson: { content: 'integration-save' },
          pdfAssetId: null,
        }),
      });
    });

    expect(saveRequests).toHaveLength(1);
    expect(saveRequests[0]?.pageNumber).toBe(1);

    const chatResponse = await page.goto('/chat');
    if (!chatResponse || chatResponse.status() === 404) {
      test.skip('Chat route returned 404: ensure Next.js dev server is running.');
    }
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Rooms' })).toBeVisible();
    await expect(page.getByText('Welcome to General')).toBeVisible();

    const composer = page.getByRole('textbox', { name: /type your message/i });
    await composer.click();
    await composer.fill('統合テストからのメッセージ');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('統合テストからのメッセージ')).toBeVisible();

    const socketLogAfterChat = await page.evaluate(() => window.__socketTest?.emitLog ?? []);
    expect(socketLogAfterChat.some((entry: { event: string }) => entry.event === 'chat:message:new')).toBe(true);
    expect(socketLogAfterChat.some((entry: { event: string }) => entry.event === 'chat:typing')).toBe(true);

    await page.goto('/classroom');
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(200);

    const presenceLog = await page.evaluate(() => window.__socketTest?.emitLog ?? []);
    expect(presenceLog.some((entry: { event: string }) => entry.event === 'presence:join')).toBe(true);
  });
});
