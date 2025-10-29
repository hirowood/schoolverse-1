import { describe, expect, it } from 'vitest';
import type { SessionUser } from '@/types/session';
import { hasPermission, hasRole } from '@/lib/auth/guards';

const makeUser = (overrides: Partial<SessionUser> = {}): SessionUser => ({
  id: overrides.id ?? 'user-1',
  email: overrides.email ?? 'user@example.com',
  name: overrides.name ?? 'User Example',
  username: overrides.username ?? 'user1',
  displayName: overrides.displayName ?? 'User Example',
  image: overrides.image ?? null,
  roles: overrides.roles ?? ['member'],
  permissions: overrides.permissions ?? ['chat:read'],
});

describe('auth guards', () => {
  it('hasRole returns true when role is present', () => {
    expect(hasRole(makeUser({ roles: ['member', 'admin'] }), 'admin')).toBe(true);
  });

  it('hasRole returns false for missing role or user', () => {
    expect(hasRole(makeUser({ roles: ['member'] }), 'admin')).toBe(false);
    expect(hasRole(null, 'member')).toBe(false);
  });

  it('hasPermission returns true when permission exists', () => {
    expect(hasPermission(makeUser({ permissions: ['chat:read', 'chat:write'] }), 'chat:write')).toBe(true);
  });

  it('hasPermission returns false when permission missing or user absent', () => {
    expect(hasPermission(makeUser({ permissions: ['chat:read'] }), 'chat:write')).toBe(false);
    expect(hasPermission(undefined, 'chat:read')).toBe(false);
  });
});
