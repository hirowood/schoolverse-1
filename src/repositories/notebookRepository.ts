import { prisma } from '@/lib/db/prisma';
import type { Prisma, Notebook, NotebookPage } from '@prisma/client';

/**
 * NotebookRepository
 * ------------------
 * Encapsulates all database access related to notebooks・pages.
 * 他の層からは Prisma の細かな API を意識せずに利用できるようにします。
 */
export class NotebookRepository {
  async createNotebook(data: Prisma.NotebookCreateInput): Promise<Notebook> {
    return prisma.notebook.create({ data });
  }

  async updateNotebook(id: string, data: Prisma.NotebookUpdateInput): Promise<Notebook> {
    return prisma.notebook.update({ where: { id }, data });
  }

  async findById(id: string): Promise<Notebook | null> {
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

  async listPages(notebookId: string): Promise<NotebookPage[]> {
    return prisma.notebookPage.findMany({ where: { notebookId }, orderBy: { pageNumber: 'asc' } });
  }
}

export const notebookRepository = new NotebookRepository();
