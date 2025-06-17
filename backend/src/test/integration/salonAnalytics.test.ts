import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../server';
import { testDb, testUtils } from '../setup';
import { TestDataFactory } from '../factories/testDataFactory';

describe('🏆 美容室分析機能統合テスト', () => {
  let testTenant: any;
  let testStaff: any;
  let testCustomers: any[] = [];

  beforeEach(async () => {
    // テスト環境のセットアップ
    testTenant = await testUtils.createTestTenant({
      name: '美容室テストサロン',
      plan: 'premium'
    });

    testStaff = await testUtils.createTestStaff(testTenant.id, {
      name: 'テスト美容師'
    });

    // テスト用顧客データを100件生成
    console.log('🎯 テスト用顧客データ生成中...');
    for (let i = 0; i < 100; i++) {
      const customer = await TestDataFactory.createTestCustomer(testTenant.id);
      testCustomers.push(customer);
      
      // 顧客プリファレンスも追加
      await TestDataFactory.createTestCustomerPreference(customer.id, testTenant.id);
    }

    console.log(`✅ ${testCustomers.length}件の顧客データ準備完了`);
  });

  afterEach(async () => {
    await TestDataFactory.cleanupTestData(testTenant.id);
  });

  describe('📊 顧客セグメント分析', () => {
    test('顧客セグメント分析が正常に動作する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/customer-segments')
        .query({ tenantId: testTenant.id })
        .expect(200);

      expect(response.body).toHaveProperty('segments');
      expect(response.body.segments).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('totalCustomers');
      expect(response.body.totalCustomers).toBeGreaterThanOrEqual(100);

      // セグメント別データの検証
      const segments = response.body.segments;
      expect(segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            segment: expect.stringMatching(/VIP|REGULAR|NEW|CHURNED/),
            count: expect.any(Number),
            avgLifetimeValue: expect.any(Number),
            avgVisitCount: expect.any(Number)
          })
        ])
      );
    });

    test('セグメント分析の応答時間が1秒以内', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v1/analytics/customer-segments')
        .query({ tenantId: testTenant.id })
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // 1秒以内
    });
  });

  describe('💰 収益分析', () => {
    test('月次収益分析が正確に計算される', async () => {
      // テスト用予約データを生成
      for (let i = 0; i < 50; i++) {
        const customer = testCustomers[Math.floor(Math.random() * testCustomers.length)];
        await TestDataFactory.createTestReservation(testTenant.id, customer.id, testStaff.id);
      }

      const response = await request(app)
        .get('/api/v1/analytics/revenue')
        .query({ 
          tenantId: testTenant.id,
          period: 'monthly'
        })
        .expect(200);

      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('monthlyData');
      expect(response.body.totalRevenue).toBeGreaterThan(0);
      expect(response.body.monthlyData).toBeInstanceOf(Array);
    });
  });

  describe('🎯 顧客プリファレンス分析', () => {
    test('顧客プリファレンス集計が正常に動作', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/customer-preferences')
        .query({ tenantId: testTenant.id })
        .expect(200);

      expect(response.body).toHaveProperty('preferencesByCategory');
      expect(response.body.preferencesByCategory).toHaveProperty('service');
      expect(response.body.preferencesByCategory).toHaveProperty('staff');
      expect(response.body.preferencesByCategory).toHaveProperty('time');
      expect(response.body.preferencesByCategory).toHaveProperty('communication');
    });
  });

  describe('📈 スタッフパフォーマンス分析', () => {
    test('スタッフパフォーマンス集計が正確', async () => {
      // テスト用パフォーマンスデータを生成
      await TestDataFactory.createTestStaffPerformance(testStaff.id, testTenant.id);

      const response = await request(app)
        .get('/api/v1/analytics/staff-performance')
        .query({ tenantId: testTenant.id })
        .expect(200);

      expect(response.body).toHaveProperty('staffMetrics');
      expect(response.body.staffMetrics).toBeInstanceOf(Array);
      
      const staffMetric = response.body.staffMetrics.find((m: any) => m.staffId === testStaff.id);
      expect(staffMetric).toBeDefined();
      expect(staffMetric).toHaveProperty('appointmentsCount');
      expect(staffMetric).toHaveProperty('revenueGenerated');
      expect(staffMetric).toHaveProperty('customerSatisfaction');
    });
  });

  describe('🔮 予測分析', () => {
    test('顧客離脱リスク予測が動作', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/churn-prediction')
        .query({ tenantId: testTenant.id })
        .expect(200);

      expect(response.body).toHaveProperty('highRiskCustomers');
      expect(response.body.highRiskCustomers).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('riskDistribution');
    });

    test('需要予測が正常に動作', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/demand-forecast')
        .query({ 
          tenantId: testTenant.id,
          days: 30
        })
        .expect(200);

      expect(response.body).toHaveProperty('forecast');
      expect(response.body.forecast).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('confidence');
      expect(response.body.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('⚡ パフォーマンステスト', () => {
    test('大量データでの分析応答時間', async () => {
      // 1000件の顧客データで負荷テスト
      await TestDataFactory.generateMassTestData(testTenant.id, {
        customers: 1000,
        reservations: 5000,
        messageThreads: 2000,
        preferences: 3000
      });

      const tests = [
        '/api/v1/analytics/customer-segments',
        '/api/v1/analytics/revenue',
        '/api/v1/analytics/customer-preferences',
        '/api/v1/analytics/staff-performance'
      ];

      for (const endpoint of tests) {
        const startTime = Date.now();
        
        await request(app)
          .get(endpoint)
          .query({ tenantId: testTenant.id })
          .expect(200);
        
        const responseTime = Date.now() - startTime;
        console.log(`⚡ ${endpoint}: ${responseTime}ms`);
        
        // 1秒以内の応答を要求
        expect(responseTime).toBeLessThan(1000);
      }
    });

    test('同時アクセス負荷テスト', async () => {
      const concurrentRequests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/analytics/customer-segments')
          .query({ tenantId: testTenant.id })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      // すべてのリクエストが成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // 10並列で5秒以内
      expect(totalTime).toBeLessThan(5000);
      
      console.log(`🚀 10並列リクエスト完了: ${totalTime}ms`);
    });
  });

  describe('🛡️ セキュリティテスト', () => {
    test('不正なテナントIDでのアクセス拒否', async () => {
      await request(app)
        .get('/api/v1/analytics/customer-segments')
        .query({ tenantId: 'invalid-tenant-id' })
        .expect(403); // Forbidden
    });

    test('SQL注入攻撃の防御', async () => {
      const maliciousInput = "'; DROP TABLE customers; --";
      
      await request(app)
        .get('/api/v1/analytics/customer-segments')
        .query({ tenantId: maliciousInput })
        .expect(400); // Bad Request
      
      // テーブルが存在することを確認
      const customers = await testDb.customer.findMany({
        where: { tenantId: testTenant.id }
      });
      expect(customers.length).toBeGreaterThan(0);
    });

    test('レート制限の動作確認', async () => {
      // 短時間に大量リクエストを送信
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .get('/api/v1/analytics/customer-segments')
          .query({ tenantId: testTenant.id })
      );

      const responses = await Promise.allSettled(requests);
      
      // 一部のリクエストが制限される
      const rejectedCount = responses.filter(r => 
        r.status === 'fulfilled' && (r.value as any).status === 429
      ).length;
      
      expect(rejectedCount).toBeGreaterThan(0);
    });
  });

  describe('📊 データ整合性テスト', () => {
    test('分析データの整合性確認', async () => {
      // 顧客セグメント分析の結果
      const segmentResponse = await request(app)
        .get('/api/v1/analytics/customer-segments')
        .query({ tenantId: testTenant.id })
        .expect(200);

      // データベースから直接カウント
      const actualCustomerCount = await testDb.customer.count({
        where: { tenantId: testTenant.id }
      });

      // 分析結果とデータベースの整合性確認
      expect(segmentResponse.body.totalCustomers).toBe(actualCustomerCount);
    });

    test('時系列データの整合性', async () => {
      // 予約データを追加
      const reservation = await TestDataFactory.createTestReservation(
        testTenant.id, 
        testCustomers[0].id, 
        testStaff.id
      );

      const revenueResponse = await request(app)
        .get('/api/v1/analytics/revenue')
        .query({ tenantId: testTenant.id })
        .expect(200);

      // 収益データに反映されているか確認
      expect(revenueResponse.body.totalRevenue).toBeGreaterThanOrEqual(
        Number(reservation.totalAmount)
      );
    });
  });
});

// 美容室固有のテストヘルパー
export const SalonTestHelpers = {
  // 美容室らしい顧客行動パターンの検証
  validateCustomerBehavior: (customer: any) => {
    expect(customer.segment).toMatch(/VIP|REGULAR|NEW|CHURNED/);
    expect(customer.visitCount).toBeGreaterThanOrEqual(0);
    expect(customer.lifetimeValue).toBeGreaterThanOrEqual(0);
    
    if (customer.segment === 'VIP') {
      expect(customer.lifetimeValue).toBeGreaterThan(50000);
      expect(customer.visitCount).toBeGreaterThan(10);
    }
  },

  // 美容室の営業時間内予約の検証
  validateReservationTime: (reservation: any) => {
    const startTime = new Date(reservation.startTime);
    const hour = startTime.getHours();
    
    // 営業時間は9:00-20:00と仮定
    expect(hour).toBeGreaterThanOrEqual(9);
    expect(hour).toBeLessThan(20);
  },

  // 美容室サービス料金の妥当性検証
  validateServicePricing: (reservation: any) => {
    const amount = Number(reservation.totalAmount);
    
    // 美容室サービスは1000円以上30000円以下と仮定
    expect(amount).toBeGreaterThanOrEqual(1000);
    expect(amount).toBeLessThanOrEqual(30000);
  }
};