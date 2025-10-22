import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { authService } from '@/services/authService';

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const user = await authService.getSafeUser(result.userId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
