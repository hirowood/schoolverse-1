import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, unauthorized } from '@/lib/auth/middleware';
import { noteService } from '@/services/noteService';
import type { Notebook } from '@prisma/client';

/**
 * ノート一覧取得・新規作成 API (GET/POST)
 */
const createSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().max(500).nullish(),
  tags: z.array(z.string()).max(20).optional(),
});

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return unauthorized();

  const notebooks = await noteService.listMyNotebooks(auth.userId);
  return NextResponse.json({ notebooks: notebooks.map(toNotebookResponse) });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const notebook = await noteService.createNotebook({
      ownerId: auth.userId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      tags: parsed.data.tags,
    });
    return NextResponse.json({ notebook: toNotebookResponse(notebook) }, { status: 201 });
  } catch (error) {
    console.error('[notebooks] failed to create', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

function toNotebookResponse(notebook: Notebook) {
  return {
    id: notebook.id,
    title: notebook.title,
    description: notebook.description,
    tags: notebook.tags,
    isShared: notebook.isShared,
    createdAt: notebook.createdAt,
    updatedAt: notebook.updatedAt,
  };
}
