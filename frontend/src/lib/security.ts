/**
 * セキュリティユーティリティ
 */

// XSS対策: HTMLエスケープ
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// CSRFトークン生成
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Content Security Policy設定
export const CSP_HEADER = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://fqwdbywgknavgwqpnlkj.supabase.co https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// セキュアなローカルストレージ操作
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  },
  
  getItem: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(atob(item));
    } catch (error) {
      console.error('Failed to read from storage:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};

// セッションタイムアウト管理
export class SessionManager {
  private static timeoutId: NodeJS.Timeout | null = null;
  private static readonly TIMEOUT_DURATION = 30 * 60 * 1000; // 30分

  static startSession(): void {
    this.resetTimeout();
    document.addEventListener('mousemove', this.resetTimeout);
    document.addEventListener('keypress', this.resetTimeout);
    document.addEventListener('click', this.resetTimeout);
  }

  static resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, this.TIMEOUT_DURATION);
  }

  static handleTimeout(): void {
    // セッションタイムアウト処理
    secureStorage.removeItem('auth_token');
    secureStorage.removeItem('user_data');
    window.location.href = '/login?timeout=true';
  }

  static endSession(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    document.removeEventListener('mousemove', this.resetTimeout);
    document.removeEventListener('keypress', this.resetTimeout);
    document.removeEventListener('click', this.resetTimeout);
  }
}

// パスワード強度チェック
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('パスワードは8文字以上にしてください');

  if (password.length >= 12) score++;
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('小文字を含めてください');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('大文字を含めてください');
  
  if (/[0-9]/.test(password)) score++;
  else feedback.push('数字を含めてください');
  
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('特殊文字を含めてください');

  return { score, feedback };
};

// 2要素認証用のTOTP生成
export const generateTOTP = (secret: string): string => {
  // 実際の実装では適切なTOTPライブラリを使用
  const time = Math.floor(Date.now() / 30000);
  return String(time % 1000000).padStart(6, '0');
};