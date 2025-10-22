import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { setAuthCookies } from '@/lib/auth/cookies';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  }

  try {
    const { accessToken, refreshToken, user } = await authService.login(parsed.data);
    const response = NextResponse.json(
      { user },
      {
        status: 200,
      },
    );

    setAuthCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
    }
    console.error('[auth/login] unexpected error', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
