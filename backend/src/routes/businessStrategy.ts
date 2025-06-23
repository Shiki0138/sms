import express from 'express';
import {
  getDashboardOverview,
  getDetailedMetrics,
  getBusinessInsights,
  getCompetitorAnalysis,
  getStrategicActions,
  updateActionStatus,
  setBusinessGoal,
  generateNewInsights,
  generateManagementReport
} from '../controllers/businessStrategyController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// 全ルートに認証を適用
router.use(requireAuth);

// 管理者またはマネージャーのみアクセス可能
router.use((req: any, res: any, next: any) => {
  if (req.role !== 'ADMIN' && req.role !== 'MANAGER') {
    return res.status(403).json({ error: '経営戦略ダッシュボードへのアクセス権限がありません' });
  }
  next();
});

// ダッシュボード
router.get('/dashboard/overview', getDashboardOverview);
router.get('/metrics/detailed', getDetailedMetrics);

// インサイトと分析
router.get('/insights', getBusinessInsights);
router.post('/insights/generate', generateNewInsights);

// 競合分析
router.get('/competitors', getCompetitorAnalysis);

// 戦略的アクション
router.get('/actions', getStrategicActions);
router.put('/actions/:actionId/status', updateActionStatus);

// 経営目標
router.post('/goals', setBusinessGoal);

// レポート
router.post('/reports/generate', generateManagementReport);

export default router;