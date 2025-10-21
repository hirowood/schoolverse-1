import { NextResponse } from 'next/server';
import { getTokenFromAuthHeader, verifyToken } from './jwt';

export type AuthResult = { userId: string } | { error: string };

export function requireAuth(request: Request): AuthResult {
  const token = getTokenFromAuthHeader(request.headers.get('authorization'));
  if (!token) return { error: 'Missing Authorization header' };
  const payload = verifyToken(token);
  if (!payload?.sub) return { error: 'Invalid or expired token' };
  return { userId: payload.sub };
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
