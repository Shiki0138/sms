import { Router } from 'express';
import { securityController } from '../controllers/securityController';
import { authMiddleware, requireAdmin, requireManager } from '../middleware/auth';

const router = Router();

// 認証必須
router.use(authMiddleware);

// === セキュリティログ管理（管理者・マネージャー） ===
router.get('/logs', requireManager, securityController.getSecurityLogs);
router.get('/login-history', requireManager, securityController.getLoginHistory);
router.get('/stats', requireManager, securityController.getSecurityStats);

// === セッション管理（管理者・マネージャー） ===
router.get('/sessions', requireManager, securityController.getActiveSessions);
router.delete('/sessions/:sessionId', requireManager, securityController.terminateSession);

// === アカウント管理（管理者のみ） ===
router.post('/unlock-account', requireAdmin, securityController.unlockAccount);

// === レポート（管理者・マネージャー） ===
router.get('/report', requireManager, securityController.generateSecurityReport);

// === 2FA管理 ===
router.post('/backup-codes/regenerate', securityController.regenerateBackupCodes);

export { router as securityRouter };