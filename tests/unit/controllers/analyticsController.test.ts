import { Request, Response } from 'express';

// モジュールを直接requireして型情報を取得
const analyticsControllerModule = require('../../../backend/src/controllers/analyticsController');
const AnalyticsController = analyticsControllerModule.AnalyticsController;

// モック設定
jest.mock('../../../backend/src/services/analyticsService', () => ({
  analyticsService: {
    getDashboardKPIs: jest.fn(),
    analyzeCustomerChurn: jest.fn(),
    generateRevenueForecast: jest.fn()
  }
}));

jest.mock('../../../backend/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

const { analyticsService } = require('../../../backend/src/services/analyticsService');
const { logger } = require('../../../backend/src/utils/logger');

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    controller = new AnalyticsController();
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();
    
    mockReq = {
      headers: { 'x-tenant-id': 'test-tenant' },
      params: {},
      query: {},
      body: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
      writeHead: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn()
    } as Partial<Response>;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getDashboardKPIs', () => {
    it('正常にダッシュボードKPIを取得する', async () => {
      // Arrange
      const mockKPIs = {
        revenue: { thisMonth: 150000, lastMonth: 120000, trend: 25 },
        customers: { total: 120, new: 15, returning: 105, churnRate: 5 },
        reservations: { today: 8, thisWeek: 45, noShowRate: 3 },
        satisfaction: { averageScore: 4.2, reviewCount: 89 }
      };
      
      mockAnalyticsService.getDashboardKPIs.mockResolvedValue(mockKPIs);

      // Act
      await controller.getDashboardKPIs(mockReq as Request, mockRes as Response);

      // Assert
      expect(analyticsService.getDashboardKPIs).toHaveBeenCalledWith('test-tenant');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockKPIs
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('エラー時に500ステータスを返す', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockAnalyticsService.getDashboardKPIs.mockRejectedValue(error);

      // Act
      await controller.getDashboardKPIs(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Database connection failed'
      });
      expect(logger.error).toHaveBeenCalledWith('Dashboard KPIs取得エラー:', error);
    });

    it('テナントIDが未指定の場合はdefault-tenantを使用', async () => {
      // Arrange
      mockReq.headers = {};
      const mockKPIs = { revenue: { thisMonth: 0 } };
      mockAnalyticsService.getDashboardKPIs.mockResolvedValue(mockKPIs);

      // Act
      await controller.getDashboardKPIs(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAnalyticsService.getDashboardKPIs).toHaveBeenCalledWith('default-tenant');
    });
  });

  describe('getChurnAnalysis', () => {
    it('正常に離脱分析を取得する', async () => {
      // Arrange
      const mockChurnAnalysis = {
        highRiskCustomers: [
          { id: '1', name: '田中太郎', lastVisit: '2024-10-15', riskScore: 0.85 }
        ],
        overallChurnRate: 12.5,
        predictions: {
          nextMonth: 15.2,
          factors: ['長期間来店なし', '満足度低下']
        }
      };
      
      mockAnalyticsService.analyzeCustomerChurn.mockResolvedValue(mockChurnAnalysis);

      // Act
      await controller.getChurnAnalysis(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAnalyticsService.analyzeCustomerChurn).toHaveBeenCalledWith('test-tenant');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockChurnAnalysis
      });
    });
  });

  describe('getRevenueForecast', () => {
    it('正常に売上予測を取得する', async () => {
      // Arrange
      const mockForecast = {
        nextMonth: 180000,
        confidence: 0.85,
        factors: ['季節性', 'キャンペーン効果', '新規顧客獲得'],
        breakdown: {
          existingCustomers: 150000,
          newCustomers: 30000
        }
      };
      
      mockAnalyticsService.generateRevenueForecast.mockResolvedValue(mockForecast);

      // Act
      await controller.getRevenueForecast(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAnalyticsService.generateRevenueForecast).toHaveBeenCalledWith('test-tenant');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockForecast
      });
    });
  });

  describe('getCustomerInsights', () => {
    it('正常に顧客インサイトを取得する', async () => {
      // Arrange
      mockReq.params = { customerId: 'customer-123' };
      
      const mockInsights = {
        customerProfile: {
          id: 'customer-123',
          name: '佐藤花子',
          totalVisits: 12,
          lastVisit: '2024-12-01'
        },
        behaviorAnalysis: {
          visitFrequency: 'monthly',
          averageSpending: 8500,
          churnRisk: 0.15
        },
        recommendations: {
          nextService: 'カラーリング',
          retentionStrategy: '現状の関係維持で十分'
        }
      };

      // プライベートメソッドをモック化
      const generateInsightsSpy = jest.spyOn(controller as any, 'generateCustomerInsights')
        .mockResolvedValue(mockInsights);

      // Act
      await controller.getCustomerInsights(mockReq as Request, mockRes as Response);

      // Assert
      expect(generateInsightsSpy).toHaveBeenCalledWith('test-tenant', 'customer-123');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockInsights
      });
    });

    it('顧客IDが未指定の場合は400エラーを返す', async () => {
      // Arrange
      mockReq.params = {};

      // Act
      await controller.getCustomerInsights(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: '顧客IDが必要です'
      });
    });
  });

  describe('getPredictions', () => {
    it('売上予測タイプで正常に予測データを取得する', async () => {
      // Arrange
      mockReq.query = { type: 'revenue', period: 'month' };
      const mockPredictions = {
        nextMonth: 180000,
        confidence: 0.85
      };
      
      mockAnalyticsService.generateRevenueForecast.mockResolvedValue(mockPredictions);

      // Act
      await controller.getPredictions(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAnalyticsService.generateRevenueForecast).toHaveBeenCalledWith('test-tenant');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPredictions,
        predictionType: 'revenue',
        period: 'month'
      });
    });

    it('離脱予測タイプで正常に予測データを取得する', async () => {
      // Arrange
      mockReq.query = { type: 'churn', period: 'quarter' };
      const mockChurnData = {
        highRiskCustomers: [],
        overallChurnRate: 10.5
      };
      
      mockAnalyticsService.analyzeCustomerChurn.mockResolvedValue(mockChurnData);

      // Act
      await controller.getPredictions(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAnalyticsService.analyzeCustomerChurn).toHaveBeenCalledWith('test-tenant');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockChurnData,
        predictionType: 'churn',
        period: 'quarter'
      });
    });

    it('無効なクエリパラメータでバリデーションエラーが発生する', async () => {
      // Arrange
      mockReq.query = { type: 'invalid', period: 'invalid' };

      // Act
      await controller.getPredictions(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('generateReport', () => {
    it('正常に分析レポートを生成する', async () => {
      // Arrange
      mockReq.body = {
        reportType: 'monthly',
        startDate: '2024-11-01',
        endDate: '2024-11-30'
      };

      const mockReport = {
        reportType: 'monthly',
        period: { startDate: '2024-11-01', endDate: '2024-11-30' },
        summary: {
          totalRevenue: 150000,
          totalCustomers: 120,
          churnRate: 12.5
        },
        insights: ['売上は前月比で安定している'],
        recommendations: ['SNSマーケティングの強化']
      };

      const generateReportSpy = jest.spyOn(controller as any, 'generateAnalyticsReport')
        .mockResolvedValue(mockReport);

      // Act
      await controller.generateReport(mockReq as Request, mockRes as Response);

      // Assert
      expect(generateReportSpy).toHaveBeenCalledWith(
        'test-tenant',
        'monthly',
        '2024-11-01',
        '2024-11-30'
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockReport,
        generatedAt: expect.any(String)
      });
    });
  });

  describe('manageAlerts', () => {
    it('正常にアラート設定を管理する', async () => {
      // Arrange
      mockReq.body = {
        action: 'create',
        alertType: 'revenue_drop',
        threshold: 10,
        condition: 'percentage_decrease'
      };

      const mockResult = {
        action: 'create',
        alertType: 'revenue_drop',
        threshold: 10,
        condition: 'percentage_decrease',
        status: 'configured',
        message: 'revenue_dropアラートが設定されました'
      };

      const handleAlertSpy = jest.spyOn(controller as any, 'handleAlertManagement')
        .mockResolvedValue(mockResult);

      // Act
      await controller.manageAlerts(mockReq as Request, mockRes as Response);

      // Assert
      expect(handleAlertSpy).toHaveBeenCalledWith(
        'test-tenant',
        'create',
        'revenue_drop',
        10,
        'percentage_decrease'
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });
  });

  describe('getOptimizationSuggestions', () => {
    it('正常に最適化提案を取得する', async () => {
      // Arrange
      const mockSuggestions = {
        suggestions: [
          {
            category: '売上',
            priority: 'high',
            suggestion: '売上減少傾向にあります。プロモーション施策の実施を検討してください。',
            expectedImpact: '売上15-20%向上'
          }
        ],
        overallScore: 75,
        implementationPriority: []
      };

      const getSuggestionsSpy = jest.spyOn(controller as any, 'generateOptimizationSuggestions')
        .mockResolvedValue(mockSuggestions);

      // Act
      await controller.getOptimizationSuggestions(mockReq as Request, mockRes as Response);

      // Assert
      expect(getSuggestionsSpy).toHaveBeenCalledWith('test-tenant');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSuggestions
      });
    });
  });
});