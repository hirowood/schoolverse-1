/**
 * @file setup-dev-env.ts
 * @description 開発環境を一括セットアップするスクリプト
 * 
 * 実行方法:
 * ```bash
 * npx tsx scripts/setup-dev-env.ts
 * ```
 * 
 * このスクリプトは以下を実行します:
 * 1. データベースリセット（データ削除）
 * 2. シード実行（テストデータ作成）
 * 3. 結果確認
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔴 ステップ1: データベースリセット');
  console.log('⚠️  すべてのデータが削除されます！');
  console.log('');
  
  try {
    await prisma.roomMember.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.voiceCall.deleteMany({});
    await prisma.notebookPage.deleteMany({});
    await prisma.notebook.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ データベースリセット完了\n');
  } catch (error) {
    console.error('❌ リセット失敗:', error);
    throw error;
  }
}

async function runSeed() {
  console.log('🌱 ステップ2: シード実行\n');
  
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('\n✅ シード実行完了\n');
  } catch (error) {
    console.error('❌ シード失敗:', error);
    throw error;
  }
}

async function verifySetup() {
  console.log('🔍 ステップ3: セットアップ確認\n');
  
  // ユーザー数確認
  const userCount = await prisma.user.count();
  console.log(`  Users: ${userCount}`);
  
  // ルーム数確認
  const roomCount = await prisma.room.count();
  console.log(`  Rooms: ${roomCount}`);
  
  // メンバーシップ数確認
  const membershipCount = await prisma.roomMember.count();
  console.log(`  Memberships: ${membershipCount}`);
  
  console.log('');
  
  // テストユーザーの詳細
  const testUser1 = await prisma.user.findUnique({
    where: { id: 'test-user-1' },
    include: {
      roomMemberships: {
        include: {
          Room: {
            select: { name: true },
          },
        },
      },
    },
  });
  
  if (testUser1) {
    console.log('✅ テストユーザー1:');
    console.log(`   ID: ${testUser1.id}`);
    console.log(`   Username: ${testUser1.username}`);
    console.log(`   Email: ${testUser1.email}`);
    console.log(`   ルーム: ${testUser1.roomMemberships.map(m => m.Room.name).join(', ')}`);
    console.log('');
  }
  
  console.log('✅ セットアップ完了！');
  console.log('');
  console.log('📝 次のステップ:');
  console.log('  1. npm run dev でサーバーを起動');
  console.log('  2. ブラウザでログイン');
  console.log('  3. ログイン後、以下を実行してルームに参加:');
  console.log('     npx tsx scripts/check-current-user.ts');
  console.log('');
}

async function main() {
  console.log('🚀 開発環境セットアップ開始\n');
  console.log('=' .repeat(60));
  console.log('');
  
  try {
    await resetDatabase();
    await runSeed();
    await verifySetup();
    
    console.log('=' .repeat(60));
    console.log('🎉 すべて完了！');
    
  } catch (error) {
    console.error('\n❌ セットアップ失敗:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
