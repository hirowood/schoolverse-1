import { prisma } from '@/lib/db/prisma';
import type { Prisma, Notebook, NotebookPage } from '@prisma/client';

/**
 * NotebookRepository
 * ------------------
 * ノートおよびページに関する DB アクセスを担当。
 * Prisma の生の API をアプリの他層に漏らさないよう、このクラスで集約します。
 */
export class NotebookRepository {
  async createNotebook(data: Prisma.NotebookCreateInput): Promise<Notebook> {
    return prisma.notebook.create({ data });
  }

  async updateNotebook(id: string, data: Prisma.NotebookUpdateInput): Promise<Notebook> {
    return prisma.notebook.update({ where: { id }, data });
  }

  async findById(id: string): Promise<(Notebook & { pages: NotebookPage[] }) | null> {
    return prisma.notebook.findUnique({ where: { id }, include: { pages: true } });
  }

  async listByOwner(ownerId: string): Promise<Notebook[]> {
    return prisma.notebook.findMany({ where: { ownerId }, orderBy: { updatedAt: 'desc' } });
  }

  async addPage(data: Prisma.NotebookPageCreateInput): Promise<NotebookPage> {
    return prisma.notebookPage.create({ data });
  }

  async updatePage(id: string, data: Prisma.NotebookPageUpdateInput): Promise<NotebookPage> {
    return prisma.notebookPage.update({ where: { id }, data });
  }
}

export const notebookRepository = new NotebookRepository();
