"use client";
import { useSession } from "next-auth/react";
import type { SessionUser } from "@/types/session";

export type CurrentUser = SessionUser | null;

export function useCurrentUser(): { user: CurrentUser; status: "loading" | "authenticated" | "unauthenticated" } {
  const { data, status } = useSession();
  const user = (data?.user as SessionUser | undefined) ?? null;
  return { user, status };
}

export default useCurrentUser;
