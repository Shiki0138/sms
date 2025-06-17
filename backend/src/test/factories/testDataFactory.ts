import { faker } from '@faker-js/faker/locale/ja';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TestDataFactory {
  /**
   * 🏆 美容室テスト用の高品質データ生成
   * 美容室業界に特化したリアルなテストデータを作成
   */

  // 美容室向け顧客セグメント生成
  static generateCustomerSegment(): string {
    const segments = ['VIP', 'REGULAR', 'NEW', 'CHURNED'];
    return faker.helpers.arrayElement(segments);
  }

  // 美容室サービスメニュー生成
  static generateSalonService(): string {
    const services = [
      'カット', 'カラー', 'パーマ', 'ストレート', 'トリートメント',
      'ヘッドスパ', 'セット', 'まつげエクステ', 'ネイル', 'アイブロウ'
    ];
    return faker.helpers.arrayElement(services);
  }

  // テスト用顧客データ生成
  static async createTestCustomer(tenantId: string, overrides: any = {}) {
    const segment = this.generateCustomerSegment();
    const visitCount = faker.number.int({ min: 1, max: 50 });
    const lifetimeValue = visitCount * faker.number.int({ min: 3000, max: 15000 });

    return await prisma.customer.create({
      data: {
        tenantId,
        name: faker.person.fullName(),
        nameKana: faker.person.fullName(),
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        birthDate: faker.date.between({ from: '1970-01-01', to: '2005-01-01' }),
        phone: faker.phone.number('090-####-####'),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        firstVisitDate: faker.date.past({ years: 2 }),
        lastVisitDate: faker.date.recent({ days: 30 }),
        visitCount,
        totalSpent: lifetimeValue,
        segment,
        lifetimeValue,
        riskScore: faker.number.int({ min: 0, max: 100 }),
        notes: `${segment}顧客。${this.generateSalonService()}を好む。`,
        ...overrides
      }
    });
  }

  // テスト用予約データ生成
  static async createTestReservation(tenantId: string, customerId?: string, staffId?: string, overrides: any = {}) {
    const startTime = faker.date.future({ days: 30 });
    const duration = faker.number.int({ min: 60, max: 240 }); // 1-4 hours
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const totalAmount = faker.number.int({ min: 3000, max: 15000 });

    return await prisma.reservation.create({
      data: {
        tenantId,
        customerId,
        staffId,
        startTime,
        endTime,
        menuContent: this.generateSalonService(),
        customerName: faker.person.fullName(),
        customerPhone: faker.phone.number('090-####-####'),
        source: faker.helpers.arrayElement(['HOTPEPPER', 'GOOGLE_CALENDAR', 'PHONE', 'WALK_IN']),
        status: faker.helpers.arrayElement(['CONFIRMED', 'TENTATIVE', 'COMPLETED']),
        totalAmount,
        estimatedDuration: duration,
        profitMargin: faker.number.float({ min: 0.2, max: 0.7 }),
        weatherImpact: faker.helpers.arrayElement(['SUNNY', 'RAINY', 'CLOUDY']),
        sourceCampaign: faker.helpers.arrayElement(['春キャンペーン', '新規限定', 'リピーター特典']),
        ...overrides
      }
    });
  }

  // テスト用メッセージスレッド生成
  static async createTestMessageThread(tenantId: string, customerId: string, overrides: any = {}) {
    const sentimentScore = faker.number.float({ min: -1, max: 1 });
    const priorityLevel = sentimentScore < -0.5 ? 1 : sentimentScore > 0.5 ? 3 : 2;

    return await prisma.messageThread.create({
      data: {
        tenantId,
        customerId,
        channel: faker.helpers.arrayElement(['INSTAGRAM', 'LINE']),
        channelThreadId: faker.string.uuid(),
        status: faker.helpers.arrayElement(['OPEN', 'IN_PROGRESS', 'CLOSED']),
        unreadCount: faker.number.int({ min: 0, max: 5 }),
        aiAnalyzed: faker.datatype.boolean(),
        sentimentScore,
        priorityLevel,
        autoReplyEnabled: faker.datatype.boolean(),
        ...overrides
      }
    });
  }

  // テスト用顧客プリファレンス生成
  static async createTestCustomerPreference(customerId: string, tenantId: string, overrides: any = {}) {
    const categories = ['service', 'staff', 'time', 'communication'];
    const category = faker.helpers.arrayElement(categories);
    
    const preferenceValues = {
      service: ['カット重視', 'カラー重視', 'トリートメント重視'],
      staff: ['ベテラン希望', '若手希望', '指名なし'],
      time: ['午前希望', '午後希望', '夕方希望'],
      communication: ['LINE希望', 'Instagram希望', '電話希望']
    };

    return await prisma.customerPreference.create({
      data: {
        customerId,
        tenantId,
        category,
        preferenceValue: faker.helpers.arrayElement(preferenceValues[category as keyof typeof preferenceValues]),
        confidenceScore: faker.number.float({ min: 0.5, max: 1.0 }),
        ...overrides
      }
    });
  }

  // テスト用スタッフパフォーマンス生成
  static async createTestStaffPerformance(staffId: string, tenantId: string, overrides: any = {}) {
    const appointmentsCount = faker.number.int({ min: 20, max: 100 });
    const revenueGenerated = appointmentsCount * faker.number.int({ min: 5000, max: 12000 });

    return await prisma.staffPerformance.create({
      data: {
        staffId,
        tenantId,
        month: faker.date.recent({ days: 90 }),
        appointmentsCount,
        revenueGenerated,
        customerSatisfaction: faker.number.float({ min: 3.5, max: 5.0 }),
        upsellRate: faker.number.float({ min: 0.1, max: 0.5 }),
        repeatRate: faker.number.float({ min: 0.6, max: 0.9 }),
        avgServiceTime: faker.number.int({ min: 90, max: 180 }),
        ...overrides
      }
    });
  }

  // 大量テストデータ生成（負荷テスト用）
  static async generateMassTestData(tenantId: string, options: {
    customers?: number;
    reservations?: number;
    messageThreads?: number;
    preferences?: number;
  } = {}) {
    const {
      customers = 1000,
      reservations = 5000,
      messageThreads = 2000,
      preferences = 3000
    } = options;

    console.log(`🚀 美容室システム負荷テスト用データ生成開始...`);
    
    // バッチサイズを設定して大量データを効率的に生成
    const batchSize = 100;
    
    // 顧客データ生成
    console.log(`📊 ${customers}件の顧客データ生成中...`);
    for (let i = 0; i < customers; i += batchSize) {
      const batch = [];
      for (let j = 0; j < Math.min(batchSize, customers - i); j++) {
        batch.push(this.createTestCustomer(tenantId));
      }
      await Promise.all(batch);
      
      if (i % 500 === 0) {
        console.log(`  ✅ ${i + batch.length}/${customers} 顧客データ完了`);
      }
    }

    // 作成された顧客IDを取得
    const customerIds = await prisma.customer.findMany({
      where: { tenantId },
      select: { id: true }
    });

    // 予約データ生成
    console.log(`📅 ${reservations}件の予約データ生成中...`);
    for (let i = 0; i < reservations; i += batchSize) {
      const batch = [];
      for (let j = 0; j < Math.min(batchSize, reservations - i); j++) {
        const customerId = faker.helpers.arrayElement(customerIds).id;
        batch.push(this.createTestReservation(tenantId, customerId));
      }
      await Promise.all(batch);
      
      if (i % 1000 === 0) {
        console.log(`  ✅ ${i + batch.length}/${reservations} 予約データ完了`);
      }
    }

    // メッセージスレッド生成
    console.log(`💬 ${messageThreads}件のメッセージスレッド生成中...`);
    for (let i = 0; i < messageThreads; i += batchSize) {
      const batch = [];
      for (let j = 0; j < Math.min(batchSize, messageThreads - i); j++) {
        const customerId = faker.helpers.arrayElement(customerIds).id;
        batch.push(this.createTestMessageThread(tenantId, customerId));
      }
      await Promise.all(batch);
      
      if (i % 500 === 0) {
        console.log(`  ✅ ${i + batch.length}/${messageThreads} メッセージ完了`);
      }
    }

    // 顧客プリファレンス生成
    console.log(`🎯 ${preferences}件の顧客プリファレンス生成中...`);
    for (let i = 0; i < preferences; i += batchSize) {
      const batch = [];
      for (let j = 0; j < Math.min(batchSize, preferences - i); j++) {
        const customerId = faker.helpers.arrayElement(customerIds).id;
        batch.push(this.createTestCustomerPreference(customerId, tenantId));
      }
      await Promise.all(batch);
      
      if (i % 500 === 0) {
        console.log(`  ✅ ${i + batch.length}/${preferences} プリファレンス完了`);
      }
    }

    console.log(`🎉 美容室システム負荷テスト用データ生成完了！`);
    console.log(`   👥 顧客: ${customers}件`);
    console.log(`   📅 予約: ${reservations}件`);
    console.log(`   💬 メッセージ: ${messageThreads}件`);
    console.log(`   🎯 プリファレンス: ${preferences}件`);
  }

  // テストデータクリーンアップ
  static async cleanupTestData(tenantId: string) {
    console.log('🧹 テストデータクリーンアップ中...');
    
    await Promise.all([
      prisma.customerPreference.deleteMany({ where: { tenantId } }),
      prisma.staffPerformance.deleteMany({ where: { tenantId } }),
      prisma.marketingCampaign.deleteMany({ where: { tenantId } }),
      prisma.messageThread.deleteMany({ where: { tenantId } }),
      prisma.reservation.deleteMany({ where: { tenantId } }),
      prisma.customer.deleteMany({ where: { tenantId } })
    ]);
    
    console.log('✅ テストデータクリーンアップ完了');
  }
}

export default TestDataFactory;