// デモデータ投入スクリプト
// 実行: npm run load-demo-data

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { demoShowcaseData } from '../../../frontend/src/data/demoShowcaseData';

const prisma = new PrismaClient();

async function loadDemoData() {
  console.log('🚀 デモデータの投入を開始します...');

  try {
    // 1. デモサロンアカウントの作成
    console.log('📝 デモサロンアカウントを作成中...');
    const hashedPassword = await bcrypt.hash('Demo2024!', 10);
    
    const demoOwner = await prisma.owner.upsert({
      where: { email: 'demo@beautysalon-demo.jp' },
      update: {},
      create: {
        email: 'demo@beautysalon-demo.jp',
        password: hashedPassword,
        salonName: demoShowcaseData.salon.name,
        salonNameKana: demoShowcaseData.salon.nameKana,
        ownerName: 'デモ 太郎',
        ownerNameKana: 'デモ タロウ',
        phone: demoShowcaseData.salon.phone,
        prefecture: '東京都',
        isActive: true,
        subscriptionPlan: 'standard',
        subscriptionStatus: 'active',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14日後
      }
    });

    console.log('✅ デモサロンアカウント作成完了');

    // 2. スタッフデータの投入
    console.log('👥 スタッフデータを投入中...');
    const staffMap = new Map();

    for (const staff of demoShowcaseData.staff) {
      const createdStaff = await prisma.staff.create({
        data: {
          ownerId: demoOwner.id,
          name: staff.name,
          nameKana: staff.nameKana,
          role: staff.role,
          email: `${staff.id}@beautysalon-demo.jp`,
          isActive: true,
        }
      });
      staffMap.set(staff.id, createdStaff.id);
    }

    console.log(`✅ ${demoShowcaseData.staff.length}名のスタッフデータ投入完了`);

    // 3. 顧客データの投入
    console.log('👤 顧客データを投入中...');
    const customerMap = new Map();

    for (const customer of demoShowcaseData.customers) {
      const createdCustomer = await prisma.customer.create({
        data: {
          ownerId: demoOwner.id,
          name: customer.name,
          nameKana: customer.nameKana,
          phone: customer.phone,
          email: customer.email,
          gender: customer.gender,
          birthDate: customer.birthDate ? new Date(customer.birthDate) : null,
          address: customer.address,
          occupation: customer.occupation,
          notes: customer.notes,
          tags: customer.tags,
          visitCount: customer.visitCount,
          totalSpent: customer.totalSpent,
          lastVisit: customer.lastVisit ? new Date(customer.lastVisit) : null,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // 過去1年のランダムな日付
        }
      });
      customerMap.set(customer.id, createdCustomer.id);
    }

    console.log(`✅ ${demoShowcaseData.customers.length}名の顧客データ投入完了`);

    // 4. 施術履歴データの投入
    console.log('📋 施術履歴データを投入中...');
    let historyCount = 0;

    for (const history of demoShowcaseData.serviceHistory) {
      const customerId = customerMap.get(history.customerId);
      const staffId = staffMap.get(history.staffId);

      if (customerId && staffId) {
        await prisma.serviceHistory.create({
          data: {
            customerId: customerId,
            staffId: staffId,
            serviceDate: new Date(history.date),
            services: [history.menuContent],
            totalAmount: history.price,
            paymentMethod: 'cash',
            notes: history.notes,
            rating: history.rating ? Math.floor(history.rating) : 5,
            photos: history.afterImage ? [history.afterImage] : [],
          }
        });
        historyCount++;
      }
    }

    console.log(`✅ ${historyCount}件の施術履歴データ投入完了`);

    // 5. 予約データの投入
    console.log('📅 予約データを投入中...');
    let reservationCount = 0;

    for (const reservation of demoShowcaseData.reservations) {
      const customerId = customerMap.get(reservation.customerId);
      const staffId = staffMap.get(reservation.staffId);

      if (customerId && staffId) {
        const startDateTime = new Date(`${reservation.date}T${reservation.startTime}:00`);
        const endDateTime = new Date(`${reservation.date}T${reservation.endTime}:00`);

        await prisma.reservation.create({
          data: {
            customerId: customerId,
            staffId: staffId,
            startTime: startDateTime,
            endTime: endDateTime,
            services: [reservation.menuContent],
            status: reservation.status === 'completed' ? 'completed' : 
                    reservation.status === 'confirmed' ? 'confirmed' : 'pending',
            totalAmount: reservation.price,
            notes: reservation.notes,
            source: reservation.source,
          }
        });
        reservationCount++;
      }
    }

    console.log(`✅ ${reservationCount}件の予約データ投入完了`);

    // 6. メッセージ履歴の投入
    console.log('💬 メッセージ履歴を投入中...');
    let messageCount = 0;

    for (const message of demoShowcaseData.messages) {
      const customerId = customerMap.get(message.customerId);
      const staffId = message.staffId ? staffMap.get(message.staffId) : null;

      if (customerId) {
        await prisma.message.create({
          data: {
            customerId: customerId,
            staffId: staffId,
            direction: message.direction,
            channel: message.channel,
            content: message.content,
            sentAt: new Date(message.timestamp),
            read: message.read,
          }
        });
        messageCount++;
      }
    }

    console.log(`✅ ${messageCount}件のメッセージ履歴投入完了`);

    // 7. 本日の売上データを生成
    console.log('💰 本日の売上データを生成中...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 本日の完了済み予約から売上を計算
    const todaySales = await prisma.reservation.findMany({
      where: {
        startTime: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        status: 'completed'
      }
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    
    console.log(`✅ 本日の売上: ¥${todayRevenue.toLocaleString()}`);

    // 完了メッセージ
    console.log('\n🎉 デモデータの投入が完了しました！');
    console.log('=====================================');
    console.log('ログイン情報:');
    console.log('メールアドレス: demo@beautysalon-demo.jp');
    console.log('パスワード: Demo2024!');
    console.log('=====================================');
    console.log('\n投入されたデータ:');
    console.log(`- オーナーアカウント: 1件`);
    console.log(`- スタッフ: ${demoShowcaseData.staff.length}名`);
    console.log(`- 顧客: ${demoShowcaseData.customers.length}名`);
    console.log(`- 施術履歴: ${historyCount}件`);
    console.log(`- 予約: ${reservationCount}件`);
    console.log(`- メッセージ: ${messageCount}件`);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 既存データのクリア（オプション）
async function clearDemoData() {
  console.log('🗑️ 既存のデモデータをクリア中...');
  
  const demoOwner = await prisma.owner.findUnique({
    where: { email: 'demo@beautysalon-demo.jp' }
  });

  if (demoOwner) {
    // 関連データを削除
    await prisma.message.deleteMany({ where: { customer: { ownerId: demoOwner.id } } });
    await prisma.reservation.deleteMany({ where: { customer: { ownerId: demoOwner.id } } });
    await prisma.serviceHistory.deleteMany({ where: { customer: { ownerId: demoOwner.id } } });
    await prisma.customer.deleteMany({ where: { ownerId: demoOwner.id } });
    await prisma.staff.deleteMany({ where: { ownerId: demoOwner.id } });
    await prisma.owner.delete({ where: { id: demoOwner.id } });
    
    console.log('✅ 既存データのクリア完了');
  }
}

// メイン実行
async function main() {
  // コマンドライン引数でクリアオプションを確認
  const shouldClear = process.argv.includes('--clear');
  
  if (shouldClear) {
    await clearDemoData();
  }
  
  await loadDemoData();
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });