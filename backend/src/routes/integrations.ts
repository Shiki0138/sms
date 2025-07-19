import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * LINE連携テスト（互換性のため）
 * POST /api/v1/integrations/line/test
 */
router.post('/line/test', auth, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  // 権限チェック（管理者・オーナーのみ、大文字小文字両対応）
  const userRole = user.role?.toLowerCase();
  if (userRole !== 'admin' && userRole !== 'owner') {
    return res.status(403).json({ 
      error: 'この機能は管理者とオーナーのみ利用可能です',
      success: false
    });
  }
  
  // 環境変数チェック
  if (!process.env.LINE_CHANNEL_ID || !process.env.LINE_CHANNEL_SECRET) {
    return res.status(500).json({ 
      error: 'LINE連携の設定が完了していません。システム管理者に連絡してください。',
      success: false
    });
  }
  
  // テスト成功レスポンス
  res.json({ 
    success: true,
    message: 'LINE連携テストに成功しました。外部API設定画面から連携を開始してください。'
  });
}));

/**
 * LINE連携テスト（GETリクエスト用）
 * GET /api/v1/integrations/line/test
 */
router.get('/line/test', auth, asyncHandler(async (req: Request, res: Response) => {
  res.json({ 
    message: 'LINE連携機能は外部API設定画面から利用してください。',
    endpoint: '/api/v1/external/line/connect'
  });
}));

export default router;