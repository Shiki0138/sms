import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, requireStaff } from '../middleware/auth';

const router = Router();

// === 認証エンドポイント ===
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// === プロフィール管理 ===
router.get('/profile', authMiddleware, requireStaff, authController.getProfile);
router.put('/password', authMiddleware, requireStaff, authController.changePassword);

// === 2FA管理 ===
router.post('/2fa/setup', authMiddleware, requireStaff, authController.setup2FA);
router.post('/2fa/enable', authMiddleware, requireStaff, authController.enable2FA);
router.post('/2fa/disable', authMiddleware, requireStaff, authController.disable2FA);

export { router as authRouter };