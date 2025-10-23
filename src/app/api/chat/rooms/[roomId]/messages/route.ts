import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, unauthorized } from '@/lib/auth/middleware';
import { chatService } from '@/services/chatService';

const historyQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const sendSchema = z.object({
  content: z.string().min(1),
  type: z.enum(['TEXT', 'SYSTEM', 'NOTIFICATION']).optional(),
  recipientId: z.string().cuid().nullable().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  const auth = requireAuth(request);
  if ('error' in auth) return unauthorized();

  const url = new URL(request.url);
  const parsedQuery = historyQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return NextResponse.json({ error: 'INVALID_QUERY', details: parsedQuery.error.flatten() }, { status: 400 });
  }

  const { cursor, limit } = parsedQuery.data;

  try {
    const history = await chatService.getRoomHistory({
      roomId: params.roomId,
      userId: auth.userId,
      cursor,
      limit,
    });
    return NextResponse.json(history);
  } catch (error) {
    if (error instanceof Error && error.message === 'ROOM_FORBIDDEN') {
      return NextResponse.json({ error: 'ROOM_FORBIDDEN' }, { status: 403 });
    }
    console.error('[chat] history fetch failed', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  const auth = requireAuth(request);
  if ('error' in auth) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const message = await chatService.sendMessage({
      roomId: params.roomId,
      senderId: auth.userId,
      content: parsed.data.content,
      type: parsed.data.type,
      recipientId: parsed.data.recipientId ?? null,
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'ROOM_FORBIDDEN') {
      return NextResponse.json({ error: 'ROOM_FORBIDDEN' }, { status: 403 });
    }
    console.error('[chat] send message failed', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
