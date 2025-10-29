export type SessionUser = import("next-auth").Session["user"];

// Convenience re-export for common fields when narrowing
export type { Session } from "next-auth";

