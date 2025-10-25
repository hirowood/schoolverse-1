/**
 * @file seed.ts
 * @description データベース初期データの投入
 * @created 2025-10-25
 * 
 * 【実行方法】
 * npm run prisma:seed
 * 
 * 【機能】
 * - デフォルトルーム（classroom, gallery, park）の作成
 * - テストユーザーの作成（開発環境のみ）
 */

import { PrismaClient, RoomType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * デフォルトルームの定義
 */
const DEFAULT_ROOMS = [
  {
    id: 'classroom-default',
    name: 'classroom',
    type: RoomType.CLASSROOM,
    maxUsers: 30,
    mapData: {
      width: 1600,
      height: 1200,
      tileSize: 32,
      walls: [
        { x: 0, y: 0, width: 1600, height: 32 },      // 上の壁
        { x: 0, y: 1168, width: 1600, height: 32 },   // 下の壁
        { x: 0, y: 0, width: 32, height: 1200 },      // 左の壁
        { x: 1568, y: 0, width: 32, height: 1200 },   // 右の壁
      ],
      spawnPoints: [
        { x: 800, y: 600 },
        { x: 400, y: 400 },
        { x: 1200, y: 400 },
      ],
    },
  },
  {
    id: 'gallery-default',
    name: 'gallery',
    type: RoomType.GALLERY,
    maxUsers: 50,
    mapData: {
      width: 2000,
      height: 1500,
      tileSize: 32,
      walls: [
        { x: 0, y: 0, width: 2000, height: 32 },
        { x: 0, y: 1468, width: 2000, height: 32 },
        { x: 0, y: 0, width: 32, height: 1500 },
        { x: 1968, y: 0, width: 32, height: 1500 },
      ],
      spawnPoints: [
        { x: 1000, y: 750 },
      ],
    },
  },
  {
    id: 'park-default',
    name: 'park',
    type: RoomType.PARK,
    maxUsers: 100,
    mapData: {
      width: 3200,
      height: 2400,
      tileSize: 32,
      walls: [
        { x: 0, y: 0, width: 3200, height: 32 },
        { x: 0, y: 2368, width: 3200, height: 32 },
        { x: 0, y: 0, width: 32, height: 2400 },
        { x: 3168, y: 0, width: 32, height: 2400 },
      ],
      spawnPoints: [
        { x: 1600, y: 1200 },
      ],
    },
  },
];

/**
 * テストユーザーの定義（開発環境のみ）
 */
const TEST_USERS = [
  {
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    passwordHash: '$2a$10$E3q9Z9Q9Z9Q9Z9Q9Z9Q9Zu', // password: "test1234"
  },
  {
    email: 'alice@example.com',
    username: 'alice',
    displayName: 'Alice',
    passwordHash: '$2a$10$E3q9Z9Q9Z9Q9Z9Q9Z9Q9Zu', // password: "test1234"
  },
  {
    email: 'bob@example.com',
    username: 'bob',
    displayName: 'Bob',
    passwordHash: '$2a$10$E3q9Z9Q9Z9Q9Z9Q9Z9Q9Zu', // password: "test1234"
  },
];

/**
 * メイン処理
 */
async function main() {
  console.log('🌱 Starting seed...');

  // 1. デフォルトルームの作成
  console.log('📍 Creating default rooms...');
  
  for (const room of DEFAULT_ROOMS) {
    const existing = await prisma.room.findFirst({
      where: { name: room.name },
    });

    if (existing) {
      console.log(`  ✓ Room "${room.name}" already exists, skipping.`);
      continue;
    }

    await prisma.room.create({
      data: room,
    });
    console.log(`  ✓ Created room: ${room.name}`);
  }

  // 2. テストユーザーの作成（開発環境のみ）
  if (process.env.NODE_ENV !== 'production') {
    console.log('👥 Creating test users...');
    
    for (const user of TEST_USERS) {
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existing) {
        console.log(`  ✓ User "${user.username}" already exists, skipping.`);
        continue;
      }

      await prisma.user.create({
        data: user,
      });
      console.log(`  ✓ Created user: ${user.username}`);
    }

    // 3. テストユーザーをデフォルトルームに追加
    console.log('🔗 Adding users to default rooms...');
    
    const classroom = await prisma.room.findFirst({
      where: { name: 'classroom' },
    });

    if (classroom) {
      for (const user of TEST_USERS) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          const existing = await prisma.roomMember.findUnique({
            where: {
              userId_roomId: {
                userId: dbUser.id,
                roomId: classroom.id,
              },
            },
          });

          if (!existing) {
            await prisma.roomMember.create({
              data: {
                userId: dbUser.id,
                roomId: classroom.id,
                positionX: 800,
                positionY: 600,
              },
            });
            console.log(`  ✓ Added ${user.username} to classroom`);
          }
        }
      }
    }
  }

  console.log('✅ Seed completed!');
}

/**
 * エラーハンドリング
 */
main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
