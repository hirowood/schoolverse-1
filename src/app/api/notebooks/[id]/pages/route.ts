import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, unauthorized } from '@/lib/auth/middleware';
import { noteService } from '@/services/noteService';

/**
 * ノートページ保存 API (PUT /api/notebooks/[id]/pages)
 * フロントエンドから受け取った描画データを保存します。
 */
const upsertSchema = z.object({
  pageNumber: z.number().int().min(1),
  vectorJson: z.unknown().optional(),
  pdfAssetId: z.string().min(1).optional().nullable(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if ('error' in auth) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const page = await noteService.savePageForOwner(auth.userId, {
      notebookId: params.id,
      pageNumber: parsed.data.pageNumber,
      vectorJson: parsed.data.vectorJson,
      pdfAssetId: parsed.data.pdfAssetId ?? null,
    });
    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOTEBOOK_NOT_FOUND') {
      return NextResponse.json({ error: 'NOTEBOOK_NOT_FOUND' }, { status: 404 });
    }
    console.error('[notebooks] failed to save page', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
