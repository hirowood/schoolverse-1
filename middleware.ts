import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuthMiddleware from "next-auth/middleware";

export default function middleware(req: NextRequest) {
  // E2E bypass: when set, do not enforce auth in middleware (tests control auth flow)
  if (process.env.NEXT_PUBLIC_E2E === "1") {
    return NextResponse.next();
  }
  // Delegate to NextAuth middleware otherwise
  // @ts-expect-error - next-auth exports a middleware handler compatible with NextRequest
  return NextAuthMiddleware(req);
}

export const config = {
  matcher: [
    "/classroom",
    "/gallery",
    "/park",
    "/notes",
    "/video/:path*",
    "/3d",
    "/(virtual-space)/:path*",
  ],
};
