import { expect, test } from '@playwright/test';
import { signInViaUI } from './utils/auth';

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

test.describe('Chat experience', () => {
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

    // Mock NextAuth endpoints + socket token for backend-less E2E
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url();
      if (url.endsWith('/api/auth/socket-token')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'e2e-socket-token' }),
          headers: {
            'Set-Cookie': 'sv_access_token=e2e-socket-token; Path=/; Max-Age=900; SameSite=Lax',
          },
        });
        return;
      }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
          headers: {
            'Set-Cookie': 'next-auth.session-token=e2e-session; Path=/; HttpOnly; Max-Age=3600; SameSite=Lax',
          },
        });
        return;
      }
      await route.continue();
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
              unreadCount: 1,
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

    await page.route('**/api/chat/rooms/room-1/messages', async (route, request) => {
      if (request.method() === 'GET') {
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
      } else {
        const body = await request.postDataJSON();
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
      }
    });
  });

  test('allows viewing history, sending messages, and receiving socket pushes', async ({ page }) => {
    await signInViaUI(page, { email: 'test@example.com', password: 'Password123' });
    await page.goto('/chat');

    await expect(page.getByRole('heading', { name: 'Rooms' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'General' })).toBeVisible();
    await expect(page.getByText('Welcome to General')).toBeVisible();

    const composer = page.getByRole('textbox', { name: /type your message/i });
    await composer.click();
    await composer.type('Playwright message');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.getByText('Playwright message')).toBeVisible();

    const emitLog = await page.evaluate(() => window.__socketTest?.emitLog ?? []);
    expect(emitLog.some((entry: { event: string }) => entry.event === 'chat:typing')).toBe(true);
    expect(emitLog.some((entry: { event: string }) => entry.event === 'chat:message:new')).toBe(true);

    await page.evaluate(() => {
      window.__socketTest?.trigger('chat:message:new', {
        id: 'incoming-42',
        roomId: 'room-1',
        senderId: 'user-3',
        content: 'Server broadcast',
        type: 'TEXT',
        recipientId: null,
        createdAt: new Date().toISOString(),
        sender: { id: 'user-3', displayName: 'System Bot', avatarUrl: null },
      });
    });

    await expect(page.getByText('Server broadcast')).toBeVisible();
  });
});
