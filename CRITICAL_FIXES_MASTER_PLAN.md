# 🚨 緊急修正指示書 - 本番デプロイ準備完了計画

## 📋 概要
現在発見された重大なエラーを修正し、自動リマインドメール機能を完全実装して、商用リリース可能な状態にする緊急修正計画

## 🎯 修正対象の重大問題

### 🔴 **Critical Issues (即座修正必須)**
1. **Prismaスキーマ不完全** - 3つのモデル定義不足
2. **TypeScript型エラー** - 74個のビルドエラー  
3. **自動リマインドメール** - 実装は存在するが機能停止中
4. **テスト環境破綻** - フロントエンド・バックエンド両方で問題

### 🟡 **High Priority Issues**
5. **サービス不安定** - 複数ポートで応答なし
6. **パフォーマンス問題** - バンドルサイズ過大
7. **セキュリティ設定** - 本番環境設定不備

---

## 🔧 チーム別修正指示

### 🔵 **チームB - バックエンド緊急修正隊**

#### **Phase 1: データベース・型修正 (2時間以内)**

##### 1.1 **Prismaスキーマ完成**
```prisma
// backend/prisma/schema.prisma に追加

model CustomerPreference {
  id         Int      @id @default(autoincrement())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // 設定項目
  preferredStaff    String?
  preferredTime     String?  // "morning", "afternoon", "evening"
  preferredDay      String?  // "monday", "tuesday", etc.
  communicationPref String   @default("LINE") // "LINE", "EMAIL", "SMS"
  
  // メニュー好み
  favoriteServices  String?  // JSON array
  avoidServices     String?  // JSON array
  
  // その他
  notes            String?
  lastUpdated      DateTime @default(now())
  
  @@unique([customerId, tenantId])
  @@map("customer_preferences")
}

model MarketingCampaign {
  id          Int      @id @default(autoincrement())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  name        String
  description String?
  type        String   // "EMAIL", "LINE", "SMS", "PROMOTION"
  status      String   @default("DRAFT") // "DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"
  
  // ターゲティング
  targetSegment     String?  // JSON criteria
  targetCustomerIds String?  // JSON array of customer IDs
  
  // スケジュール
  scheduledAt    DateTime?
  startDate      DateTime?
  endDate        DateTime?
  
  // コンテンツ
  messageContent String
  subject        String?
  
  // 結果
  sentCount      Int @default(0)
  openCount      Int @default(0)
  clickCount     Int @default(0)
  responseCount  Int @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("marketing_campaigns")
}

model StaffPerformance {
  id       Int      @id @default(autoincrement())
  staffId  String
  staff    Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  tenantId String
  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // 期間
  month    Int      // 1-12
  year     Int
  
  // パフォーマンス指標
  totalReservations    Int @default(0)
  totalRevenue         Float @default(0)
  avgServiceTime       Float @default(0) // minutes
  customerSatisfaction Float @default(0) // 1-5 scale
  
  // 顧客関係
  newCustomers     Int @default(0)
  repeatCustomers  Int @default(0)
  referrals        Int @default(0)
  
  // 効率性
  utilizationRate  Float @default(0) // percentage
  noShowRate       Float @default(0) // percentage
  cancelRate       Float @default(0) // percentage
  
  // 成長
  skillRating      Float @default(0) // 1-5 scale
  trainingHours    Float @default(0)
  certifications   String? // JSON array
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([staffId, month, year])
  @@index([tenantId, year, month])
  @@map("staff_performance")
}
```

##### 1.2 **TypeScript型定義修正**
```typescript
// backend/src/types/auth.ts 修正
export interface JWTPayload {
  staffId: string;
  userId: string;
  email: string;
  tenantId: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  iat?: number;
  exp?: number;
}

// Express Request型拡張
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      rawBody?: Buffer;
    }
  }
}
```

##### 1.3 **セキュリティミドルウェア修正**
```typescript
// backend/src/middleware/security.ts 修正内容
// - prisma.session → prisma.refreshToken に修正
// - 存在しないプロパティの削除
// - 型安全性の向上
```

#### **Phase 2: 自動リマインドメール完全実装 (3時間以内)**

##### 2.1 **Email Service実装**
```typescript
// backend/src/services/emailService.ts (新規作成)
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransporter(config);
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"美容室システム" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html || this.generateHtmlTemplate(message.text, message.subject)
      });

      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  private generateHtmlTemplate(text: string, subject: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subject}</h1>
          </div>
          <div class="content">
            ${text.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>このメールは美容室管理システムから自動送信されています。</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}
```

##### 2.2 **AutoMessageService修正**
```typescript
// backend/src/services/autoMessageService.ts 修正
import { EmailService } from './emailService';

export class AutoMessageService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  private async sendMessage(
    channel: MessageChannel,
    message: string,
    logId: string,
    context: any
  ): Promise<boolean> {
    try {
      switch (channel.type) {
        case 'EMAIL':
          // 実際のメール送信実装
          const emailSent = await this.emailService.sendEmail({
            to: channel.contactInfo,
            subject: this.generateEmailSubject(context.type, context),
            text: message
          });
          
          if (emailSent) {
            logger.info(`Email reminder sent to ${channel.contactInfo}: ${message}`);
            return true;
          } else {
            logger.error(`Failed to send email to ${channel.contactInfo}`);
            return false;
          }

        case 'LINE':
          // 既存のLINE実装
          return await this.sendLineMessage(channel.contactInfo, message);

        case 'SMS':
          // 既存のSMS実装
          return await this.sendSMSMessage(channel.contactInfo, message);

        default:
          logger.warn(`Unsupported channel type: ${channel.type}`);
          return false;
      }
    } catch (error) {
      logger.error(`Failed to send message via ${channel.type}:`, error);
      return false;
    }
  }

  private generateEmailSubject(type: string, context: any): string {
    switch (type) {
      case 'REMINDER_1_WEEK':
        return `【${context.tenantName}】ご予約確認 - 1週間前のリマインド`;
      case 'REMINDER_3_DAYS':
        return `【${context.tenantName}】ご予約確認 - 3日前のリマインド`;
      case 'FOLLOWUP_VISIT':
        return `【${context.tenantName}】お元気ですか？特別なご提案があります`;
      default:
        return `【${context.tenantName}】お知らせ`;
    }
  }
}
```

##### 2.3 **環境変数設定**
```env
# backend/.env に追加
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@salon-system.com

# Reminder Settings
REMINDER_ENABLED=true
EMAIL_REMINDER_ENABLED=true
LINE_REMINDER_ENABLED=true
```

#### **Phase 3: セキュリティ・パフォーマンス強化 (2時間以内)**

##### 3.1 **JWT修正**
```typescript
// backend/src/utils/jwt.ts 修正
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};
```

##### 3.2 **データベース実行**
```bash
# 実行コマンド
cd backend
npx prisma db push
npx prisma generate
npm run build
```

---

### 🔴 **チームA - フロントエンド修正隊**

#### **Phase 1: テスト環境修正 (1時間以内)**

##### 1.1 **Test Setup作成**
```typescript
// frontend/src/test/setup.ts (新規作成)
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

##### 1.2 **Vitest設定修正**
```typescript
// frontend/vitest.config.ts 修正
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'], // 正しいパス
    css: true,
  },
});
```

#### **Phase 2: リマインド設定UI実装 (2時間以内)**

##### 2.1 **リマインド設定コンポーネント**
```typescript
// frontend/src/components/Settings/ReminderSettings.tsx (新規作成)
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { Switch } from '../Common/Switch';
import { Button } from '../Common/Button';

interface ReminderSettings {
  emailEnabled: boolean;
  lineEnabled: boolean;
  weekBeforeEnabled: boolean;
  threeDaysBeforeEnabled: boolean;
  followUpEnabled: boolean;
  emailTemplates: {
    weekBefore: string;
    threeDays: string;
    followUp: string;
  };
}

export const ReminderSettings: React.FC = () => {
  const [settings, setSettings] = useState<ReminderSettings>({
    emailEnabled: true,
    lineEnabled: true,
    weekBeforeEnabled: true,
    threeDaysBeforeEnabled: true,
    followUpEnabled: true,
    emailTemplates: {
      weekBefore: '',
      threeDays: '',
      followUp: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReminderSettings();
  }, []);

  const fetchReminderSettings = async () => {
    try {
      const response = await fetch('/api/v1/settings/reminders');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch reminder settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/settings/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      // 成功通知
      alert('リマインド設定を保存しました');
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const testReminder = async (type: string) => {
    try {
      await fetch(`/api/v1/reminders/test/${type}`, {
        method: 'POST'
      });
      alert('テストメールを送信しました');
    } catch (error) {
      console.error('Failed to send test reminder:', error);
      alert('テスト送信に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">自動リマインド設定</h3>
          <p className="text-sm text-gray-600">
            予約の1週間前・3日前に自動でリマインドメッセージを送信します
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">メールリマインド</label>
              <Switch
                checked={settings.emailEnabled}
                onChange={(checked) => 
                  setSettings(prev => ({ ...prev, emailEnabled: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">LINEリマインド</label>
              <Switch
                checked={settings.lineEnabled}
                onChange={(checked) => 
                  setSettings(prev => ({ ...prev, lineEnabled: checked }))
                }
              />
            </div>
          </div>

          {/* タイミング設定 */}
          <div className="space-y-3">
            <h4 className="font-medium">送信タイミング</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">1週間前リマインド</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.weekBeforeEnabled}
                    onChange={(checked) => 
                      setSettings(prev => ({ ...prev, weekBeforeEnabled: checked }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testReminder('week')}
                  >
                    テスト送信
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">3日前リマインド</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.threeDaysBeforeEnabled}
                    onChange={(checked) => 
                      setSettings(prev => ({ ...prev, threeDaysBeforeEnabled: checked }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testReminder('3days')}
                  >
                    テスト送信
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">フォローアップメッセージ</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.followUpEnabled}
                    onChange={(checked) => 
                      setSettings(prev => ({ ...prev, followUpEnabled: checked }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testReminder('followup')}
                  >
                    テスト送信
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={saveSettings}
              loading={loading}
              className="bg-indigo-600 text-white"
            >
              設定を保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### **Phase 3: バンドル最適化 (1時間以内)**

##### 3.1 **Vite設定最適化**
```typescript
// frontend/vite.config.ts 修正
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['lucide-react', '@headlessui/react']
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

---

### 🟢 **チームC - QA・デプロイ修正隊**

#### **Phase 1: テスト修正・追加 (2時間以内)**

##### 1.1 **バックエンドテスト修正**
```typescript
// backend/src/test/reminder.test.ts (新規作成)
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AutoMessageService } from '../services/autoMessageService';
import { EmailService } from '../services/emailService';

describe('Reminder Email Service', () => {
  let autoMessageService: AutoMessageService;
  let emailService: EmailService;

  beforeEach(() => {
    autoMessageService = new AutoMessageService();
    emailService = new EmailService();
  });

  it('should send 1-week reminder email', async () => {
    // テスト実装
  });

  it('should send 3-day reminder email', async () => {
    // テスト実装
  });

  it('should send follow-up email', async () => {
    // テスト実装
  });
});
```

##### 1.2 **E2Eテスト追加**
```typescript
// frontend/src/__tests__/reminder-flow.test.ts (新規作成)
import { test, expect } from '@playwright/test';

test.describe('Reminder Settings', () => {
  test('should configure reminder settings', async ({ page }) => {
    await page.goto('/settings/reminders');
    
    // リマインド設定のテスト
    await expect(page.locator('[data-testid="email-reminder-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="line-reminder-toggle"]')).toBeVisible();
  });

  test('should send test reminder', async ({ page }) => {
    await page.goto('/settings/reminders');
    
    // テスト送信のテスト
    await page.click('[data-testid="test-week-reminder"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

#### **Phase 2: 本番環境設定 (2時間以内)**

##### 2.1 **Docker本番設定**
```dockerfile
# backend/Dockerfile.prod (新規作成)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

RUN npm run build
RUN npx prisma generate

USER nodejs
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["npm", "start"]
```

##### 2.2 **環境別設定**
```yaml
# docker-compose.prod.yml (新規作成)
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/salon_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    depends_on:
      - backend

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: salon_db
      POSTGRES_USER: salon_user
      POSTGRES_PASSWORD: salon_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### **Phase 3: 監視・アラート設定 (1時間以内)**

##### 3.1 **ヘルスチェック強化**
```typescript
// backend/src/routes/health.ts 修正
export const healthRouter = express.Router();

healthRouter.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      email: await checkEmailService(),
      redis: await checkRedis()
    }
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'OK');
  
  res.status(isHealthy ? 200 : 503).json(health);
});

async function checkEmailService(): Promise<{ status: string; message: string }> {
  try {
    const emailService = new EmailService();
    const isConnected = await emailService.testConnection();
    return {
      status: isConnected ? 'OK' : 'ERROR',
      message: isConnected ? 'Email service connected' : 'Email service connection failed'
    };
  } catch (error) {
    return { status: 'ERROR', message: 'Email service check failed' };
  }
}
```

---

## 📅 実行スケジュール

### **即座実行 (0-2時間)**
- チームB: Prismaスキーマ修正・データベース更新
- チームA: テスト環境修正
- チームC: Docker設定準備

### **Phase 1 (2-4時間)**
- チームB: TypeScript修正・メール機能実装
- チームA: リマインド設定UI実装
- チームC: テスト追加・修正

### **Phase 2 (4-6時間)**  
- チームB: セキュリティ強化・最終ビルド確認
- チームA: バンドル最適化・パフォーマンス改善
- チームC: 本番環境設定・監視設定

### **統合テスト (6-7時間)**
- 全チーム: 統合テスト・動作確認
- リマインドメール実機テスト
- 本番環境デプロイテスト

## 🎯 完成基準

### **必須要件 (100%完了必須)**
- [ ] TypeScriptビルドエラー0個
- [ ] 全テスト合格
- [ ] リマインドメール完全動作
- [ ] 本番デプロイ成功

### **品質要件**
- [ ] ヘルスチェック全項目OK
- [ ] セキュリティ監査クリア
- [ ] パフォーマンス目標達成
- [ ] 監視・アラート稼働

**完了期限**: 2024年12月15日 23:59
**責任者**: 各チームリード

> 🚀 **緊急修正により、商用リリース可能な完璧な状態を実現しましょう！**