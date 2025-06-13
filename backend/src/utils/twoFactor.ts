import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { logger } from './logger';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export class TwoFactorService {
  /**
   * 2FA設定の初期化
   */
  static async setup2FA(userEmail: string, serviceName: string = '美容室管理システム'): Promise<TwoFactorSetup> {
    try {
      // シークレット生成
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: serviceName,
        length: 32,
      });

      // QRコード生成
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

      // バックアップコード生成
      const backupCodes = this.generateBackupCodes();

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        manualEntryKey: secret.base32,
      };
    } catch (error) {
      logger.error('2FA setup failed:', error);
      throw new Error('2FA設定に失敗しました');
    }
  }

  /**
   * TOTPトークン検証
   */
  static verifyTOTP(token: string, secret: string, window: number = 2): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window, // ±2分の時間窓を許可
      });
    } catch (error) {
      logger.error('TOTP verification failed:', error);
      return false;
    }
  }

  /**
   * バックアップコード生成
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // 8桁のランダムコード生成
      const code = Math.random().toString(36).substr(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * バックアップコード検証・使用
   */
  static verifyBackupCode(inputCode: string, backupCodes: string[]): {
    isValid: boolean;
    remainingCodes: string[];
  } {
    const upperInputCode = inputCode.toUpperCase().trim();
    const codeIndex = backupCodes.findIndex(code => code === upperInputCode);
    
    if (codeIndex === -1) {
      return {
        isValid: false,
        remainingCodes: backupCodes,
      };
    }

    // 使用されたコードを削除
    const remainingCodes = backupCodes.filter((_, index) => index !== codeIndex);
    
    return {
      isValid: true,
      remainingCodes,
    };
  }

  /**
   * 2FA QRコード再生成
   */
  static async regenerateQRCode(secret: string, userEmail: string, serviceName: string = '美容室管理システム'): Promise<string> {
    try {
      const otpauthUrl = speakeasy.otpauthURL({
        secret,
        label: userEmail,
        issuer: serviceName,
        encoding: 'base32',
      });

      return await qrcode.toDataURL(otpauthUrl);
    } catch (error) {
      logger.error('QR code regeneration failed:', error);
      throw new Error('QRコード生成に失敗しました');
    }
  }

  /**
   * 現在のTOTPトークン生成（テスト用）
   */
  static generateCurrentTOTP(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }

  /**
   * 2FA状態検証
   */
  static validate2FASetup(secret: string, testToken: string): boolean {
    if (!secret || !testToken) {
      return false;
    }

    return this.verifyTOTP(testToken, secret);
  }

  /**
   * 次のトークン更新時間を取得（秒）
   */
  static getTimeRemaining(): number {
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30; // TOTP time step (30秒)
    return timeStep - (now % timeStep);
  }

  /**
   * 2FA設定情報の安全な表示用フォーマット
   */
  static formatSecretForDisplay(secret: string): string {
    // 4文字ずつスペースで区切って表示しやすくする
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  }
}

export default TwoFactorService;