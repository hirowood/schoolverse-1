/**
 * @file reset-db.ts
 * @description データベースを完全にリセットするスクリプト
 * 
 * ⚠️ 警告: すべてのデータが削除されます！
 * 
 * 実行方法:
 * ```bash
 * npx tsx scripts/reset-db.ts
 * ```
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔴 データベースリセット開始...');
  console.log('⚠️  すべてのデータが削除されます！');
  console.log('');
  
  try {
    // 1. すべてのテーブルのデータを削除（外部キー制約を考慮した順序）
    console.log('🗑️  データ削除中...');
    
    await prisma.roomMember.deleteMany({});
    console.log('  ✓ RoomMember削除完了');
    
    await prisma.message.deleteMany({});
    console.log('  ✓ Message削除完了');
    
    await prisma.voiceCall.deleteMany({});
    console.log('  ✓ VoiceCall削除完了');
    
    await prisma.notebookPage.deleteMany({});
    console.log('  ✓ NotebookPage削除完了');
    
    await prisma.notebook.deleteMany({});
    console.log('  ✓ Notebook削除完了');
    
    await prisma.session.deleteMany({});
    console.log('  ✓ Session削除完了');
    
    await prisma.room.deleteMany({});
    console.log('  ✓ Room削除完了');
    
    await prisma.user.deleteMany({});
    console.log('  ✓ User削除完了');
    
    console.log('');
    console.log('✅ データベースリセット完了！');
    console.log('');
    console.log('次のステップ:');
    console.log('  npx prisma db seed');
    
  } catch (error) {
    console.error('❌ エラー:', error);
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
