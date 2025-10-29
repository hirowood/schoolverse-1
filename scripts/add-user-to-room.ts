/**
 * @file add-user-to-room.ts
 * @description ユーザーを特定のルームに追加するスクリプト
 * 
 * 実行方法:
 * ```bash
 * npx tsx scripts/add-user-to-room.ts <userId> <roomId>
 * 
 * # 例: ユーザーをclassroomに追加
 * npx tsx scripts/add-user-to-room.ts user-123 classroom
 * ```
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ Usage: npx tsx scripts/add-user-to-room.ts <userId> <roomId>');
    console.error('');
    console.error('例:');
    console.error('  npx tsx scripts/add-user-to-room.ts user-123 classroom');
    process.exit(1);
  }
  
  const [userId, roomId] = args;
  
  console.log(`🔍 Checking user and room...`);
  
  // ユーザー存在確認
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    console.error(`❌ User not found: ${userId}`);
    process.exit(1);
  }
  
  // ルーム存在確認
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });
  
  if (!room) {
    console.error(`❌ Room not found: ${roomId}`);
    console.error('');
    console.error('Available rooms:');
    const rooms = await prisma.room.findMany({
      select: { id: true, name: true },
    });
    rooms.forEach(r => console.error(`  - ${r.id} (${r.name})`));
    process.exit(1);
  }
  
  // メンバーシップ確認
  const existing = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
  });
  
  if (existing) {
    console.log(`✅ User already member of room`);
    console.log(`   User: ${user.displayName || userId}`);
    console.log(`   Room: ${room.name} (${roomId})`);
    process.exit(0);
  }
  
  // メンバーシップ作成
  await prisma.roomMember.create({
    data: { userId, roomId },
  });
  
  console.log(`✅ Successfully added user to room`);
  console.log(`   User: ${user.displayName || userId} (${userId})`);
  console.log(`   Room: ${room.name} (${roomId})`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
