import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  requireAdvancedReports, 
  addPlanInfo 
} from '../middleware/planRestriction';

const router = Router();

// 認証とプラン情報を全ルートに適用
router.use(authenticate);
router.use(addPlanInfo);

// ===== AIシフト最適化 API ===== (プレミアムAI限定)

// スタッフ情報取得
router.get('/staff', requireAdvancedReports, async (req, res) => {
  try {
    // TODO: 実際のデータベースから取得
    const mockStaff = [
      {
        id: '1',
        name: '田中美咲',
        skills: ['カット', 'カラー', 'パーマ'],
        rating: 4.8,
        hourlyRate: 2500,
        availability: {}
      },
      {
        id: '2', 
        name: '佐藤健太',
        skills: ['カット', 'スタイリング'],
        rating: 4.6,
        hourlyRate: 2200,
        availability: {}
      },
      {
        id: '3',
        name: '鈴木花子',
        skills: ['カラー', 'トリートメント', 'ヘッドスパ'],
        rating: 4.9,
        hourlyRate: 2800,
        availability: {}
      }
    ];

    res.json({
      success: true,
      data: mockStaff
    });
  } catch (error) {
    console.error('Staff data fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'スタッフデータの取得に失敗しました'
    });
  }
});

// AI予測データ生成
router.post('/predictions', requireAdvancedReports, async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: '日付が指定されていません'
      });
    }

    // AI予測アルゴリズム（モック）
    const predictions = [];
    for (let hour = 9; hour < 20; hour++) {
      const baseCustomers = Math.random() * 8 + 2;
      const selectedDate = new Date(date);
      const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
      const weekendBonus = isWeekend ? 1.3 : 1;
      const peakHourBonus = (hour >= 14 && hour <= 18) ? 1.5 : 1;
      
      predictions.push({
        date,
        hour,
        expectedCustomers: Math.round(baseCustomers * weekendBonus * peakHourBonus),
        confidence: Math.random() * 20 + 80,
        recommendedStaff: Math.ceil((baseCustomers * weekendBonus * peakHourBonus) / 3),
        factors: {
          isWeekend,
          isPeakHour: hour >= 14 && hour <= 18,
          weatherImpact: Math.random() * 0.2 + 0.9,
          seasonalTrend: Math.random() * 0.3 + 0.85
        }
      });
    }

    res.json({
      success: true,
      data: {
        predictions,
        metadata: {
          algorithmVersion: '2.1.0',
          dataPointsUsed: 2847,
          confidenceLevel: 'HIGH',
          lastUpdated: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Prediction generation error:', error);
    res.status(500).json({
      success: false,
      error: 'AI予測の生成に失敗しました'
    });
  }
});

// シフト最適化実行
router.post('/optimize', requireAdvancedReports, async (req, res) => {
  try {
    const { date, staffIds, constraints } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: '日付が指定されていません'
      });
    }

    // シフト最適化アルゴリズム（モック）
    const optimizedShifts = [
      {
        staffId: '1',
        staffName: '田中美咲',
        date,
        startTime: '09:00',
        endTime: '18:00',
        expectedRevenue: 48000,
        customerCount: 12,
        efficiency: 94,
        skills: ['カット', 'カラー', 'パーマ'],
        optimizationReasons: [
          'ピーク時間帯のカバー',
          'スキルセットの最適配置',
          'VIP顧客対応可能'
        ]
      },
      {
        staffId: '2',
        staffName: '佐藤健太', 
        date,
        startTime: '10:00',
        endTime: '19:00',
        expectedRevenue: 38000,
        customerCount: 10,
        efficiency: 87,
        skills: ['カット', 'スタイリング'],
        optimizationReasons: [
          '午後の需要増加対応',
          'コスト効率の最適化'
        ]
      },
      {
        staffId: '3',
        staffName: '鈴木花子',
        date,
        startTime: '13:00',
        endTime: '20:00',
        expectedRevenue: 42000,
        customerCount: 8,
        efficiency: 91,
        skills: ['カラー', 'トリートメント', 'ヘッドスパ'],
        optimizationReasons: [
          '夜間需要への対応',
          '専門スキルの活用',
          '収益性の最大化'
        ]
      }
    ];

    const summary = {
      totalRevenue: optimizedShifts.reduce((sum, shift) => sum + shift.expectedRevenue, 0),
      totalCustomers: optimizedShifts.reduce((sum, shift) => sum + shift.customerCount, 0),
      averageEfficiency: optimizedShifts.reduce((sum, shift) => sum + shift.efficiency, 0) / optimizedShifts.length,
      costSavings: 28000,
      revenueIncrease: 18.2
    };

    res.json({
      success: true,
      data: {
        optimizedShifts,
        summary,
        metadata: {
          optimizationTime: new Date().toISOString(),
          algorithmsUsed: ['ML Predictor', 'Genetic Algorithm', 'Cost Optimizer'],
          constraintsApplied: constraints || [],
          validationScore: 0.96
        }
      }
    });
  } catch (error) {
    console.error('Shift optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'シフト最適化の実行に失敗しました'
    });
  }
});

// パフォーマンス分析レポート
router.get('/analytics/performance', requireAdvancedReports, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const performanceData = {
      weeklyMetrics: {
        revenueIncrease: 18.2,
        costEfficiency: 24.7,
        customerSatisfaction: 4.9,
        bookingLossReduction: 32
      },
      roi: {
        percentage: 312,
        monthlyProfit: 480000,
        implementationCost: 150000,
        paybackPeriod: 2.1
      },
      staffMetrics: [
        {
          staffId: '1',
          name: '田中美咲',
          efficiencyScore: 94,
          revenueContribution: 35.2,
          customerRating: 4.8,
          utilizationRate: 87
        },
        {
          staffId: '2',
          name: '佐藤健太',
          efficiencyScore: 87,
          revenueContribution: 28.1,
          customerRating: 4.6,
          utilizationRate: 82
        },
        {
          staffId: '3',
          name: '鈴木花子',
          efficiencyScore: 91,
          revenueContribution: 31.4,
          customerRating: 4.9,
          utilizationRate: 89
        }
      ],
      trends: {
        dailyRevenue: [45000, 52000, 48000, 61000, 58000, 69000, 73000],
        customerCount: [28, 35, 32, 42, 38, 48, 52],
        efficiency: [85, 88, 87, 91, 89, 93, 94]
      }
    };

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'パフォーマンス分析の取得に失敗しました'
    });
  }
});

// スタッフ可用性設定
router.put('/staff/:staffId/availability', requireAdvancedReports, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { availability } = req.body;
    
    // TODO: データベースに保存
    
    res.json({
      success: true,
      message: 'スタッフの可用性を更新しました',
      data: {
        staffId,
        availability
      }
    });
  } catch (error) {
    console.error('Staff availability update error:', error);
    res.status(500).json({
      success: false,
      error: 'スタッフ可用性の更新に失敗しました'
    });
  }
});

// シフトテンプレート管理
router.post('/templates', requireAdvancedReports, async (req, res) => {
  try {
    const { name, shifts, description } = req.body;
    
    const template = {
      id: Date.now().toString(),
      name,
      shifts,
      description,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // TODO: データベースに保存
    
    res.json({
      success: true,
      message: 'シフトテンプレートを作成しました',
      data: template
    });
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({
      success: false,
      error: 'テンプレートの作成に失敗しました'
    });
  }
});

router.get('/templates', requireAdvancedReports, async (req, res) => {
  try {
    // TODO: データベースから取得
    const mockTemplates = [
      {
        id: '1',
        name: '平日標準シフト',
        description: '平日の標準的なシフト配置',
        shiftsCount: 3,
        createdAt: '2024-01-15T10:00:00Z',
        isActive: true
      },
      {
        id: '2',
        name: '週末繁忙期シフト',
        description: '週末の繁忙期に対応したシフト',
        shiftsCount: 4,
        createdAt: '2024-01-10T14:30:00Z',
        isActive: true
      }
    ];
    
    res.json({
      success: true,
      data: mockTemplates
    });
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'テンプレートの取得に失敗しました'
    });
  }
});

export { router as aiShiftManagementRouter };