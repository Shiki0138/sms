import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

// === ダッシュボード ===
router.get('/dashboard/kpis', analyticsController.getDashboardKPIs);
router.get('/realtime/metrics', analyticsController.getRealtimeMetrics);

// === 分析 ===
router.get('/churn-analysis', analyticsController.getChurnAnalysis);
router.get('/customer/:customerId/insights', analyticsController.getCustomerInsights);

// === 予測 ===
router.get('/forecast/revenue', analyticsController.getRevenueForecast);
router.get('/predictions', analyticsController.getPredictions);

// === レポート ===
router.post('/reports/generate', analyticsController.generateReport);

// === 最適化 ===
router.get('/optimization/suggestions', analyticsController.getOptimizationSuggestions);

// === アラート管理 ===
router.post('/alerts/manage', analyticsController.manageAlerts);

export { router as analyticsRouter };