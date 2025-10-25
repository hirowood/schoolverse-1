import { prisma } from '@/lib/db/prisma';
import type { Prisma, Notebook, NotebookPage } from '@prisma/client';

/**
 * NotebookRepository
 * ------------------
 * ノートおよびページに関する DB アクセスを担当。
 * Prisma の生の API をアプリの他層に漏らさないよう、このクラスで集約します。
 * 
 * @updated 2025-10-24 - deleteNotebook, deletePage メソッド追加
 */
export class NotebookRepository {
  // ============================================
  // Notebook CRUD操作
  // ============================================

  /**
   * ノートブックを新規作成
   */
  async createNotebook(data: Prisma.NotebookCreateInput): Promise<Notebook> {
    return prisma.notebook.create({ data });
  }

  /**
   * ノートブックを更新
   */
  async updateNotebook(id: string, data: Prisma.NotebookUpdateInput): Promise<Notebook> {
    return prisma.notebook.update({ where: { id }, data });
  }

  /**
   * ノートブックをIDで取得（ページを含む）
   */
  async findById(id: string): Promise<(Notebook & { pages: NotebookPage[] }) | null> {
    return prisma.notebook.findUnique({ where: { id }, include: { pages: true } });
  }

  /**
   * 指定ユーザーが所有するノートブック一覧を取得
   * 更新日時の新しい順でソート
   */
  async listByOwner(ownerId: string): Promise<Notebook[]> {
    return prisma.notebook.findMany({ 
      where: { ownerId }, 
      orderBy: { updatedAt: 'desc' } 
    });
  }

  /**
   * ノートブックを削除
   * 
   * @param id - 削除するノートブックのID
   * @returns 削除されたノートブック
   * 
   * @description
   * カスケード削除により、関連するNotebookPageも自動的に削除されます。
   * （Prismaスキーマで onDelete: Cascade が設定されている前提）
   */
  async deleteNotebook(id: string): Promise<Notebook> {
    return prisma.notebook.delete({ where: { id } });
  }

  // ============================================
  // NotebookPage CRUD操作
  // ============================================

  /**
   * ノートページを追加
   */
  async addPage(data: Prisma.NotebookPageCreateInput): Promise<NotebookPage> {
    return prisma.notebookPage.create({ data });
  }

  /**
   * ノートページを更新
   */
  async updatePage(id: string, data: Prisma.NotebookPageUpdateInput): Promise<NotebookPage> {
    return prisma.notebookPage.update({ where: { id }, data });
  }

  /**
   * ノートページを削除
   * 
   * @param id - 削除するページのID
   * @returns 削除されたページ
   */
  async deletePage(id: string): Promise<NotebookPage> {
    return prisma.notebookPage.delete({ where: { id } });
  }
}

export const notebookRepository = new NotebookRepository();
