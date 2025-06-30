import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { JWTService } from '../utils/jwt';
import { TwoFactorService } from '../utils/twoFactor';
import { SecurityService, SECURITY_EVENTS } from '../utils/security';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// バリデーションスキーマ
const LoginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
  totpCode: z.string().optional(),
  backupCode: z.string().optional(),
  rememberMe: z.boolean().default(false),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z.string().min(8, 'パスワードは8文字以上である必要があります'),
});

const Setup2FASchema = z.object({
  totpCode: z.string().min(6, '6桁の認証コードを入力してください'),
});

const Disable2FASchema = z.object({
  password: z.string().min(1, 'パスワードを入力してください'),
  totpCode: z.string().optional(),
  backupCode: z.string().optional(),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'リフレッシュトークンが必要です'),
});

export class AuthController {
  /**
   * ログイン
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const { email, password, totpCode, backupCode } = validatedData;
      
      const ipAddress = SecurityService.getClientIP(req);
      const userAgent = req.headers['user-agent'] || '';

      // スタッフ検索
      const staff = await prisma.staff.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          tenantId: true,
          isActive: true,
          loginAttempts: true,
          lockedUntil: true,
          twoFactorEnabled: true,
          twoFactorSecret: true,
          backupCodes: true,
        },
      });

      if (!staff) {
        await SecurityService.logLoginAttempt(
          email,
          false,
          undefined,
          undefined,
          'ユーザーが見つかりません',
          ipAddress,
          userAgent
        );

        res.status(401).json({
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません',
        });
        return;
      }

      // アカウント状態チェック
      if (!staff.isActive) {
        await SecurityService.logLoginAttempt(
          email,
          false,
          staff.id,
          staff.tenantId,
          'アカウントが無効',
          ipAddress,
          userAgent
        );

        res.status(401).json({
          success: false,
          error: 'アカウントが無効です',
        });
        return;
      }

      // ロック状態チェック
      if (staff.lockedUntil && staff.lockedUntil > new Date()) {
        await SecurityService.logLoginAttempt(
          email,
          false,
          staff.id,
          staff.tenantId,
          'アカウントがロックされています',
          ipAddress,
          userAgent
        );

        const lockTimeRemaining = Math.ceil(
          (staff.lockedUntil.getTime() - Date.now()) / (1000 * 60)
        );

        res.status(423).json({
          success: false,
          error: `アカウントがロックされています。${lockTimeRemaining}分後に再試行してください`,
        });
        return;
      }

      // パスワード検証
      const isPasswordValid = await SecurityService.verifyPassword(password, staff.password);

      if (!isPasswordValid) {
        const { isLocked, attemptsRemaining } = await SecurityService.checkAndUpdateLoginAttempts(
          staff.id,
          false
        );

        await SecurityService.logLoginAttempt(
          email,
          false,
          staff.id,
          staff.tenantId,
          'パスワードが正しくありません',
          ipAddress,
          userAgent
        );

        await SecurityService.logSecurityEvent(
          staff.id,
          SECURITY_EVENTS.LOGIN_FAILED,
          'パスワードが正しくありません',
          'WARNING',
          { attemptsRemaining },
          ipAddress,
          userAgent
        );

        if (isLocked) {
          res.status(423).json({
            success: false,
            error: '複数回のログイン失敗によりアカウントがロックされました',
          });
        } else {
          res.status(401).json({
            success: false,
            error: `メールアドレスまたはパスワードが正しくありません（残り試行回数: ${attemptsRemaining}）`,
          });
        }
        return;
      }

      // 2FA確認
      if (staff.twoFactorEnabled) {
        let is2FAValid = false;

        if (totpCode && staff.twoFactorSecret) {
          // TOTP検証
          is2FAValid = TwoFactorService.verifyTOTP(totpCode, staff.twoFactorSecret);
        } else if (backupCode && staff.backupCodes) {
          // バックアップコード検証
          const codes = JSON.parse(staff.backupCodes);
          const { isValid, remainingCodes } = TwoFactorService.verifyBackupCode(
            backupCode,
            codes
          );

          if (isValid) {
            is2FAValid = true;
            // バックアップコードを更新
            await prisma.staff.update({
              where: { id: staff.id },
              data: { backupCodes: JSON.stringify(remainingCodes) },
            });

            await SecurityService.logSecurityEvent(
              staff.id,
              SECURITY_EVENTS.TWO_FA_BACKUP_USED,
              'バックアップコードが使用されました',
              'INFO',
              { remainingCodes: remainingCodes.length },
              ipAddress,
              userAgent
            );
          }
        }

        if (!is2FAValid) {
          await SecurityService.logSecurityEvent(
            staff.id,
            SECURITY_EVENTS.INVALID_2FA_ATTEMPT,
            '2FA認証に失敗しました',
            'WARNING',
            { providedCode: !!totpCode, providedBackup: !!backupCode },
            ipAddress,
            userAgent
          );

          res.status(401).json({
            success: false,
            error: '2段階認証コードが正しくありません',
            requires2FA: true,
          });
          return;
        }
      }

      // ログイン成功処理
      await SecurityService.checkAndUpdateLoginAttempts(staff.id, true);

      // 疑わしいログイン検出
      const isSuspicious = await SecurityService.detectSuspiciousLogin(
        staff.id,
        ipAddress,
        userAgent
      );

      // トークン生成
      const tokens = await JWTService.generateTokenPair(
        {
          id: staff.id,
          tenantId: staff.tenantId,
          email: staff.email,
          role: staff.role as 'ADMIN' | 'MANAGER' | 'STAFF',
        },
        ipAddress,
        userAgent
      );

      // ログイン成功記録
      await SecurityService.logLoginAttempt(
        email,
        true,
        staff.id,
        staff.tenantId,
        undefined,
        ipAddress,
        userAgent
      );

      await SecurityService.logSecurityEvent(
        staff.id,
        SECURITY_EVENTS.LOGIN_SUCCESS,
        'ログインに成功しました',
        'INFO',
        { suspicious: isSuspicious },
        ipAddress,
        userAgent
      );

      res.json({
        success: true,
        data: {
          user: {
            id: staff.id,
            email: staff.email,
            name: staff.name,
            role: staff.role,
            tenantId: staff.tenantId,
            twoFactorEnabled: staff.twoFactorEnabled,
          },
          tokens,
          security: {
            suspicious: isSuspicious,
            message: isSuspicious ? '新しいデバイスからのログインを検出しました' : undefined,
          },
        },
      });

    } catch (error: any) {
      logger.error('Login error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'ログイン処理中にエラーが発生しました',
      });
    }
  }

  /**
   * ログアウト
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
      const user = (req as any).user;

      if (refreshToken) {
        await JWTService.revokeRefreshToken(refreshToken);
      }

      if (user?.staffId) {
        await SecurityService.logSecurityEvent(
          user.staffId,
          SECURITY_EVENTS.LOGOUT,
          'ログアウトしました',
          'INFO',
          undefined,
          SecurityService.getClientIP(req),
          req.headers['user-agent']
        );
      }

      res.json({
        success: true,
        message: 'ログアウトしました',
      });

    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'ログアウト処理中にエラーが発生しました',
      });
    }
  }

  /**
   * トークンリフレッシュ
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = RefreshTokenSchema.parse(req.body);
      
      const { staff, tokenRecord } = await JWTService.verifyAndUseRefreshToken(refreshToken);

      if (!staff || !tokenRecord) {
        res.status(401).json({
          success: false,
          error: '無効なリフレッシュトークンです',
        });
        return;
      }

      // 新しいアクセストークン生成
      const newAccessToken = JWTService.generateAccessToken({
        id: staff.id,
        staffId: staff.id,
        userId: staff.id,
        tenantId: staff.tenantId,
        email: staff.email,
        name: staff.email,
        role: staff.role as 'ADMIN' | 'MANAGER' | 'STAFF',
      });

      await SecurityService.logSecurityEvent(
        staff.id,
        SECURITY_EVENTS.TOKEN_REFRESH,
        'トークンがリフレッシュされました',
        'INFO',
        undefined,
        SecurityService.getClientIP(req),
        req.headers['user-agent']
      );

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          user: {
            id: staff.id,
            email: staff.email,
            role: staff.role,
            tenantId: staff.tenantId,
          },
        },
      });

    } catch (error: any) {
      logger.error('Token refresh error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'トークンリフレッシュ中にエラーが発生しました',
      });
    }
  }

  /**
   * パスワード変更
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);

      // 現在のパスワード検証
      const staff = await prisma.staff.findUnique({
        where: { id: user.staffId },
        select: { password: true },
      });

      if (!staff) {
        res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません',
        });
        return;
      }

      const isCurrentPasswordValid = await SecurityService.verifyPassword(
        currentPassword,
        staff.password
      );

      if (!isCurrentPasswordValid) {
        res.status(401).json({
          success: false,
          error: '現在のパスワードが正しくありません',
        });
        return;
      }

      // 新しいパスワードの強度チェック
      const passwordValidation = SecurityService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'パスワードが要件を満たしていません',
          details: passwordValidation.errors,
        });
        return;
      }

      // パスワード更新
      const hashedNewPassword = await SecurityService.hashPassword(newPassword);
      await prisma.staff.update({
        where: { id: user.staffId },
        data: { password: hashedNewPassword },
      });

      // 全リフレッシュトークンを無効化
      await JWTService.revokeAllRefreshTokens(user.staffId);

      await SecurityService.logSecurityEvent(
        user.staffId,
        SECURITY_EVENTS.PASSWORD_CHANGED,
        'パスワードが変更されました',
        'INFO',
        undefined,
        SecurityService.getClientIP(req),
        req.headers['user-agent']
      );

      res.json({
        success: true,
        message: 'パスワードを変更しました。再ログインが必要です。',
      });

    } catch (error: any) {
      logger.error('Change password error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'パスワード変更中にエラーが発生しました',
      });
    }
  }

  /**
   * 2FA設定開始
   */
  async setup2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const staff = await prisma.staff.findUnique({
        where: { id: user.staffId },
        select: { email: true, twoFactorEnabled: true },
      });

      if (!staff) {
        res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません',
        });
        return;
      }

      if (staff.twoFactorEnabled) {
        res.status(400).json({
          success: false,
          error: '2段階認証は既に有効です',
        });
        return;
      }

      const setup = await TwoFactorService.setup2FA(staff.email);

      // セットアップ情報を一時的に保存（実際の本番環境では Redis 等を使用）
      if (!req.session) {
        res.status(500).json({
          success: false,
          error: 'セッションが初期化されていません'
        });
        return;
      }
      req.session.temp2FASecret = setup.secret;

      res.json({
        success: true,
        data: {
          qrCodeUrl: setup.qrCodeUrl,
          manualEntryKey: TwoFactorService.formatSecretForDisplay(setup.manualEntryKey),
          backupCodes: setup.backupCodes,
        },
      });

    } catch (error: any) {
      logger.error('Setup 2FA error:', error);
      res.status(500).json({
        success: false,
        error: '2段階認証設定中にエラーが発生しました',
      });
    }
  }

  /**
   * 2FA設定完了
   */
  async enable2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { totpCode } = Setup2FASchema.parse(req.body);

      const tempSecret = req.session?.temp2FASecret;
      if (!tempSecret) {
        res.status(400).json({
          success: false,
          error: '2段階認証の設定が開始されていません',
        });
        return;
      }

      // TOTP検証
      const isValid = TwoFactorService.verifyTOTP(totpCode, tempSecret);
      if (!isValid) {
        res.status(400).json({
          success: false,
          error: '認証コードが正しくありません',
        });
        return;
      }

      // バックアップコード生成
      const backupCodes = TwoFactorService.generateBackupCodes();

      // 2FA有効化
      await prisma.staff.update({
        where: { id: user.staffId },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: tempSecret,
          backupCodes: JSON.stringify(backupCodes),
        },
      });

      // セッションクリア
      if (req.session) {
        delete req.session.temp2FASecret;
      }

      await SecurityService.logSecurityEvent(
        user.staffId,
        SECURITY_EVENTS.TWO_FA_ENABLED,
        '2段階認証が有効化されました',
        'INFO',
        undefined,
        SecurityService.getClientIP(req),
        req.headers['user-agent']
      );

      res.json({
        success: true,
        message: '2段階認証を有効にしました',
        data: { backupCodes },
      });

    } catch (error: any) {
      logger.error('Enable 2FA error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: '2段階認証有効化中にエラーが発生しました',
      });
    }
  }

  /**
   * 2FA無効化
   */
  async disable2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { password, totpCode, backupCode } = Disable2FASchema.parse(req.body);

      const staff = await prisma.staff.findUnique({
        where: { id: user.staffId },
        select: {
          password: true,
          twoFactorEnabled: true,
          twoFactorSecret: true,
          backupCodes: true,
        },
      });

      if (!staff) {
        res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません',
        });
        return;
      }

      if (!staff.twoFactorEnabled) {
        res.status(400).json({
          success: false,
          error: '2段階認証は無効です',
        });
        return;
      }

      // パスワード検証
      const isPasswordValid = await SecurityService.verifyPassword(password, staff.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'パスワードが正しくありません',
        });
        return;
      }

      // 2FA検証
      let is2FAValid = false;
      if (totpCode && staff.twoFactorSecret) {
        is2FAValid = TwoFactorService.verifyTOTP(totpCode, staff.twoFactorSecret);
      } else if (backupCode && staff.backupCodes) {
        const codes = JSON.parse(staff.backupCodes);
        const { isValid } = TwoFactorService.verifyBackupCode(backupCode, codes);
        is2FAValid = isValid;
      }

      if (!is2FAValid) {
        res.status(401).json({
          success: false,
          error: '2段階認証コードが正しくありません',
        });
        return;
      }

      // 2FA無効化
      await prisma.staff.update({
        where: { id: user.staffId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: null,
        },
      });

      await SecurityService.logSecurityEvent(
        user.staffId,
        SECURITY_EVENTS.TWO_FA_DISABLED,
        '2段階認証が無効化されました',
        'WARNING',
        undefined,
        SecurityService.getClientIP(req),
        req.headers['user-agent']
      );

      res.json({
        success: true,
        message: '2段階認証を無効にしました',
      });

    } catch (error: any) {
      logger.error('Disable 2FA error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: '2段階認証無効化中にエラーが発生しました',
      });
    }
  }

  /**
   * ユーザー情報取得
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const staff = await prisma.staff.findUnique({
        where: { id: user.staffId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      if (!staff) {
        res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません',
        });
        return;
      }

      res.json({
        success: true,
        data: staff,
      });

    } catch (error: any) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'プロフィール取得中にエラーが発生しました',
      });
    }
  }
}

export const authController = new AuthController();