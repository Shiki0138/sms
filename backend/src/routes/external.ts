import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import axios from 'axios';

const router = Router();

// LINE OAuth設定
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const LINE_CALLBACK_URL = process.env.LINE_CALLBACK_URL || 'http://localhost:4002/api/v1/external/line/callback';

/**
 * LINE連携開始
 * POST /api/v1/external/line/connect
 */
router.post('/line/connect', auth, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  // 権限チェック（管理者・オーナーのみ、大文字小文字両対応）
  const userRole = user.role?.toLowerCase();
  if (userRole !== 'admin' && userRole !== 'owner') {
    return res.status(403).json({ 
      error: 'この機能は管理者とオーナーのみ利用可能です' 
    });
  }
  
  // 環境変数チェック
  if (!LINE_CHANNEL_ID || !LINE_CHANNEL_SECRET) {
    console.error('LINE環境変数が設定されていません');
    return res.status(500).json({ 
      error: 'LINE連携の設定が完了していません。システム管理者に連絡してください。' 
    });
  }
  
  // LINE OAuth URLを生成
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    timestamp: Date.now()
  })).toString('base64');
  
  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
    `response_type=code&` +
    `client_id=${LINE_CHANNEL_ID}&` +
    `redirect_uri=${encodeURIComponent(LINE_CALLBACK_URL)}&` +
    `state=${state}&` +
    `scope=profile%20openid`;
  
  res.json({ authUrl });
}));

/**
 * LINE OAuth コールバック
 * GET /api/v1/external/line/callback
 */
router.get('/line/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, state, error } = req.query;
  
  if (error) {
    return res.redirect(`/settings?lineError=${encodeURIComponent(error as string)}`);
  }
  
  if (!code || !state) {
    return res.redirect('/settings?lineError=missing_params');
  }
  
  try {
    // stateをデコードして検証
    const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
    
    // アクセストークンを取得
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: LINE_CALLBACK_URL,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    // ユーザープロフィールを取得
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const lineProfile = profileResponse.data;
    
    // TODO: データベースにLINE連携情報を保存
    console.log('LINE連携成功:', {
      userId: decodedState.userId,
      lineUserId: lineProfile.userId,
      displayName: lineProfile.displayName
    });
    
    // 成功画面へリダイレクト
    res.redirect('/settings?lineSuccess=true');
    
  } catch (error) {
    console.error('LINE連携エラー:', error);
    res.redirect('/settings?lineError=connection_failed');
  }
}));

/**
 * LINE連携状態確認
 * GET /api/v1/external/line/status
 */
router.get('/line/status', auth, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  // TODO: データベースから連携状態を取得
  const isConnected = false; // 仮の値
  
  res.json({ 
    connected: isConnected,
    canConfigure: user.role === 'ADMIN' || user.role === 'OWNER'
  });
}));

export default router;