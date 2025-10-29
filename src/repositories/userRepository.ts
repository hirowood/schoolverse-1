/**
 * UserRepository
 * ---------------
 * Thin wrapper around Prisma queries. The explicit class
 * makes it easier to mock in tests or swap the persistence
 * layer without touching service/business logic.
 */
import type { Prisma, User as PrismaUser, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

type CreateUserInput = Prisma.UserCreateInput;
type UpdateUserInput = Prisma.UserUpdateInput;

export class UserRepository {
  async create(data: CreateUserInput): Promise<PrismaUser> {
    return prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  // For future normalized design, this method name conveys intent that roles/permissions are included
  async findWithRolesById(id: string): Promise<PrismaUser | null> {
    // With array-columns, regular findUnique already includes roles/permissions
    // If normalized later, replace with include on relations
    return prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUserInput): Promise<PrismaUser> {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async findOnlineUsers(statuses: UserStatus[] = ['ONLINE', 'AWAY', 'BUSY']): Promise<PrismaUser[]> {
    return prisma.user.findMany({
      where: {
        status: {
          in: statuses,
        },
      },
      orderBy: { lastLoginAt: 'desc' },
    });
  }

  async findAll(): Promise<PrismaUser[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userRepository = new UserRepository();
