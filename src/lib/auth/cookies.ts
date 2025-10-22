import type { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

export const ACCESS_TOKEN_COOKIE = 'sv_access_token';
export const REFRESH_TOKEN_COOKIE = 'sv_refresh_token';

type CookieOptions = {
  maxAge?: number;
  path?: string;
};

function buildCookieOptions({ maxAge, path }: CookieOptions = {}) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge,
    path: path ?? '/',
  };
}

export function setAuthCookies(
  response: NextResponse,
  {
    accessToken,
    refreshToken,
    accessTokenMaxAge = 60 * 15, // 15 minutes
    refreshTokenMaxAge = 60 * 60 * 24 * 7, // 7 days
  }: {
    accessToken: string;
    refreshToken: string;
    accessTokenMaxAge?: number;
    refreshTokenMaxAge?: number;
  },
) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    buildCookieOptions({ maxAge: accessTokenMaxAge }),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    buildCookieOptions({ maxAge: refreshTokenMaxAge }),
  );
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

export function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

export function getRefreshToken(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
}
