import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { clearAuthCookies, getAccessToken, getRefreshToken } from '@/lib/auth/cookies';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { sessionRepository } from '@/repositories';

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshToken(request);
  const accessToken = getAccessToken(request);

  let userId: string | null = null;

  if (refreshToken) {
    const session = await sessionRepository.findByRefreshToken(refreshToken);
    if (session) {
      userId = session.userId;
    } else {
      const payload = verifyRefreshToken(refreshToken);
      userId = payload?.sub ?? null;
    }
  }

  if (!userId && accessToken) {
    const payload = verifyAccessToken(accessToken);
    userId = payload?.sub ?? null;
  }

  if (userId) {
    await authService.logout(userId);
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
