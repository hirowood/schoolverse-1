export type SafeUser = {
  id: string;
  email: string;
  displayName: string;
};

export function toSafeUser(u: { id: string; email: string; displayName: string }): SafeUser {
  return { id: u.id, email: u.email, displayName: u.displayName };
}
