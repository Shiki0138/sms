import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { 
  requireAnalytics, 
  requireAdvancedReports, 
  requireRealTimeDashboard,
  addPlanInfo 
} from '../middleware/planRestriction';

const router = Router();

// 認証とプラン情報を全ルートに適用
router.use(authenticate);
router.use(addPlanInfo);

// === ダッシュボード ===
// 基本KPIは全プランで利用可能
router.get('/dashboard/kpis', analyticsController.getDashboardKPIs);

// リアルタイムメトリクスはプレミアムAI限定
router.get('/realtime/metrics', requireRealTimeDashboard, analyticsController.getRealtimeMetrics);

// === 分析 === (スタンダード以上)
router.get('/churn-analysis', requireAnalytics, analyticsController.getChurnAnalysis);
router.get('/customer/:customerId/insights', requireAnalytics, analyticsController.getCustomerInsights);

// === 予測 === (スタンダード以上)
router.get('/forecast/revenue', requireAnalytics, analyticsController.getRevenueForecast);
router.get('/predictions', requireAnalytics, analyticsController.getPredictions);

// === レポート === (プレミアムAI限定)
router.post('/reports/generate', requireAdvancedReports, analyticsController.generateReport);

// === 最適化 === (プレミアムAI限定)
router.get('/optimization/suggestions', requireAdvancedReports, analyticsController.getOptimizationSuggestions);

// === アラート管理 === (プレミアムAI限定)
router.post('/alerts/manage', requireAdvancedReports, analyticsController.manageAlerts);

export { router as analyticsRouter };