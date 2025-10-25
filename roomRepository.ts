/**
 * @file roomRepository.ts
 * @description Roomテーブルのデータアクセス層
 * @created 2025-10-25
 * 
 * 【機能】
 * - ルームの作成・取得・更新・削除
 * - ルーム参加権限の確認
 * - RoomMemberとの照合
 */

import type { Room, RoomMember, RoomType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

type CreateRoomInput = Prisma.RoomCreateInput;
type UpdateRoomInput = Prisma.RoomUpdateInput;

export class RoomRepository {
  // ============================================
  // ルーム管理
  // ============================================

  /**
   * ルームを作成
   */
  async create(data: CreateRoomInput): Promise<Room> {
    return prisma.room.create({ data });
  }

  /**
   * ルームIDで取得
   */
  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({ 
      where: { id },
      include: {
        RoomMember: true,
      },
    });
  }

  /**
   * ルーム名で取得
   */
  async findByName(name: string): Promise<Room | null> {
    return prisma.room.findFirst({ 
      where: { name },
    });
  }

  /**
   * タイプでルーム一覧を取得
   */
  async findByType(type: RoomType): Promise<Room[]> {
    return prisma.room.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * すべてのルームを取得
   */
  async findAll(): Promise<Room[]> {
    return prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ルームを更新
   */
  async update(id: string, data: UpdateRoomInput): Promise<Room> {
    return prisma.room.update({ 
      where: { id }, 
      data,
    });
  }

  /**
   * ルームを削除
   */
  async delete(id: string): Promise<void> {
    await prisma.room.delete({ where: { id } });
  }

  // ============================================
  // ルームメンバー管理
  // ============================================

  /**
   * ユーザーをルームに追加
   */
  async addMember(
    roomId: string, 
    userId: string, 
    positionX = 800, 
    positionY = 600
  ): Promise<RoomMember> {
    return prisma.roomMember.create({
      data: {
        roomId,
        userId,
        positionX,
        positionY,
      },
    });
  }

  /**
   * ユーザーをルームから削除
   */
  async removeMember(roomId: string, userId: string): Promise<void> {
    await prisma.roomMember.deleteMany({
      where: {
        roomId,
        userId,
      },
    });
  }

  /**
   * ルームのメンバー一覧を取得
   */
  async getMembers(roomId: string): Promise<RoomMember[]> {
    return prisma.roomMember.findMany({
      where: { roomId },
      include: {
        User: true,
      },
    });
  }

  /**
   * ユーザーのメンバーシップを取得
   */
  async findMembership(
    roomId: string, 
    userId: string
  ): Promise<RoomMember | null> {
    return prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
  }

  /**
   * メンバーの位置を更新
   */
  async updateMemberPosition(
    roomId: string, 
    userId: string, 
    positionX: number, 
    positionY: number
  ): Promise<RoomMember> {
    return prisma.roomMember.update({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
      data: {
        positionX,
        positionY,
      },
    });
  }

  // ============================================
  // 権限チェック
  // ============================================

  /**
   * ユーザーがルームに参加可能かチェック
   * 
   * @description
   * 以下の条件をチェックします：
   * 1. ルームが存在するか
   * 2. ルームが満員でないか
   * 3. ユーザーがすでにメンバーか（自動的に参加可能）
   * 
   * @returns true: 参加可能, false: 参加不可
   */
  async canJoinRoom(roomId: string, userId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // 1. ルームの存在確認
    const room = await this.findById(roomId);
    if (!room) {
      return { 
        allowed: false, 
        reason: 'ROOM_NOT_FOUND',
      };
    }

    // 2. 満員チェック
    const currentMembers = await this.getMembers(roomId);
    if (currentMembers.length >= room.maxUsers) {
      return { 
        allowed: false, 
        reason: 'ROOM_FULL',
      };
    }

    // 3. メンバーシップ確認（すでにメンバーならOK）
    const membership = await this.findMembership(roomId, userId);
    if (membership) {
      return { allowed: true };
    }

    // 4. デフォルトルーム（classroom, gallery, park）は誰でも参加可能
    const defaultRooms = ['classroom', 'gallery', 'park'];
    if (defaultRooms.includes(room.name.toLowerCase())) {
      return { allowed: true };
    }

    // 5. その他のルームは招待制（メンバーのみ）
    return { 
      allowed: false, 
      reason: 'ROOM_FORBIDDEN',
    };
  }

  /**
   * ユーザーがルームのメンバーかチェック
   */
  async isMember(roomId: string, userId: string): Promise<boolean> {
    const membership = await this.findMembership(roomId, userId);
    return membership !== null;
  }
}

// シングルトンインスタンス
export const roomRepository = new RoomRepository();
