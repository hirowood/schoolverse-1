/**
 * @file seed.ts
 * @description Prisma データベースシードスクリプト
 * 
 * デフォルトルームやテストデータを作成します。
 * 
 * 実行方法:
 * ```bash
 * npx prisma db seed
 * ```
 */

import { PrismaClient, RoomType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * デフォルトルームの作成
 */
async function seedRooms() {
  console.log('🏫 Creating default rooms...');
  
  const rooms = [
    {
      id: 'classroom',
      name: '教室',
      type: RoomType.CLASSROOM,
      maxUsers: 50,
      mapData: {
        width: 1600,
        height: 1200,
        spawnPoints: [
          { x: 800, y: 600 },
          { x: 400, y: 300 },
          { x: 1200, y: 300 },
        ],
        obstacles: [],
      },
    },
    {
      id: 'gallery',
      name: 'ギャラリー',
      type: RoomType.GALLERY,
      maxUsers: 30,
      mapData: {
        width: 2000,
        height: 1500,
        spawnPoints: [
          { x: 1000, y: 750 },
        ],
        obstacles: [],
      },
    },
    {
      id: 'park',
      name: '公園',
      type: RoomType.PARK,
      maxUsers: 100,
      mapData: {
        width: 3000,
        height: 2000,
        spawnPoints: [
          { x: 1500, y: 1000 },
        ],
        obstacles: [],
      },
    },
  ];
  
  for (const room of rooms) {
    const existing = await prisma.room.findUnique({
      where: { id: room.id },
    });
    
    if (existing) {
      console.log(`  ✓ Room "${room.name}" already exists`);
      continue;
    }
    
    await prisma.room.create({
      data: room,
    });
    
    console.log(`  ✓ Created room: "${room.name}" (${room.id})`);
  }
}

/**
 * テストユーザーの作成
 */
async function seedUsers() {
  console.log('👥 Creating test users...');
  
  const testUsers = [
    {
      id: 'test-user-1',
      email: 'test1@example.com',
      username: 'testuser1',
      passwordHash: '$2a$10$dummyhashfortesting1234567890', // ダミーハッシュ
      displayName: 'テストユーザー1',
      avatarUrl: null,
    },
    {
      id: 'test-user-2',
      email: 'test2@example.com',
      username: 'testuser2',
      passwordHash: '$2a$10$dummyhashfortesting1234567890', // ダミーハッシュ
      displayName: 'テストユーザー2',
      avatarUrl: null,
    },
  ];
  
  for (const user of testUsers) {
    // IDで既存チェック
    const existingById = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    if (existingById) {
      console.log(`  ✓ User "${user.displayName}" already exists (by ID)`);
      continue;
    }
    
    // usernameで既存チェック
    const existingByUsername = await prisma.user.findUnique({
      where: { username: user.username },
    });
    
    if (existingByUsername) {
      console.log(`  ⚠ Username "${user.username}" already taken, skipping`);
      continue;
    }
    
    // emailで既存チェック
    const existingByEmail = await prisma.user.findUnique({
      where: { email: user.email },
    });
    
    if (existingByEmail) {
      console.log(`  ⚠ Email "${user.email}" already taken, skipping`);
      continue;
    }
    
    // 作成
    await prisma.user.create({
      data: user,
    });
    
    console.log(`  ✓ Created user: "${user.displayName}" (${user.id})`);
  }
}

/**
 * ルームメンバーシップの作成
 */
async function seedRoomMemberships() {
  console.log('🔗 Creating room memberships...');
  
  const memberships = [
    { userId: 'test-user-1', roomId: 'classroom' },
    { userId: 'test-user-1', roomId: 'gallery' },
    { userId: 'test-user-1', roomId: 'park' },
    { userId: 'test-user-2', roomId: 'classroom' },
    { userId: 'test-user-2', roomId: 'gallery' },
  ];
  
  for (const membership of memberships) {
    // ユーザーの存在確認（外部キー制約エラーを防ぐ）
    const user = await prisma.user.findUnique({
      where: { id: membership.userId },
    });
    
    if (!user) {
      console.log(`  ⚠ User ${membership.userId} not found, skipping membership`);
      continue;
    }
    
    // ルームの存在確認
    const room = await prisma.room.findUnique({
      where: { id: membership.roomId },
    });
    
    if (!room) {
      console.log(`  ⚠ Room ${membership.roomId} not found, skipping membership`);
      continue;
    }
    
    // 既存メンバーシップ確認
    const existing = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: membership.userId,
          roomId: membership.roomId,
        },
      },
    });
    
    if (existing) {
      console.log(`  ✓ Membership already exists: ${membership.userId} -> ${membership.roomId}`);
      continue;
    }
    
    // メンバーシップ作成
    await prisma.roomMember.create({
      data: membership,
    });
    
    console.log(`  ✓ Created membership: ${membership.userId} -> ${membership.roomId}`);
  }
}

/**
 * メインシード関数
 */
async function main() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    await seedRooms();
    await seedUsers();
    await seedRoomMemberships();
    
    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
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
