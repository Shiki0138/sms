import express from 'express';
import {
  getSalaryDashboard,
  setMonthlyGoal,
  recordDailySalary,
  getIncentiveRules,
  getStaffAchievements
} from '../controllers/salaryDashboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 全ルートに認証を適用
router.use(authenticateToken);

// 給与ダッシュボード
router.get('/dashboard', getSalaryDashboard);
router.get('/dashboard/:staffId', getSalaryDashboard);
router.post('/goal', setMonthlyGoal);
router.post('/daily-record', recordDailySalary);

// インセンティブ
router.get('/incentives/rules', getIncentiveRules);
router.get('/incentives/achievements', getStaffAchievements);
router.get('/incentives/achievements/:staffId', getStaffAchievements);

export default router;