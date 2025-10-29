import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '@/lib/auth/jwt';

describe('auth jwt helpers', () => {
  it('signAccessToken encodes roles and permissions for round-trip verification', () => {
    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
      username: 'user123',
      displayName: 'User Example',
      roles: ['admin'],
      permissions: ['users:read', 'users:write'],
    };

    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.roles).toEqual(['admin']);
    expect(decoded?.permissions).toEqual(['users:read', 'users:write']);
  });

  it('verifyAccessToken returns null on malformed token', () => {
    expect(verifyAccessToken('not-a-token')).toBeNull();
  });
});
