import { Prisma, type Notebook, type NotebookPage } from '@prisma/client';
import { notebookRepository } from '@/repositories';
import type {
  CreateNotebookInput,
  UpdateNotebookInput,
  UpsertNotebookPageInput,
} from '@/types/note';

/**
 * NoteService
 * -----------
 * フロントエンドや API から呼ばれるノート機能の中心クラスです。
 *  - ノートの作成・更新
 *  - 所有ユーザーのノート一覧取得
 *  - ノートページの保存（存在すれば更新 / 無ければ追加）
 *
 * 今後 Phase 3.5 でリアルタイム同期や AI 補助を追加する際も、この層を拡張すれば対応できる構造にしています。
 */
export class NoteService {
  /** ノートを新規作成します。 */
  async createNotebook(input: CreateNotebookInput): Promise<Notebook> {
    return notebookRepository.createNotebook({
      title: input.title,
      description: input.description ?? null,
      tags: input.tags ?? [],
      owner: { connect: { id: input.ownerId } },
    });
  }

  /**
   * ノートを更新します。所有者以外が操作しようとした場合はエラーになります。
   */
  async updateNotebook(ownerId: string, payload: UpdateNotebookInput): Promise<Notebook> {
    await this.ensureOwnership(payload.notebookId, ownerId);

    const data: Prisma.NotebookUpdateInput = {};
    if (payload.title !== undefined) data.title = payload.title;
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.tags !== undefined) data.tags = payload.tags;
    if (payload.isShared !== undefined) data.isShared = payload.isShared;

    return notebookRepository.updateNotebook(payload.notebookId, data);
  }

  /** ログインユーザーが所有するノート一覧を更新日時の新しい順で返します。 */
  async listMyNotebooks(ownerId: string): Promise<Notebook[]> {
    return notebookRepository.listByOwner(ownerId);
  }

  /**
   * ノートページを保存します。既存ページがあれば上書き、無ければ追加します。
   * 所有者でない場合はエラーを投げます。
   */
  async savePageForOwner(
    ownerId: string,
    { notebookId, pageNumber, vectorJson, pdfAssetId }: UpsertNotebookPageInput,
  ): Promise<NotebookPage> {
    const notebook = await this.ensureOwnership(notebookId, ownerId);
    const target = notebook.pages.find((page) => page.pageNumber === pageNumber);

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

  /**
   * 指定ノートが存在し、引数のユーザーが所有者であることをチェックします。
   * 条件を満たさない場合は NOTEBOOK_NOT_FOUND エラーを投げます。
   */
  private async ensureOwnership(notebookId: string, ownerId: string) {
    const notebook = await notebookRepository.findById(notebookId);
    if (!notebook || notebook.ownerId !== ownerId) {
      throw new Error('NOTEBOOK_NOT_FOUND');
    }
    return notebook;
  }
}

export const noteService = new NoteService();

