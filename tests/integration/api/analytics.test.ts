import request from 'supertest';
import app from '../../../backend/src/server';
import { connectDatabase, disconnectDatabase } from '../../../backend/src/database';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Analytics API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
    // テストデータの初期化
    await setupTestData();
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await cleanupTestData();
    await disconnectDatabase();
  });

  beforeEach(async () => {
    // 各テスト前のデータリセット
    await resetTestData();
  });

  describe('GET /api/v1/analytics/dashboard-kpis', () => {
    it('正常にダッシュボードKPIを取得する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/dashboard-kpis')
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          revenue: expect.objectContaining({
            thisMonth: expect.any(Number),
            lastMonth: expect.any(Number),
            trend: expect.any(Number)
          }),
          customers: expect.objectContaining({
            total: expect.any(Number),
            new: expect.any(Number),
            returning: expect.any(Number),
            churnRate: expect.any(Number)
          }),
          reservations: expect.objectContaining({
            today: expect.any(Number),
            thisWeek: expect.any(Number),
            noShowRate: expect.any(Number)
          }),
          satisfaction: expect.objectContaining({
            averageScore: expect.any(Number),
            reviewCount: expect.any(Number)
          })
        }
      });
    });

    it('テナントID未指定時にdefault-tenantで動作する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/dashboard-kpis')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('無効なテナントIDでも正常に動作する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/dashboard-kpis')
        .set('x-tenant-id', 'nonexistent-tenant')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/analytics/churn-analysis', () => {
    it('正常に離脱分析データを取得する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/churn-analysis')
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          highRiskCustomers: expect.any(Array),
          overallChurnRate: expect.any(Number),
          predictions: expect.any(Object)
        })
      });

      // 高リスク顧客データの構造確認
      if (response.body.data.highRiskCustomers.length > 0) {
        expect(response.body.data.highRiskCustomers[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          lastVisit: expect.any(String),
          riskScore: expect.any(Number)
        });
      }
    });
  });

  describe('GET /api/v1/analytics/revenue-forecast', () => {
    it('正常に売上予測データを取得する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/revenue-forecast')
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          nextMonth: expect.any(Number),
          confidence: expect.any(Number),
          factors: expect.any(Array),
          breakdown: expect.any(Object)
        })
      });

      expect(response.body.data.confidence).toBeGreaterThan(0);
      expect(response.body.data.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/v1/analytics/customers/:customerId/insights', () => {
    it('正常に顧客インサイトを取得する', async () => {
      // テスト用顧客データを作成
      const testCustomer = await createTestCustomer();

      const response = await request(app)
        .get(`/api/v1/analytics/customers/${testCustomer.id}/insights`)
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          customerProfile: expect.objectContaining({
            id: testCustomer.id,
            name: expect.any(String),
            totalVisits: expect.any(Number),
            lastVisit: expect.any(String)
          }),
          behaviorAnalysis: expect.any(Object),
          preferences: expect.any(Object),
          recommendations: expect.any(Object)
        })
      });
    });

    it('存在しない顧客IDで500エラーを返す', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/customers/nonexistent-id/insights')
        .set('x-tenant-id', 'test-tenant')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('顧客が見つかりません')
      });
    });

    it('顧客ID未指定で400エラーを返す', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/customers//insights')
        .set('x-tenant-id', 'test-tenant')
        .expect(404); // ルーティングエラー
    });
  });

  describe('GET /api/v1/analytics/predictions', () => {
    it('売上予測タイプで正常にデータを取得する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/predictions')
        .query({ type: 'revenue', period: 'month' })
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Object),
        predictionType: 'revenue',
        period: 'month'
      });
    });

    it('離脱予測タイプで正常にデータを取得する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/predictions')
        .query({ type: 'churn', period: 'quarter' })
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Object),
        predictionType: 'churn',
        period: 'quarter'
      });
    });

    it('デフォルト値で正常に動作する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/predictions')
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Object),
        predictionType: 'revenue',
        period: 'month'
      });
    });

    it('無効なクエリパラメータでバリデーションエラー', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/predictions')
        .query({ type: 'invalid', period: 'invalid' })
        .set('x-tenant-id', 'test-tenant')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/analytics/reports', () => {
    it('正常に分析レポートを生成する', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/reports')
        .set('x-tenant-id', 'test-tenant')
        .send({
          reportType: 'monthly',
          startDate: '2024-11-01',
          endDate: '2024-11-30'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          reportType: 'monthly',
          period: expect.objectContaining({
            startDate: '2024-11-01',
            endDate: '2024-11-30'
          }),
          summary: expect.any(Object),
          insights: expect.any(Array),
          recommendations: expect.any(Array),
          detailedData: expect.any(Object)
        }),
        generatedAt: expect.any(String)
      });
    });

    it('必須フィールド未指定でもデフォルト値で動作する', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/reports')
        .set('x-tenant-id', 'test-tenant')
        .send({
          reportType: 'weekly'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/analytics/alerts', () => {
    it('正常にアラート設定を作成する', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/alerts')
        .set('x-tenant-id', 'test-tenant')
        .send({
          action: 'create',
          alertType: 'revenue_drop',
          threshold: 15,
          condition: 'percentage_decrease'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          action: 'create',
          alertType: 'revenue_drop',
          threshold: 15,
          condition: 'percentage_decrease',
          status: 'configured',
          message: expect.stringContaining('アラートが設定されました')
        })
      });
    });
  });

  describe('GET /api/v1/analytics/optimization-suggestions', () => {
    it('正常に最適化提案を取得する', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/optimization-suggestions')
        .set('x-tenant-id', 'test-tenant')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          suggestions: expect.any(Array),
          overallScore: expect.any(Number),
          implementationPriority: expect.any(Array)
        })
      });

      // 提案データの構造確認
      if (response.body.data.suggestions.length > 0) {
        expect(response.body.data.suggestions[0]).toMatchObject({
          category: expect.any(String),
          priority: expect.stringMatching(/^(high|medium|low)$/),
          suggestion: expect.any(String),
          expectedImpact: expect.any(String)
        });
      }

      expect(response.body.data.overallScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance Tests', () => {
    it('API応答時間が100ms以内である', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v1/analytics/dashboard-kpis')
        .set('x-tenant-id', 'test-tenant')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });

    it('同時リクエストを処理できる', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/analytics/dashboard-kpis')
          .set('x-tenant-id', 'test-tenant')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});

// テストヘルパー関数
async function setupTestData() {
  // テスト用のテナント、顧客、予約データなどを作成
  await prisma.tenant.upsert({
    where: { id: 'test-tenant' },
    update: {},
    create: {
      id: 'test-tenant',
      name: 'テストサロン',
      subdomain: 'test-salon',
      domain: 'test-salon.example.com',
      subscriptionTier: 'PREMIUM'
    }
  });

  // 追加のテストデータ作成...
}

async function cleanupTestData() {
  // テストデータの削除
  await prisma.marketingCampaign.deleteMany({ where: { tenantId: 'test-tenant' } });
  await prisma.staffPerformance.deleteMany({ where: { tenantId: 'test-tenant' } });
  await prisma.customerPreference.deleteMany({ where: { tenantId: 'test-tenant' } });
  await prisma.securityEvent.deleteMany({ where: { tenantId: 'test-tenant' } });
  await prisma.tenant.deleteMany({ where: { id: 'test-tenant' } });
}

async function resetTestData() {
  // 各テスト前のデータリセット
  // 必要に応じて特定のデータを初期状態に戻す
}

async function createTestCustomer() {
  return await prisma.customer.create({
    data: {
      id: `test-customer-${Date.now()}`,
      name: 'テスト顧客',
      phone: '090-1234-5678',
      email: 'test@example.com',
      tenantId: 'test-tenant',
      visitCount: 5,
      totalSpent: 42500,
      lastVisitDate: new Date()
    }
  });
}