import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMenus() {
  console.log('🌱 メニューデータのシード開始...');

  try {
    // デフォルトテナントIDを取得
    const defaultTenant = await prisma.tenant.findFirst();
    if (!defaultTenant) {
      console.error('❌ デフォルトテナントが見つかりません');
      return;
    }

    const tenantId = defaultTenant.id;

    // カテゴリーの作成
    const categories = [
      { name: 'カット', displayOrder: 1 },
      { name: 'カラー', displayOrder: 2 },
      { name: 'パーマ', displayOrder: 3 },
      { name: 'トリートメント', displayOrder: 4 },
      { name: 'ヘッドスパ', displayOrder: 5 },
      { name: 'セット・ブロー', displayOrder: 6 },
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.menuCategory.upsert({
        where: {
          tenantId_name: {
            tenantId,
            name: category.name,
          },
        },
        update: {},
        create: {
          ...category,
          tenantId,
        },
      });
      createdCategories.push(created);
      console.log(`✅ カテゴリー作成: ${created.name}`);
    }

    // メニューの作成
    const menus = [
      // カット
      {
        name: 'カット',
        description: 'スタイリストによる基本カット',
        price: 4000,
        duration: 60,
        categoryName: 'カット',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 95,
      },
      {
        name: '前髪カット',
        description: '前髪のみのカット',
        price: 1500,
        duration: 20,
        categoryName: 'カット',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 70,
      },
      {
        name: 'メンズカット',
        description: '男性向けのスタイリッシュカット',
        price: 3500,
        duration: 45,
        categoryName: 'カット',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'MALE',
        popularity: 85,
      },

      // カラー
      {
        name: 'ワンカラー',
        description: '全体を一色で染めるベーシックカラー',
        price: 6000,
        duration: 90,
        categoryName: 'カラー',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 90,
      },
      {
        name: 'ハイライト',
        description: '立体感を演出するハイライトカラー',
        price: 8500,
        duration: 120,
        categoryName: 'カラー',
        seasonality: 'SPRING',
        ageGroup: 'TWENTIES',
        genderTarget: 'ALL',
        popularity: 75,
      },
      {
        name: 'グラデーション',
        description: 'トレンドのグラデーションカラー',
        price: 9500,
        duration: 150,
        categoryName: 'カラー',
        seasonality: 'SUMMER',
        ageGroup: 'TWENTIES',
        genderTarget: 'FEMALE',
        popularity: 80,
      },
      {
        name: 'リタッチ',
        description: '根元のみのカラーリング',
        price: 4500,
        duration: 60,
        categoryName: 'カラー',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 88,
      },

      // パーマ
      {
        name: 'デジタルパーマ',
        description: '持ちの良いデジタルパーマ',
        price: 12000,
        duration: 180,
        categoryName: 'パーマ',
        seasonality: 'AUTUMN',
        ageGroup: 'THIRTIES',
        genderTarget: 'FEMALE',
        popularity: 65,
      },
      {
        name: 'コールドパーマ',
        description: 'ナチュラルなウェーブのコールドパーマ',
        price: 8000,
        duration: 120,
        categoryName: 'パーマ',
        seasonality: 'SPRING',
        ageGroup: 'ALL',
        genderTarget: 'FEMALE',
        popularity: 60,
      },
      {
        name: 'ポイントパーマ',
        description: '部分的なパーマでアクセント',
        price: 5500,
        duration: 90,
        categoryName: 'パーマ',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 45,
      },

      // トリートメント
      {
        name: 'システムトリートメント',
        description: '集中補修システムトリートメント',
        price: 5000,
        duration: 45,
        categoryName: 'トリートメント',
        seasonality: 'WINTER',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 82,
      },
      {
        name: 'オイルトリートメント',
        description: '髪に潤いを与えるオイルトリートメント',
        price: 3500,
        duration: 30,
        categoryName: 'トリートメント',
        seasonality: 'WINTER',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 78,
      },
      {
        name: 'ケラチントリートメント',
        description: '髪質改善ケラチントリートメント',
        price: 8000,
        duration: 90,
        categoryName: 'トリートメント',
        seasonality: 'ALL',
        ageGroup: 'THIRTIES',
        genderTarget: 'ALL',
        popularity: 70,
      },

      // ヘッドスパ
      {
        name: 'リラクゼーションスパ',
        description: '極上のリラクゼーション体験',
        price: 4500,
        duration: 60,
        categoryName: 'ヘッドスパ',
        seasonality: 'ALL',
        ageGroup: 'THIRTIES',
        genderTarget: 'ALL',
        popularity: 85,
      },
      {
        name: 'スカルプケアスパ',
        description: '頭皮環境を整えるスカルプケア',
        price: 5500,
        duration: 75,
        categoryName: 'ヘッドスパ',
        seasonality: 'ALL',
        ageGroup: 'FORTIES_PLUS',
        genderTarget: 'ALL',
        popularity: 75,
      },
      {
        name: 'クイックスパ',
        description: '短時間で癒されるクイックスパ',
        price: 2500,
        duration: 30,
        categoryName: 'ヘッドスパ',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 68,
      },

      // セット・ブロー
      {
        name: 'ブロー',
        description: '基本のブローセット',
        price: 2000,
        duration: 30,
        categoryName: 'セット・ブロー',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'ALL',
        popularity: 60,
      },
      {
        name: 'アップセット',
        description: '特別な日のアップスタイル',
        price: 3500,
        duration: 45,
        categoryName: 'セット・ブロー',
        seasonality: 'ALL',
        ageGroup: 'ALL',
        genderTarget: 'FEMALE',
        popularity: 55,
      },
      {
        name: 'ハーフアップセット',
        description: 'エレガントなハーフアップスタイル',
        price: 3000,
        duration: 40,
        categoryName: 'セット・ブロー',
        seasonality: 'ALL',
        ageGroup: 'TWENTIES',
        genderTarget: 'FEMALE',
        popularity: 50,
      },
    ];

    const createdMenus = [];
    for (const menu of menus) {
      const category = createdCategories.find(c => c.name === menu.categoryName);
      if (!category) {
        console.error(`❌ カテゴリー「${menu.categoryName}」が見つかりません`);
        continue;
      }

      // 既存チェック
      const existing = await prisma.menu.findFirst({
        where: {
          name: menu.name,
          tenantId,
        },
      });

      if (existing) {
        console.log(`⏭️  メニュー「${menu.name}」は既に存在します`);
        continue;
      }

      const created = await prisma.menu.create({
        data: {
          name: menu.name,
          description: menu.description,
          price: menu.price,
          duration: menu.duration,
          categoryId: category.id,
          seasonality: menu.seasonality as any,
          ageGroup: menu.ageGroup as any,
          genderTarget: menu.genderTarget as any,
          popularity: menu.popularity,
          tenantId,
        },
      });
      createdMenus.push(created);
      console.log(`✅ メニュー作成: ${created.name} (¥${created.price})`);
    }

    console.log(`🎉 シード完了: ${createdCategories.length}カテゴリー、${createdMenus.length}メニューを作成しました`);

  } catch (error) {
    console.error('❌ シードエラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  seedMenus();
}

export { seedMenus };