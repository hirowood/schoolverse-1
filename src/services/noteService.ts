import { Prisma, type Notebook, type NotebookPage } from '@prisma/client';
import { notebookRepository } from '@/repositories';
import type { CreateNotebookInput, UpsertNotebookPageInput } from '@/types/note';

/**
 * NoteService
 * -----------
 * - ノート作成・更新・ページ追加の基本フローを司るサービス層。
 * - ここではまだシンプルな CRUD のみを提供し、Phase 3.5 でリアルタイム同期や AI との連携を拡張予定。
 */
export class NoteService {
  async createNotebook(input: CreateNotebookInput): Promise<Notebook> {
    return notebookRepository.createNotebook({
      title: input.title,
      description: input.description ?? null,
      tags: input.tags ?? [],
      owner: { connect: { id: input.ownerId } },
    });
  }

  async updateNotebook(id: string, patch: Partial<CreateNotebookInput>): Promise<Notebook> {
    const data = {
      title: patch.title,
      description: patch.description,
      tags: patch.tags,
    } satisfies Partial<CreateNotebookInput>;
    return notebookRepository.updateNotebook(id, data);
  }

  async listMyNotebooks(ownerId: string): Promise<Notebook[]> {
    return notebookRepository.listByOwner(ownerId);
  }

  async savePage({ notebookId, pageNumber, vectorJson, pdfAssetId }: UpsertNotebookPageInput): Promise<NotebookPage> {
    const existingPages = await notebookRepository.listPages(notebookId);
    const target = existingPages.find((page) => page.pageNumber === pageNumber);
    if (target) {
      return notebookRepository.updatePage(target.id, {
        vectorJson: vectorJson ?? Prisma.DbNull,
        pdfAssetId: pdfAssetId ?? null,
      });
    }

    return notebookRepository.addPage({
      notebook: { connect: { id: notebookId } },
      pageNumber,
      vectorJson: vectorJson ?? Prisma.DbNull,
      pdfAssetId: pdfAssetId ?? null,
    });
  }
}

export const noteService = new NoteService();
