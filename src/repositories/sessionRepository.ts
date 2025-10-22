/**
 * SessionRepository
 * -----------------
 * Centralizes CRUD access to the session table.
 * Encapsulating DB operations behind this class keeps
 * service code clean and promotes reuse.
 */
import type { Prisma, Session as PrismaSession } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

type CreateSessionInput = Prisma.SessionCreateInput;
type UpdateSessionInput = Prisma.SessionUpdateInput;

export class SessionRepository {
  async create(data: CreateSessionInput): Promise<PrismaSession> {
    return prisma.session.create({ data });
  }

  async findByRefreshToken(refreshToken: string): Promise<PrismaSession | null> {
    return prisma.session.findUnique({ where: { refreshToken } });
  }

  async findByAccessToken(accessToken: string): Promise<PrismaSession | null> {
    return prisma.session.findFirst({ where: { accessToken } });
  }

  async delete(id: string): Promise<void> {
    await prisma.session.delete({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }

  async update(id: string, data: UpdateSessionInput): Promise<PrismaSession> {
    return prisma.session.update({ where: { id }, data });
  }
}

export const sessionRepository = new SessionRepository();
