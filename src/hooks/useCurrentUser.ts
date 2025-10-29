"use client";
import { useSession } from "next-auth/react";

export type CurrentUser = {
  id: string;
  email: string | null;
  username?: string | null;
  displayName?: string | null;
} | null;

export function useCurrentUser(): { user: CurrentUser; status: "loading" | "authenticated" | "unauthenticated" } {
  const { data, status } = useSession();
  const u = data?.user as any | undefined;
  const user: CurrentUser = u?.id
    ? {
        id: String(u.id),
        email: (u.email as string) ?? null,
        username: (u.username as string | undefined) ?? null,
        displayName: (u.displayName as string | undefined) ?? null,
      }
    : null;
  return { user, status };
}

export default useCurrentUser;

