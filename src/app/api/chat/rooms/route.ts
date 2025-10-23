import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@/lib/auth/middleware';
import { chatService } from '@/services/chatService';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return unauthorized();

  try {
    const rooms = await chatService.listRoomsForUser(auth.userId);
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('[chat] list rooms failed', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
