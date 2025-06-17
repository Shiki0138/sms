# 🔵 チームB - バックエンド・AI統合専用指示書

## 🎯 チームB ミッション
> **OpenAI API統合、大量ダミーデータ生成、顧客分析ロジック実装により、システムの「頭脳」部分を強化する**

---

## 📋 チームB 実装対象詳細

### 🤖 **最優先タスク1: OpenAI API統合**

#### 実装仕様
```typescript
// src/services/openaiService.ts
interface AIReplyRequest {
  customerName: string
  messageHistory: Message[]
  customerData: {
    visitHistory: Visit[]
    preferences: string[]
    lastService: string
  }
  messageType: 'initial' | 'booking' | 'complaint' | 'general'
}

interface AIReplyResponse {
  reply: string
  confidence: number
  reasoning: string
  alternatives: string[]
}

// 実装API
✅ POST /api/v1/ai/generate-reply - AI返信生成
✅ POST /api/v1/ai/analyze-sentiment - 感情分析
✅ POST /api/v1/ai/suggest-service - サービス提案
✅ POST /api/v1/ai/marketing-insights - マーケティング洞察
```

#### OpenAI プロンプト設計
```javascript
const replyPrompts = {
  initial: `あなたは美容室の受付スタッフです。以下の初回お問い合わせに対して、温かく丁寧な返信を作成してください。
  
  顧客情報:
  - お名前: {customerName}
  - 問い合わせ内容: {messageContent}
  
  返信要件:
  - 美容室らしい温かみのある言葉遣い
  - 具体的な予約提案
  - 150文字以内
  - 敬語使用`,
  
  booking: `予約に関するお問い合わせへの返信を作成してください...`,
  complaint: `苦情・不満への誠実な対応返信を作成してください...`,
  general: `一般的なお問い合わせへの親切な返信を作成してください...`
}
```

### 📊 **最優先タスク2: 顧客分析ロジック実装**

#### 実装仕様
```typescript
// src/services/customerAnalyticsService.ts
interface CustomerSegmentation {
  vip: Customer[]        // 年間20万円以上、月1回以上
  regular: Customer[]    // 年間10万円以上、3ヶ月以内来店
  newbie: Customer[]     // 初回来店から3ヶ月以内
  atrisk: Customer[]     // 6ヶ月以上未来店
}

interface AnalyticsMetrics {
  totalRevenue: number
  averageVisitInterval: number
  customerLifetimeValue: number
  retentionRate: number
  popularServices: ServiceRanking[]
  seasonalTrends: TrendData[]
}

// 実装API
✅ GET /api/v1/analytics/customer-segments - 顧客セグメント分析
✅ GET /api/v1/analytics/revenue-trends - 売上傾向分析
✅ GET /api/v1/analytics/service-popularity - サービス人気度
✅ GET /api/v1/analytics/marketing-recommendations - マーケティング提案
```

#### 分析アルゴリズム
```javascript
// RFM分析実装
const calculateRFM = (customer) => {
  const recency = daysSinceLastVisit(customer)
  const frequency = visitCountInPeriod(customer, 365)
  const monetary = totalSpentInPeriod(customer, 365)
  
  return {
    recencyScore: getRecencyScore(recency),
    frequencyScore: getFrequencyScore(frequency),
    monetaryScore: getMonetaryScore(monetary),
    segment: determineSegment(recencyScore, frequencyScore, monetaryScore)
  }
}
```

### 💾 **最優先タスク3: 大量ダミーデータ生成**

#### 生成仕様
```typescript
// scripts/generateDummyData.ts
interface DummyDataSpecs {
  customers: 1000,      // 顧客1000名
  reservations: 5000,   // 予約5000件（過去2年+未来6ヶ月）
  messages: 8000,       // メッセージ8000件
  services: 50,         // サービス50種類
  staff: 10            // スタッフ10名
}

// データ生成ルール
✅ 現実的な顧客名（日本人名ジェネレーター使用）
✅ 地域に基づく住所生成
✅ 年齢・性別に応じたサービス傾向
✅ 季節性を考慮した予約パターン
✅ リアルなメッセージ会話パターン
```

#### 生成スクリプト
```bash
# ダミーデータ生成コマンド
npm run generate:dummy-data

# データベースリセット+ダミーデータ
npm run reset:with-dummy

# 特定データのみ生成
npm run generate:customers
npm run generate:reservations
npm run generate:messages
```

### 🔌 **タスク4: 外部API連携基盤**

#### 実装仕様
```typescript
// src/services/externalAPIService.ts
interface ExternalAPIConfig {
  line: {
    channelAccessToken: string
    channelSecret: string
    webhookUrl: string
  }
  instagram: {
    accessToken: string
    businessAccountId: string
    appId: string
  }
  openai: {
    apiKey: string
    model: 'gpt-4' | 'gpt-3.5-turbo'
    maxTokens: number
  }
}

// 実装API
✅ POST /api/v1/integrations/line/test - LINE API接続テスト
✅ POST /api/v1/integrations/instagram/test - Instagram API接続テスト
✅ PUT /api/v1/integrations/config - API設定保存
✅ GET /api/v1/integrations/status - 連携状態確認
```

### 📅 **タスク5: 高度な休日設定ロジック**

#### 実装仕様
```typescript
// src/services/holidayService.ts
interface HolidayRule {
  id: string
  type: 'weekly' | 'monthly' | 'yearly' | 'specific'
  pattern: string
  description: string
  isActive: boolean
}

// パターン例
const holidayPatterns = {
  'every_sunday': '毎週日曜日',
  'second_tuesday': '毎月第2火曜日',
  'last_wednesday': '毎月最終水曜日',
  'dec_31': '毎年12月31日',
  'golden_week': 'ゴールデンウィーク期間'
}

// 実装API
✅ POST /api/v1/settings/holidays - 休日ルール設定
✅ GET /api/v1/settings/holidays/preview - 休日カレンダープレビュー
✅ GET /api/v1/settings/holidays/conflicts - 予約競合チェック
```

---

## 🛠️ 技術実装詳細

### 📦 新規依存関係
```json
{
  "dependencies": {
    "openai": "^4.20.0",
    "axios": "^1.6.0",
    "@faker-js/faker": "^8.3.0",
    "date-fns": "^2.30.0",
    "crypto": "^1.0.1"
  }
}
```

### 🗄️ データベーススキーマ拡張
```sql
-- 顧客分析テーブル
CREATE TABLE customer_analytics (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  rfm_recency INTEGER,
  rfm_frequency INTEGER,
  rfm_monetary INTEGER,
  segment VARCHAR(20),
  last_calculated DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- AI返信ログテーブル
CREATE TABLE ai_reply_logs (
  id INTEGER PRIMARY KEY,
  thread_id VARCHAR(255),
  prompt TEXT,
  response TEXT,
  confidence REAL,
  used BOOLEAN,
  created_at DATETIME
);

-- 休日設定テーブル
CREATE TABLE holiday_rules (
  id INTEGER PRIMARY KEY,
  type VARCHAR(20),
  pattern VARCHAR(100),
  description TEXT,
  is_active BOOLEAN,
  created_at DATETIME
);

-- 外部API設定テーブル（暗号化）
CREATE TABLE api_configurations (
  id INTEGER PRIMARY KEY,
  service_name VARCHAR(50),
  config_data TEXT,  -- JSON暗号化
  is_active BOOLEAN,
  last_tested DATETIME
);
```

### 🔐 セキュリティ実装
```typescript
// API設定暗号化
import crypto from 'crypto'

const encryptAPIConfig = (config: any): string => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY)
  let encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

const decryptAPIConfig = (encryptedData: string): any => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
}
```

---

## 📋 実装チェックリスト

### ✅ Day 1: AI統合基盤
- [ ] OpenAI API クライアント設定
- [ ] AI返信生成エンドポイント
- [ ] プロンプトエンジニアリング
- [ ] エラーハンドリング実装

### ✅ Day 2: ダミーデータ生成
- [ ] Faker.js統合
- [ ] 現実的なデータ生成ルール
- [ ] 大量データ生成スクリプト
- [ ] データベース投入・確認

### ✅ Day 3-4: 分析機能実装
- [ ] 顧客セグメンテーションロジック
- [ ] RFM分析アルゴリズム
- [ ] 売上・傾向分析機能
- [ ] 分析APIエンドポイント群

### ✅ Day 5-6: 外部API・設定機能
- [ ] LINE/Instagram API統合
- [ ] API設定暗号化・管理
- [ ] 高度な休日設定ロジック
- [ ] 統合テスト・最適化

---

## 🔗 新APIエンドポイント一覧

### 🤖 AI機能
```
POST   /api/v1/ai/generate-reply
POST   /api/v1/ai/analyze-sentiment  
POST   /api/v1/ai/suggest-service
POST   /api/v1/ai/marketing-insights
```

### 📊 分析機能
```
GET    /api/v1/analytics/customer-segments
GET    /api/v1/analytics/revenue-trends
GET    /api/v1/analytics/service-popularity
GET    /api/v1/analytics/marketing-recommendations
GET    /api/v1/analytics/dashboard-summary
```

### 🔌 外部API統合
```
POST   /api/v1/integrations/line/test
POST   /api/v1/integrations/instagram/test
PUT    /api/v1/integrations/config
GET    /api/v1/integrations/status
POST   /api/v1/integrations/sync
```

### ⚙️ 設定機能
```
POST   /api/v1/settings/holidays
GET    /api/v1/settings/holidays/preview
GET    /api/v1/settings/holidays/conflicts
PUT    /api/v1/settings/business-rules
```

### 💾 ダミーデータ
```
GET    /api/v1/dummy/customers
GET    /api/v1/dummy/reservations
GET    /api/v1/dummy/messages
POST   /api/v1/dummy/generate
POST   /api/v1/dummy/reset
```

---

## 🚨 重要注意事項

### ⚠️ OpenAI API制約
- **レート制限**: 1分間50リクエスト
- **コスト管理**: トークン使用量監視
- **エラー処理**: API障害時の代替フロー
- **セキュリティ**: APIキーの安全な管理

### ⚠️ ダミーデータ品質
- **現実性**: 実際の美容室データに近い傾向
- **整合性**: 顧客・予約・メッセージの関連性
- **多様性**: 様々なパターンの網羅
- **パフォーマンス**: 大量データでの動作確認

### ⚠️ データ連携
- **既存データ保護**: 本番データの絶対保護
- **マイグレーション**: 段階的なスキーマ更新
- **バックアップ**: 変更前の必須バックアップ

---

## 📞 連携・サポート

### 🔴 チームAとの連携
- AI返信UIとの動作確認
- 分析データの表示形式調整
- API仕様の詳細共有

### 🟢 チームCとの連携
- 新機能の負荷テスト
- データベース最適化
- セキュリティテスト実施

### 🆘 ブロッカー解決
1. **OpenAI API問題**: 代替プロンプト・モデル検討
2. **データ生成エラー**: スクリプト修正・デバッグ
3. **パフォーマンス問題**: クエリ最適化・インデックス追加

---

## 🎯 完成目標

### 最終成果物
1. **AI返信**: 自然で美容室らしい返信文自動生成
2. **顧客分析**: 実用的なビジネス洞察提供
3. **大量データ**: 現実的で高品質なテストデータ
4. **外部連携**: 安全で安定したAPI統合

### 品質基準
- **高速処理**: AI生成3秒以内、分析1秒以内
- **高精度**: AI返信の自然さ・分析の正確性
- **堅牢性**: エラー時の適切なフォールバック
- **セキュリティ**: API情報の完全な保護

---

**🎯 チームBミッション**: AIと分析の力で美容室経営を革新するインテリジェントシステムを構築する

> ✨ **Node.js とAI の融合で、美容室業界の未来を創造しましょう！**