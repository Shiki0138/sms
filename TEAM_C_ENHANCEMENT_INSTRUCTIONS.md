# 🟢 チームC - 品質・データ・インフラ強化専用指示書

## 🎯 チームC ミッション
> **新機能の品質保証、大量データでのパフォーマンス最適化、堅牢なインフラ構築により、システムの「信頼性」を確保する**

---

## 📋 チームC 実装対象詳細

### 🗄️ **最優先タスク1: データベーススキーマ拡張**

#### 実装仕様
```sql
-- 顧客分析強化
ALTER TABLE customers ADD COLUMN segment VARCHAR(20);
ALTER TABLE customers ADD COLUMN lifetime_value DECIMAL(10,2);
ALTER TABLE customers ADD COLUMN risk_score INTEGER;
ALTER TABLE customers ADD COLUMN preferred_staff_id INTEGER;

-- 予約システム強化
ALTER TABLE reservations ADD COLUMN estimated_duration INTEGER;
ALTER TABLE reservations ADD COLUMN profit_margin DECIMAL(5,2);
ALTER TABLE reservations ADD COLUMN weather_impact VARCHAR(50);
ALTER TABLE reservations ADD COLUMN source_campaign VARCHAR(100);

-- メッセージ機能強化
ALTER TABLE message_threads ADD COLUMN ai_analyzed BOOLEAN DEFAULT FALSE;
ALTER TABLE message_threads ADD COLUMN sentiment_score REAL;
ALTER TABLE message_threads ADD COLUMN priority_level INTEGER;
ALTER TABLE message_threads ADD COLUMN auto_reply_enabled BOOLEAN DEFAULT TRUE;

-- 新テーブル群
CREATE TABLE customer_preferences (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  category VARCHAR(50),  -- 'service', 'staff', 'time', 'communication'
  preference_value TEXT,
  confidence_score REAL,
  last_updated DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE marketing_campaigns (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(50),     -- 'email', 'sms', 'line', 'instagram'
  target_segment VARCHAR(50),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  conversion_rate REAL,
  roi REAL
);

CREATE TABLE staff_performance (
  id INTEGER PRIMARY KEY,
  staff_id INTEGER,
  month DATE,
  appointments_count INTEGER,
  revenue_generated DECIMAL(10,2),
  customer_satisfaction REAL,
  upsell_rate REAL,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);
```

#### インデックス最適化
```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_customers_segment ON customers(segment);
CREATE INDEX idx_customers_last_visit ON customers(last_visit_date);
CREATE INDEX idx_reservations_date_staff ON reservations(start_time, staff_id);
CREATE INDEX idx_messages_thread_created ON message_threads(created_at);
CREATE INDEX idx_messages_unread ON message_threads(unread_count);

-- 複合インデックス
CREATE INDEX idx_customer_analytics ON customers(segment, lifetime_value, last_visit_date);
CREATE INDEX idx_reservation_analysis ON reservations(start_time, status, total_amount);
```

### 🧪 **最優先タスク2: 新機能テストスイート**

#### 実装仕様
```typescript
// tests/integration/aiFeatures.test.ts
describe('AI機能統合テスト', () => {
  test('OpenAI API返信生成', async () => {
    const mockCustomer = createMockCustomer()
    const mockThread = createMockMessageThread()
    
    const response = await request(app)
      .post('/api/v1/ai/generate-reply')
      .send({
        threadId: mockThread.id,
        customerData: mockCustomer,
        messageHistory: mockThread.messages
      })
    
    expect(response.status).toBe(200)
    expect(response.body.reply).toBeDefined()
    expect(response.body.confidence).toBeGreaterThan(0.5)
  })
  
  test('顧客分析データ整合性', async () => {
    // 1000件の顧客データで分析テスト
    const customers = await generateTestCustomers(1000)
    const analysis = await request(app)
      .get('/api/v1/analytics/customer-segments')
    
    expect(analysis.body.segments).toHaveLength(4)
    expect(analysis.body.totalCustomers).toBe(1000)
  })
})

// tests/performance/loadTest.test.ts
describe('負荷テスト', () => {
  test('大量データでの応答時間', async () => {
    // 5000件の予約データ
    await generateTestReservations(5000)
    
    const startTime = Date.now()
    const response = await request(app)
      .get('/api/v1/reservations?limit=100')
    const responseTime = Date.now() - startTime
    
    expect(responseTime).toBeLessThan(1000) // 1秒以内
    expect(response.status).toBe(200)
  })
})
```

#### テストカバレッジ目標
```bash
# カバレッジ要件
Line Coverage: 85%+
Function Coverage: 90%+
Branch Coverage: 80%+
Statement Coverage: 85%+

# テスト実行コマンド
npm run test:unit         # 単体テスト
npm run test:integration  # 統合テスト
npm run test:e2e          # E2Eテスト
npm run test:performance  # パフォーマンステスト
npm run test:security     # セキュリティテスト
```

### ⚡ **最優先タスク3: パフォーマンス最適化**

#### 実装仕様
```typescript
// src/middleware/caching.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`
    const cached = await redis.get(key)
    
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    // レスポンスをキャッシュ
    const originalSend = res.json
    res.json = function(data) {
      redis.setex(key, duration, JSON.stringify(data))
      return originalSend.call(this, data)
    }
    
    next()
  }
}

// 使用例
app.get('/api/v1/analytics/customer-segments', 
  cacheMiddleware(300), // 5分キャッシュ
  getCustomerSegments
)
```

#### データベース最適化
```typescript
// src/services/optimizedQueries.ts
export class OptimizedQueries {
  // 顧客一覧のページネーション最適化
  static async getCustomersPaginated(page: number, limit: number) {
    return await db.query(`
      SELECT 
        c.*,
        COUNT(r.id) as total_reservations,
        MAX(r.start_time) as last_reservation,
        SUM(r.total_amount) as lifetime_value
      FROM customers c
      LEFT JOIN reservations r ON c.id = r.customer_id
      GROUP BY c.id
      ORDER BY c.last_visit_date DESC
      LIMIT ? OFFSET ?
    `, [limit, page * limit])
  }
  
  // 分析データの事前計算
  static async preCalculateAnalytics() {
    // 毎日実行される集計処理
    await db.query(`
      INSERT OR REPLACE INTO daily_analytics (date, metric_name, metric_value)
      SELECT 
        DATE('now') as date,
        'total_revenue' as metric_name,
        SUM(total_amount) as metric_value
      FROM reservations 
      WHERE DATE(start_time) = DATE('now')
    `)
  }
}
```

### 🔒 **タスク4: セキュリティ強化**

#### 実装仕様
```typescript
// src/middleware/security.ts
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import validator from 'validator'

// セキュリティヘッダー
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// レート制限
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
  message: 'Too many requests'
})

// 入力値検証
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    next()
  }
}

// API設定の暗号化強化
export class SecureConfig {
  private static readonly ALGORITHM = 'aes-256-gcm'
  
  static encrypt(text: string): { encrypted: string, iv: string, tag: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.ALGORITHM, process.env.ENCRYPTION_KEY)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex')
    }
  }
}
```

### 📊 **タスク5: 監視・ログ強化**

#### 実装仕様
```typescript
// src/middleware/monitoring.ts
import winston from 'winston'
import prometheus from 'prom-client'

// メトリクス定義
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
})

const aiRequestCounter = new prometheus.Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['type', 'status']
})

// 構造化ログ
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// パフォーマンス監視ミドルウェア
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    httpRequestDuration
      .labels(req.method, req.route?.path || req.url, res.statusCode.toString())
      .observe(duration / 1000)
      
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent')
    })
  })
  
  next()
}
```

---

## 🛠️ 技術実装詳細

### 📦 新規依存関係
```json
{
  "dependencies": {
    "redis": "^4.6.0",
    "ioredis": "^5.3.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.1.0",
    "winston": "^3.11.0",
    "prom-client": "^15.0.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "supertest": "^6.3.0",
    "jest": "^29.7.0",
    "artillery": "^2.0.0"
  }
}
```

### 🐳 Docker最適化
```dockerfile
# Dockerfile.production
FROM node:18-alpine

# セキュリティ強化
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 依存関係のキャッシュ最適化
COPY package*.json ./
RUN npm ci --only=production

# アプリケーションコピー
COPY --chown=nextjs:nodejs . .

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4002/health || exit 1

USER nextjs

EXPOSE 4002

CMD ["npm", "start"]
```

### 📈 監視ダッシュボード
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  grafana-storage:
  redis-data:
```

---

## 📋 実装チェックリスト

### ✅ Day 1: データベース・インフラ強化
- [ ] データベーススキーマ拡張
- [ ] インデックス最適化実装
- [ ] Redis キャッシュ導入
- [ ] 監視システム構築

### ✅ Day 2-3: テスト・品質保証
- [ ] AI機能テストスイート作成
- [ ] 分析機能テスト実装
- [ ] パフォーマンステスト実装
- [ ] セキュリティテスト実装

### ✅ Day 4-5: 最適化・運用準備
- [ ] クエリ最適化実装
- [ ] キャッシュ戦略実装
- [ ] ログ・監視強化
- [ ] 本番デプロイ準備

### ✅ Day 6: 統合・最終確認
- [ ] 全機能統合テスト
- [ ] 負荷テスト実施
- [ ] セキュリティ監査
- [ ] 運用ドキュメント完成

---

## 🔍 品質基準・KPI

### ⚡ パフォーマンス要件
```typescript
interface PerformanceTargets {
  apiResponseTime: {
    simple: '< 200ms',      // 単純なGET
    complex: '< 1000ms',    // 複雑な分析
    ai: '< 3000ms'          // AI生成
  },
  throughput: {
    concurrent: 100,         // 同時接続数
    requestsPerSecond: 50   // 秒間リクエスト
  },
  database: {
    queryTime: '< 100ms',   // 通常クエリ
    analyticsQuery: '< 500ms' // 分析クエリ
  }
}
```

### 🛡️ セキュリティ要件
```typescript
interface SecurityTargets {
  encryption: {
    api_keys: 'AES-256-GCM',
    data_at_rest: 'Database encryption',
    data_in_transit: 'TLS 1.3'
  },
  authentication: {
    password_policy: '8+ chars, mixed case, numbers',
    session_timeout: '30 minutes',
    rate_limiting: '100 requests/15min'
  },
  validation: {
    input_sanitization: 'All user inputs',
    sql_injection: 'Parameterized queries',
    xss_protection: 'Content Security Policy'
  }
}
```

### 📊 監視・アラート
```typescript
interface MonitoringTargets {
  uptime: '99.9%',
  errorRate: '< 0.1%',
  alerts: {
    response_time: '> 2 seconds',
    error_rate: '> 1%',
    disk_usage: '> 80%',
    memory_usage: '> 90%'
  }
}
```

---

## 🚨 重要注意事項

### ⚠️ データ保護
- **本番データ**: 絶対に変更・削除しない
- **バックアップ**: 全作業前に必須実施
- **ロールバック**: 問題時の即座復旧準備
- **アクセス制御**: 最小権限の原則

### ⚠️ パフォーマンス影響
- **インデックス**: 追加時の書き込み性能への影響考慮
- **キャッシュ**: メモリ使用量の監視
- **ログ**: 大量ログによるディスク使用量
- **監視**: 監視自体のオーバーヘッド最小化

### ⚠️ セキュリティリスク
- **API キー**: 平文保存の絶対禁止
- **ログ**: 機密情報の出力禁止
- **テストデータ**: 本番環境での使用禁止
- **権限**: 最小必要権限での運用

---

## 📞 連携・サポート

### 🔴 チームAとの連携
- 新機能UIの動作テスト
- パフォーマンス問題の特定・修正
- ユーザビリティテスト実施

### 🔵 チームBとの連携
- API仕様の品質確認
- データベース設計レビュー
- AI機能の統合テスト

### 🆘 ブロッカー解決
1. **データベース問題**: スキーマ修正・ロールバック
2. **パフォーマンス問題**: プロファイリング・最適化
3. **セキュリティ問題**: 即座の修正・監査

---

## 🎯 完成目標

### 最終成果物
1. **堅牢なインフラ**: 高可用性・高性能・高セキュリティ
2. **完全なテスト**: 全機能の品質保証
3. **監視システム**: リアルタイム監視・アラート
4. **運用ドキュメント**: 保守・運用の完全手順書

### 品質基準
- **安定性**: 24/7 安定稼働
- **セキュリティ**: 最高レベルの保護
- **パフォーマンス**: 大量データでも高速動作
- **保守性**: 容易な運用・保守

---

**🎯 チームCミッション**: 美容室システムの品質・性能・セキュリティを最高水準に引き上げる

> ✨ **品質とインフラの力で、信頼されるシステムを構築しましょう！**