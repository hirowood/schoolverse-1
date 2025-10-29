import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "JWT secret not configured" }, { status: 500 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = {
    userId: String(token.id),
    email: token.email,
    username: (token as any).username,
  };

  const svToken = jwt.sign(payload, secret, { expiresIn: "1h" });

  const res = NextResponse.json({ token: svToken });
  // Optional: also set a client-readable cookie so existing socket code can pick it up
  res.headers.append(
    "Set-Cookie",
    `sv_access_token=${svToken}; Path=/; Max-Age=3600; SameSite=Lax`
  );

  return res;
}

