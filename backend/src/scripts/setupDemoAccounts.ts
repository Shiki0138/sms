import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupDemoAccounts() {
  console.log('🚀 デモアカウントのセットアップを開始します...');

  try {
    // デモ用テナントの作成または取得
    let demoTenant = await prisma.tenant.findFirst({
      where: { name: 'Salon Demo' }
    });

    if (!demoTenant) {
      demoTenant = await prisma.tenant.create({
        data: {
          name: 'Salon Demo',
          plan: 'premium_ai',
          isActive: true,
          address: '東京都渋谷区神宮前1-1-1',
          phone: '03-1234-5678',
          email: 'info@salon-demo.com',
        },
      });
      console.log('✅ デモテナントを作成しました');
    } else {
      console.log('ℹ️  デモテナントは既に存在します');
    }

    // デモアカウントの設定
    const demoAccounts = [
      {
        email: 'admin@salon-demo.com',
        password: 'Demo2024!',
        name: 'デモ管理者',
        role: 'ADMIN' as const,
      },
      {
        email: 'staff@salon-demo.com',
        password: 'Staff2024!',
        name: 'デモスタッフ',
        role: 'STAFF' as const,
      },
      {
        email: 'test@salon-demo.com',
        password: 'Test2024!',
        name: 'テストユーザー',
        role: 'STAFF' as const,
      },
    ];

    // 各アカウントの作成または更新
    for (const account of demoAccounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      const existingStaff = await prisma.staff.findUnique({
        where: { email: account.email }
      });

      if (existingStaff) {
        // 既存のアカウントを更新
        await prisma.staff.update({
          where: { email: account.email },
          data: {
            password: hashedPassword,
            name: account.name,
            role: account.role,
            isActive: true,
            loginAttempts: 0,
            lockedUntil: null,
            tenantId: demoTenant.id,
          },
        });
        console.log(`✅ ${account.email} を更新しました`);
      } else {
        // 新規アカウントを作成
        await prisma.staff.create({
          data: {
            email: account.email,
            password: hashedPassword,
            name: account.name,
            role: account.role,
            isActive: true,
            tenantId: demoTenant.id,
          },
        });
        console.log(`✅ ${account.email} を作成しました`);
      }
    }

    console.log('\n🎉 デモアカウントのセットアップが完了しました！');
    console.log('\n以下のアカウントでログインできます:');
    console.log('=====================================');
    demoAccounts.forEach((account) => {
      console.log(`📧 メール: ${account.email}`);
      console.log(`🔑 パスワード: ${account.password}`);
      console.log(`👤 役割: ${account.role}`);
      console.log('-------------------------------------');
    });

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
if (require.main === module) {
  setupDemoAccounts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { setupDemoAccounts };