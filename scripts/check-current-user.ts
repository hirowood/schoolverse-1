/**
 * @file check-current-user.ts
 * @description 現在アクティブなセッションを確認するスクリプト
 * 
 * 実行方法:
 * ```bash
 * npx tsx scripts/check-current-user.ts
 * ```
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 アクティブなセッションを確認中...\n');
  
  // 有効期限内のセッションを取得
  const activeSessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      User: {
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          status: true,
          lastLoginAt: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  
  if (activeSessions.length === 0) {
    console.log('❌ アクティブなセッションが見つかりません');
    console.log('');
    console.log('アプリにログインしてから再度実行してください。');
    return;
  }
  
  console.log(`✅ ${activeSessions.length}個のアクティブセッションが見つかりました:\n`);
  
  activeSessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.User.displayName || session.User.username}`);
    console.log(`   ユーザーID: ${session.User.id}`);
    console.log(`   Username: ${session.User.username}`);
    console.log(`   Email: ${session.User.email}`);
    console.log(`   Status: ${session.User.status}`);
    console.log(`   最終ログイン: ${session.User.lastLoginAt?.toLocaleString('ja-JP') || 'N/A'}`);
    console.log(`   セッション有効期限: ${session.expiresAt.toLocaleString('ja-JP')}`);
    console.log('');
  });
  
  // ルームメンバーシップを確認
  console.log('📋 ルームメンバーシップ:\n');
  
  for (const session of activeSessions) {
    const memberships = await prisma.roomMember.findMany({
      where: { userId: session.User.id },
      include: {
        Room: {
          select: { id: true, name: true, type: true },
        },
      },
    });
    
    console.log(`${session.User.displayName || session.User.username}:`);
    if (memberships.length === 0) {
      console.log('  ⚠️ ルームに参加していません');
      console.log('');
      console.log('  ルームに追加するには:');
      console.log(`  npx tsx scripts/add-user-to-room.ts ${session.User.id} classroom`);
    } else {
      memberships.forEach(m => {
        console.log(`  ✓ ${m.Room.name} (${m.Room.id})`);
      });
    }
    console.log('');
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
