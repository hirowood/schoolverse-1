import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from './cookies';
import { getTokenFromAuthHeader, verifyAccessToken } from './jwt';

export type AuthResult = { userId: string } | { error: string };

export function requireAuth(request: NextRequest): AuthResult {
  const bearer = getTokenFromAuthHeader(request.headers.get('authorization'));
  const cookieToken = getAccessToken(request);
  const token = bearer ?? cookieToken;
  if (!token) return { error: 'Unauthorized' };
  const payload = verifyAccessToken(token);
  if (!payload?.sub) return { error: 'Unauthorized' };
  return { userId: payload.sub };
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
