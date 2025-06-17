# 🔴 チームA - フロントエンド機能拡張専用指示書

## 🎯 チームA ミッション
> **美容室スタッフが「これは便利！」と感動する新機能UIを実装し、既存機能との完璧な統合を実現する**

---

## 📋 チームA 実装対象詳細

### 🤖 **最優先タスク1: AI返信生成機能UI**

#### 実装仕様
```typescript
// src/components/Messages/AIReplyGenerator.tsx
interface AIReplyGeneratorProps {
  threadId: string
  customerData: Customer
  messageHistory: Message[]
  onReplyGenerated: (reply: string) => void
}

// 機能要件
✅ 「AI返信を生成」ボタンをメッセージ返信フォームに追加
✅ ローディング状態表示（生成中...）
✅ 生成された返信文の編集可能プレビュー
✅ 「この返信を使用」「再生成」「手動作成」選択肢
✅ 顧客情報（名前、来店履歴、好み）を考慮した文面生成
```

#### UI配置
- メッセージ詳細画面の返信フォーム上部
- ワンクリックでAI返信提案を表示
- 美容室らしい温かみのある提案文

### 📊 **最優先タスク2: 顧客分析ダッシュボード**

#### 実装仕様
```typescript
// src/components/Analytics/CustomerAnalyticsDashboard.tsx
interface AnalyticsData {
  segments: CustomerSegment[]      // VIP、新規、リピーター、離脱リスク
  visitFrequency: FrequencyData[]  // 来店頻度分析
  servicePreferences: ServiceData[] // 人気サービス分析
  seasonalTrends: TrendData[]      // 季節別傾向
  marketingInsights: InsightData[] // マーケティング提案
}

// 表示項目
✅ 顧客セグメント円グラフ（VIP 15%, 常連 45%, 新規 25%, 離脱リスク 15%）
✅ 月別来店数推移グラフ
✅ 人気サービスランキング
✅ 顧客別平均単価分析
✅ AIによるマーケティング提案カード
```

#### 画面構成
- 新しいタブ「分析」を追加
- グラフ・チャートライブラリ使用（Chart.js推奨）
- エクスポート機能（PDF、Excel）

### 📅 **最優先タスク3: 高度な休日設定UI**

#### 実装仕様
```typescript
// src/components/Settings/AdvancedHolidaySettings.tsx
interface HolidayRule {
  type: 'weekly' | 'monthly' | 'yearly' | 'specific'
  pattern: string  // "second_tuesday", "12-31", "every_sunday"
  description: string
  isActive: boolean
}

// 設定パターン
✅ 毎週定休日（日曜日、月曜日など）
✅ 毎月指定日（第2火曜日、第4水曜日など）
✅ 年間指定日（12月31日、1月1-3日など）
✅ 特定日付指定（研修日、イベント日など）
✅ 休日カレンダープレビュー
```

#### UI要素
- ドラッグ&ドロップでルール並び替え
- カレンダープレビューで休日確認
- 「今月の休日」「来月の休日」一覧表示

### 🔌 **タスク4: 外部API設定管理画面**

#### 実装仕様
```typescript
// src/components/Settings/ExternalAPISettings.tsx
interface APISettings {
  line: {
    channelAccessToken: string
    channelSecret: string
    isConnected: boolean
    lastSync: string
  }
  instagram: {
    accessToken: string
    businessAccountId: string
    isConnected: boolean
    lastSync: string
  }
  openai: {
    apiKey: string
    model: string
    isActive: boolean
  }
}

// 機能
✅ API接続テスト機能
✅ 接続状態リアルタイム表示
✅ 設定保存・暗号化
✅ 同期履歴表示
✅ エラーログ表示
```

### 📱 **タスク5: ダミーデータ表示確認**

#### 確認項目
```typescript
// 大量ダミーデータでの動作確認
✅ 顧客1000件での一覧表示速度
✅ メッセージ5000件でのスクロール性能
✅ 予約3ヶ月分でのカレンダー表示
✅ 分析データ表示の正確性
✅ 検索・フィルター機能の動作
```

---

## 🛠️ 技術実装詳細

### 📦 新規依存関係
```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.30.0",
    "react-select": "^5.7.0",
    "react-calendar": "^4.6.0"
  }
}
```

### 🎨 新UIコンポーネント構造
```
src/components/
├── Analytics/
│   ├── CustomerAnalyticsDashboard.tsx
│   ├── SegmentChart.tsx
│   ├── TrendChart.tsx
│   └── MarketingInsights.tsx
├── Messages/
│   ├── AIReplyGenerator.tsx
│   └── ReplyPreview.tsx
├── Settings/
│   ├── AdvancedHolidaySettings.tsx
│   ├── ExternalAPISettings.tsx
│   └── APIConnectionTest.tsx
└── Common/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── ConfirmDialog.tsx
```

### 🔗 API統合
```typescript
// 新APIエンドポイント統合
const apiEndpoints = {
  // AI機能
  'POST /api/v1/ai/generate-reply': 'AI返信生成',
  'POST /api/v1/ai/analyze-customer': '顧客分析',
  
  // 分析機能
  'GET /api/v1/analytics/customer-segments': '顧客セグメント',
  'GET /api/v1/analytics/sales-trends': '売上傾向',
  
  // 設定機能
  'POST /api/v1/settings/holidays': '休日設定',
  'POST /api/v1/settings/api-config': 'API設定',
  
  // ダミーデータ
  'GET /api/v1/dummy/customers': 'ダミー顧客データ',
  'GET /api/v1/dummy/reservations': 'ダミー予約データ'
}
```

---

## 📋 実装チェックリスト

### ✅ Day 1-2: AI機能UI
- [ ] AIReplyGeneratorコンポーネント作成
- [ ] メッセージ画面にAI返信ボタン統合
- [ ] ローディング・エラー状態UI
- [ ] 返信プレビュー・編集機能

### ✅ Day 3-4: 分析ダッシュボード
- [ ] CustomerAnalyticsDashboardコンポーネント
- [ ] Chart.js統合・グラフ表示
- [ ] 分析タブ追加・ナビゲーション
- [ ] エクスポート機能実装

### ✅ Day 5-6: 設定・統合機能
- [ ] 高度な休日設定UI
- [ ] 外部API設定管理画面
- [ ] ダミーデータ表示テスト
- [ ] 全機能統合確認

---

## 🚨 重要注意事項

### ⚠️ 既存機能保護
- **既存のコンポーネントは絶対に削除しない**
- 新機能は既存機能に**追加**する形で実装
- 既存のスタイリング・動作を**破壊しない**
- 削除が必要な場合は**事前に確認**

### ⚠️ データ連携
- 顧客データは**全機能で一貫**して表示
- 予約データは**過去・現在・未来**すべて連携
- 新機能での**データ整合性**を必ず確認

### ⚠️ パフォーマンス
- 大量ダミーデータでの**動作速度**確認
- コンポーネントの**メモ化**適用
- **不要な再レンダリング**防止

---

## 📞 連携・サポート

### 🔵 チームBとの連携
- AI APIの仕様確認・テスト
- 新しいAPIエンドポイントの動作確認
- ダミーデータの形式・量の調整

### 🟢 チームCとの連携
- 新機能のテストケース作成
- パフォーマンステスト実施
- バグ報告・修正サイクル

### 🆘 ブロッカー解決
1. **API仕様不明**: チームBに即座確認
2. **デザイン判断**: 既存デザインパターンを踏襲
3. **技術的問題**: チーム間での知識共有

---

## 🎯 完成目標

### 最終成果物
1. **AI返信生成**: ワンクリックで自然な返信文生成
2. **顧客分析**: 美しいグラフでビジネス洞察提供
3. **高度設定**: 柔軟な休日・API設定管理
4. **完璧な統合**: 既存機能との矛盾のない連携

### 品質基準
- **直感的操作**: 説明不要で使える UI
- **高速動作**: 大量データでもサクサク動作
- **美しいデザイン**: プロフェッショナルな見た目
- **安定性**: エラーの起きない堅牢な実装

---

**🎯 チームAミッション**: 美容室経営者が「これは革新的だ！」と感動する最先端UIを実現する

> ✨ **React の力で、美容室業界に革命を起こしましょう！**