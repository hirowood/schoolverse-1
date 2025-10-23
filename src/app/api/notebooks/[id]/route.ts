import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, unauthorized } from '@/lib/auth/middleware';
import { noteService } from '@/services/noteService';

/**
 * ノート更新 API (PUT /api/notebooks/[id])
 */
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(500).nullish().optional(),
  tags: z.array(z.string()).max(20).optional(),
  isShared: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if ('error' in auth) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const notebook = await noteService.updateNotebook(auth.userId, {
      notebookId: params.id,
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags,
      isShared: parsed.data.isShared,
    });
    return NextResponse.json({ notebook });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOTEBOOK_NOT_FOUND') {
      return NextResponse.json({ error: 'NOTEBOOK_NOT_FOUND' }, { status: 404 });
    }
    console.error('[notebooks] failed to update', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
