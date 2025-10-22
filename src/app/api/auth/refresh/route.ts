import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { getRefreshToken, setAuthCookies } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshToken(request);
  if (!refreshToken) {
    return NextResponse.json({ error: 'MISSING_REFRESH_TOKEN' }, { status: 401 });
  }

  try {
    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh({ refreshToken });
    const response = NextResponse.json({ user }, { status: 200 });
    setAuthCookies(response, { accessToken, refreshToken: newRefreshToken });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_REFRESH_TOKEN' || error.message === 'REFRESH_TOKEN_EXPIRED') {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }
    console.error('[auth/refresh] unexpected error', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
