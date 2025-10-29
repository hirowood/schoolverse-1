import type { SessionUser } from "@/types/session";

export function hasRole(user: SessionUser | null | undefined, role: string): boolean {
  const roles = user?.roles;
  return Array.isArray(roles) && roles.includes(role);
}

export function hasPermission(user: SessionUser | null | undefined, perm: string): boolean {
  const permissions = user?.permissions;
  return Array.isArray(permissions) && permissions.includes(perm);
}
