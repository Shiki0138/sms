// テストユーザー作成スクリプト
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// SQLite用のPrismaクライアント設定
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(__dirname, '../prisma/data/production.db')}`
    }
  }
});

async function createTestData() {
  try {
    console.log('🚀 テストデータの作成を開始します...');
    
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const viewerPassword = await bcrypt.hash('DemoView2024!', 10);
    const adminPassword = await bcrypt.hash('Admin2024!', 10);

    // 1. 店舗データの作成 (Tenant モデル)
    console.log('📍 店舗データを作成中...');
    const salon1 = await prisma.tenant.upsert({
      where: { id: 'salon1' },
      update: {},
      create: {
        id: 'salon1',
        name: 'Beauty Salon TOKYO 渋谷店',
        plan: 'premium_ai',
        phone: '03-1234-5678',
        address: '東京都渋谷区道玄坂1-2-3',
        email: 'info@beauty-tokyo.jp',
        isActive: true
      }
    });

    const salon2 = await prisma.tenant.upsert({
      where: { id: 'salon2' },
      update: {},
      create: {
        id: 'salon2',
        name: 'Hair Studio Osaka 心斎橋',
        plan: 'standard',
        phone: '06-2345-6789',
        address: '大阪府大阪市中央区心斎橋筋2-3-4',
        email: 'info@hair-osaka.jp',
        isActive: true
      }
    });
    
    console.log('✅ 店舗データ作成完了');

    // 2. テストユーザー（スタッフ）の作成
    console.log('👥 スタッフアカウントを作成中...');
    
    // システム管理者
    await prisma.staff.upsert({
      where: { email: 'system@beauty-salon.jp' },
      update: { password: adminPassword },
      create: {
        id: 'system-admin',
        tenantId: 'salon1',
        email: 'system@beauty-salon.jp',
        password: adminPassword,
        name: 'システム管理者',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    // 東京店舗スタッフ
    const tokyoStaff = [
      {
        id: 'staff1',
        email: 'admin@beauty-tokyo.jp',
        name: '山田太郎（オーナー）',
        role: 'ADMIN'
      },
      {
        id: 'staff2',
        email: 'manager@beauty-tokyo.jp',
        name: '佐藤美咲（店長）',
        role: 'MANAGER'
      },
      {
        id: 'staff3',
        email: 'stylist1@beauty-tokyo.jp',
        name: '田中優子（チーフ）',
        role: 'STAFF'
      },
      {
        id: 'staff4',
        email: 'stylist2@beauty-tokyo.jp',
        name: '伊藤健太',
        role: 'STAFF'
      },
      {
        id: 'staff5',
        email: 'stylist3@beauty-tokyo.jp',
        name: '高橋あゆみ',
        role: 'STAFF'
      }
    ];

    for (const staff of tokyoStaff) {
      await prisma.staff.upsert({
        where: { email: staff.email },
        update: { password: hashedPassword },
        create: {
          ...staff,
          tenantId: 'salon1',
          password: hashedPassword,
          isActive: true
        }
      });
    }

    // 大阪店舗スタッフ
    const osakaStaff = [
      {
        id: 'staff6',
        email: 'admin@hair-osaka.jp',
        name: '鈴木花子（オーナー）',
        role: 'ADMIN'
      },
      {
        id: 'staff7',
        email: 'manager@hair-osaka.jp',
        name: '木村大輔（店長）',
        role: 'MANAGER'
      },
      {
        id: 'staff8',
        email: 'stylist1@hair-osaka.jp',
        name: '中村さくら',
        role: 'STAFF'
      },
      {
        id: 'staff9',
        email: 'stylist2@hair-osaka.jp',
        name: '小林翔太',
        role: 'STAFF'
      },
      {
        id: 'staff10',
        email: 'stylist3@hair-osaka.jp',
        name: '渡辺美穂',
        role: 'STAFF'
      }
    ];

    for (const staff of osakaStaff) {
      await prisma.staff.upsert({
        where: { email: staff.email },
        update: { password: hashedPassword },
        create: {
          ...staff,
          tenantId: 'salon2',
          password: hashedPassword,
          isActive: true
        }
      });
    }

    // 閲覧専用アカウント
    await prisma.staff.upsert({
      where: { email: 'viewer@demo.beauty-salon.jp' },
      update: { password: viewerPassword },
      create: {
        id: 'viewer1',
        tenantId: 'salon1',
        email: 'viewer@demo.beauty-salon.jp',
        password: viewerPassword,
        name: 'デモユーザー（閲覧専用）',
        role: 'STAFF',  // viewerロールがない場合はSTAFFで作成
        isActive: true
      }
    });

    console.log('✅ スタッフアカウント作成完了');

    // 3. サンプル顧客データの作成（オプション）
    console.log('👤 サンプル顧客データを作成中...');
    const sampleCustomers = [
      {
        name: '山田花子',
        email: 'hanako@example.com',
        phone: '090-1111-2222',
        tenantId: 'salon1'
      },
      {
        name: '佐藤次郎',
        email: 'jiro@example.com',
        phone: '090-3333-4444',
        tenantId: 'salon1'
      },
      {
        name: '鈴木美優',
        email: 'miyu@example.com',
        phone: '090-5555-6666',
        tenantId: 'salon2'
      }
    ];

    for (const customer of sampleCustomers) {
      await prisma.customer.create({
        data: customer
      }).catch(() => {
        // 既に存在する場合はスキップ
      });
    }

    console.log('✅ 全てのテストデータの作成が完了しました！');
    
    console.log('\n=====================================');
    console.log('📋 ログイン情報一覧');
    console.log('=====================================\n');
    
    console.log('【システム管理者】');
    console.log('  メール: system@beauty-salon.jp');
    console.log('  パスワード: Admin2024!\n');
    
    console.log('【通常アカウント（共通パスワード: Test1234!）】');
    console.log('\n東京店舗:');
    console.log('  - admin@beauty-tokyo.jp (管理者)');
    console.log('  - manager@beauty-tokyo.jp (マネージャー)');
    console.log('  - stylist1@beauty-tokyo.jp (スタイリスト)');
    console.log('  - stylist2@beauty-tokyo.jp (スタイリスト)');
    console.log('  - stylist3@beauty-tokyo.jp (スタイリスト)');
    
    console.log('\n大阪店舗:');
    console.log('  - admin@hair-osaka.jp (管理者)');
    console.log('  - manager@hair-osaka.jp (マネージャー)');
    console.log('  - stylist1@hair-osaka.jp (スタイリスト)');
    console.log('  - stylist2@hair-osaka.jp (スタイリスト)');
    console.log('  - stylist3@hair-osaka.jp (スタイリスト)');
    
    console.log('\n【閲覧専用アカウント】');
    console.log('  メール: viewer@demo.beauty-salon.jp');
    console.log('  パスワード: DemoView2024!');
    console.log('\n=====================================\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
createTestData()
  .then(() => {
    console.log('✨ スクリプトが正常に完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 スクリプトの実行に失敗しました:', error);
    process.exit(1);
  });