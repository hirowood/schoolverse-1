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
 *  - ノートの作成・更新・削除
 *  - 所有ユーザーのノート一覧取得
 *  - ノートページの保存（存在すれば更新 / 無ければ追加）
 *
 * 今後 Phase 3.5 でリアルタイム同期や AI 補助を追加する際も、この層を拡張すれば対応できる構造にしています。
 * 
 * @updated 2025-10-24 - deleteNotebook メソッド追加
 */
export class NoteService {
  // ============================================
  // Notebook CRUD操作
  // ============================================

  /**
   * ノートを新規作成します。
   */
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

  /**
   * ノートを取得します。所有者以外が操作しようとした場合はエラーになります。
   * 
   * @param ownerId - 所有者のユーザーID
   * @param notebookId - 取得するノートブックのID
   * @returns ノートブック（ページを含む）
   * 
   * @throws {Error} 'NOTEBOOK_NOT_FOUND' - ノートブックが見つからない、または所有者でない場合
   * 
   * @example
   * ```typescript
   * try {
   *   const notebook = await noteService.getNotebook('user-id', 'notebook-id');
   *   console.log('ノートブック:', notebook.title);
   * } catch (error) {
   *   if (error.message === 'NOTEBOOK_NOT_FOUND') {
   *     console.error('ノートブックが見つかりません');
   *   }
   * }
   * ```
   */
  async getNotebook(
    ownerId: string, 
    notebookId: string
  ): Promise<Notebook & { pages: NotebookPage[] }> {
    // 所有者チェックと取得を同時に実行
    return this.ensureOwnership(notebookId, ownerId);
  }

  /**
   * ノートを削除します。所有者以外が操作しようとした場合はエラーになります。
   * 
   * @param ownerId - 所有者のユーザーID
   * @param notebookId - 削除するノートブックのID
   * @returns 削除されたノートブック
   * 
   * @throws {Error} 'NOTEBOOK_NOT_FOUND' - ノートブックが見つからない、または所有者でない場合
   * 
   * @description
   * カスケード削除により、関連するNotebookPageも自動的に削除されます。
   * 
   * @example
   * ```typescript
   * try {
   *   await noteService.deleteNotebook('user-id', 'notebook-id');
   *   console.log('ノートブックを削除しました');
   * } catch (error) {
   *   if (error.message === 'NOTEBOOK_NOT_FOUND') {
   *     console.error('ノートブックが見つかりません');
   *   }
   * }
   * ```
   */
  async deleteNotebook(ownerId: string, notebookId: string): Promise<Notebook> {
    // 1. 所有者チェック
    await this.ensureOwnership(notebookId, ownerId);

    // 2. ノートブック削除（関連ページも自動削除）
    return notebookRepository.deleteNotebook(notebookId);
  }

  /**
   * ログインユーザーが所有するノート一覧を更新日時の新しい順で返します。
   */
  async listMyNotebooks(ownerId: string): Promise<Notebook[]> {
    return notebookRepository.listByOwner(ownerId);
  }

  // ============================================
  // NotebookPage 操作
  // ============================================

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

  // ============================================
  // 内部ヘルパーメソッド
  // ============================================

  /**
   * 指定ノートが存在し、引数のユーザーが所有者であることをチェックします。
   * 条件を満たさない場合は NOTEBOOK_NOT_FOUND エラーを投げます。
   * 
   * @param notebookId - チェックするノートブックのID
   * @param ownerId - チェックする所有者のユーザーID
   * @returns ノートブック（ページを含む）
   * @throws {Error} 'NOTEBOOK_NOT_FOUND' - ノートブックが見つからない、または所有者でない場合
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
