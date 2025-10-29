/**
 * @file list-users.ts
 * @description データベース内のユーザー一覧を表示するスクリプト
 * 
 * 実行方法:
 * ```bash
 * npx tsx scripts/list-users.ts
 * ```
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Listing all users...\n');
  
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          roomMemberships: true,
        },
      },
    },
  });
  
  if (users.length === 0) {
    console.log('❌ No users found');
    console.log('');
    console.log('Run "npx prisma db seed" to create test users');
    return;
  }
  
  console.log(`Found ${users.length} user(s):\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.displayName || 'Unknown'}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Room memberships: ${user._count.roomMemberships}`);
    console.log('');
  });
  
  // ルームメンバーシップの詳細
  console.log('📋 Room memberships:\n');
  
  for (const user of users) {
    const memberships = await prisma.roomMember.findMany({
      where: { userId: user.id },
      include: {
        room: {
          select: { id: true, name: true },
        },
      },
    });
    
    if (memberships.length > 0) {
      console.log(`${user.displayName || user.id}:`);
      memberships.forEach(m => {
        console.log(`  - ${m.room.name} (${m.room.id})`);
      });
      console.log('');
    }
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
