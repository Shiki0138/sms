import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// === 認証エンドポイント ===
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// === プロフィール管理 ===
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/password', authMiddleware, authController.changePassword);

// === 2FA管理 ===
router.post('/2fa/setup', authMiddleware, authController.setup2FA);
router.post('/2fa/enable', authMiddleware, authController.enable2FA);
router.post('/2fa/disable', authMiddleware, authController.disable2FA);

export { router as authRouter };