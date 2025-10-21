import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTokenFromAuthHeader, verifyToken } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  const token = getTokenFromAuthHeader(request.headers.get('authorization'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, displayName: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ user });
}
