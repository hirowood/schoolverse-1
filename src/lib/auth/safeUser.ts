export type SafeUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  status?: string;
  roles?: string[] | null;
  permissions?: string[] | null;
};

export function toSafeUser(u: {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  status?: string;
  roles?: string[] | null;
  permissions?: string[] | null;
}): SafeUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    status: u.status,
    roles: u.roles ?? null,
    permissions: u.permissions ?? null,
  };
}
