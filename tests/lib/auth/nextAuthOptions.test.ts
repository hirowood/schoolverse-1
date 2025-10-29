import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('nextAuth callbacks', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SKIP_NEXT_AUTH_PROVIDER = 'true';
  });

  afterEach(() => {
    delete process.env.SKIP_NEXT_AUTH_PROVIDER;
  });

  it('jwt callback copies role metadata when user is present', async () => {
    const { default: authConfig } = await import('@/lib/auth/nextAuthOptions');

    const token = { sub: 'user-1', email: 'user@example.com' };
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      username: 'user1',
      displayName: 'User One',
      roles: ['admin'],
      permissions: ['users:manage'],
    };

    const result = await authConfig.callbacks?.jwt?.({ token, user } as never);
    expect(result).toMatchObject({
      id: 'user-1',
      username: 'user1',
      displayName: 'User One',
      roles: ['admin'],
      permissions: ['users:manage'],
    });
  });

  it('session callback merges token metadata into session user', async () => {
    const { default: authConfig } = await import('@/lib/auth/nextAuthOptions');

    const session = { user: { id: 'user-1', username: null, displayName: null, roles: null, permissions: null } };
    const token = {
      id: 'user-1',
      username: 'user1',
      displayName: 'User One',
      roles: ['admin'],
      permissions: ['users:manage'],
    };

    const result = await authConfig.callbacks?.session?.({ session, token } as never);
    expect(result?.user).toMatchObject({
      id: 'user-1',
      username: 'user1',
      displayName: 'User One',
      roles: ['admin'],
      permissions: ['users:manage'],
    });
  });
});
