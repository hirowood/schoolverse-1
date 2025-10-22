import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { setAuthCookies } from '@/lib/auth/cookies';

const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'USERNAME_INVALID'),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const { accessToken, refreshToken, user } = await authService.signup(parsed.data);
    const response = NextResponse.json({ user }, { status: 201 });
    setAuthCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'EMAIL_EXISTS') {
        return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 409 });
      }
      if (error.message === 'USERNAME_EXISTS') {
        return NextResponse.json({ error: 'USERNAME_EXISTS' }, { status: 409 });
      }
    }
    console.error('[auth/register] unexpected error', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
