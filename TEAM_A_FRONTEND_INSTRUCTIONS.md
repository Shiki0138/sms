# 🎨 チームA - フロントエンド開発指示書 (正式リリース準備版)

## 📋 ミッション概要
美容室管理システムのフロントエンド部門として、3つの料金プラン対応と本格リリース準備を完了させる

## 🎯 チームA概要
- **チーム名**: フロントエンド開発チーム  
- **主担当領域**: React + TypeScript フロントエンド実装・料金プラン機能・UI/UX最適化
- **専門技術**: React 18, TypeScript, Tailwind CSS, Vite
- **最終目標**: 3プラン対応の商用リリース可能なフロントエンドシステム

---

## 🎯 チームAの実装対象

### 📱 **最優先実装画面（Phase 1）**

#### 1. 🌅 「今日も素敵な1日が始まる！」感動ダッシュボード
```typescript
// 実装対象: src/components/Dashboard.tsx
【感動体験要件】
💫 朝一番の温かい挨拶「おはようございます！今日も素敵な1日にしましょう」
💫 今日の予約を「お客様の笑顔」をイメージできる表示
💫 「○○さんの誕生日です🎂」特別な日のハイライト
💫 美しいアニメーション付きの売上グラフ（成長を実感）
💫 スタッフへの励ましメッセージ「今月の目標まで後○○円！」

【心に響く機能】
✨ 時間帯別の「今日の笑顔予報」（予約状況を明るく表現）
✨ お客様の記念日・特別情報の温かい表示
✨ スタッフの頑張りを讃える成果表示
✨ 「今日のおすすめ提案」AI からの心遣い

【API連携】
- GET /api/v1/analytics/dashboard - ダッシュボードデータ
- GET /api/v1/reservations/today - 今日の予約
- GET /api/v1/messages/unread-count - 未読数
- WebSocket: リアルタイム更新通知
```

#### 2. 💝 「お客様との心のつながり」メッセージ管理
```typescript
// 実装対象: src/components/Messages/
【感動体験要件】
💫 まるでプライベートな会話のような親しみやすいデザイン
💫 新着メッセージは「お客様からの贈り物」のような特別感
💫 「○○さんは前回カラーをされましたね💄」自動表示の心遣い
💫 返信テンプレートも「心のこもった言葉」で構成
💫 送信後「お客様に喜んでもらえますように✨」の気持ち表示

【心に響く機能】
✨ お客様の顔写真と名前を大きく美しく表示
✨ 過去の来店履歴が「思い出のアルバム」のように表示
✨ 季節や時間に合わせた自動挨拶提案
✨ 「返信ありがとうございます😊」の感謝表現
✨ お客様との関係性が深まっていく「絆メーター」

【一斉送信も愛情込めて】
💌 セグメント別「特別なお知らせ」として表現
💌 「○○名様に心を込めてお送りします」の温かさ
💌 送信結果も「喜んでいただけました」として表示

【API連携】
- GET /api/v1/messages/threads - メッセージスレッド
- POST /api/v1/messages/send - メッセージ送信
- POST /api/v1/messages/broadcast/* - 一斉送信（7エンドポイント）
- WebSocket: /socket.io - リアルタイム受信
```

#### 3. 🗓️ 「時間の魔法使い」スマート予約管理
```typescript
// 実装対象: src/components/Reservations/
【感動体験要件】
💫 カレンダーを見るだけで「今日も充実した1日」と感じるデザイン
💫 予約は「お客様との約束」として特別に美しく表示
💫 「この時間なら○○さんが喜びそうです」AI提案の温かさ
💫 ドラッグ&ドロップで「時間を操る魔法使い」の楽しさ
💫 空き時間も「新しい出会いのチャンス」として前向きに表現

【心に響く機能】
✨ 「お客様への最高のおもてなし時間」として予約表示
✨ 「今日の素敵な出会い予定」カウンター
✨ 予約変更時「より良い時間をご提案」の心遣い表示
✨ スタッフの笑顔写真付きで温かみのある予定表
✨ 「お疲れ様でした」完了予約への労い表示

【AI提案も愛情込めて】
🤖 「きっと○○さんに喜んでもらえます」確信のメッセージ
🤖 「この組み合わせは相性抜群です」最適化への自信
🤖 「お客様の笑顔が見えます」予測の温かい表現

【API連携】
- GET /api/v1/reservations/availability/:date - 空き状況
- POST /api/v1/reservations/optimize - 最適化提案
- POST /api/v1/reservations/smart-book - スマート予約作成
- GET /api/v1/reservations/predictions - 需要予測
```

### 📊 **Phase 2実装対象**

#### 4. 🍽️ AIメニュー管理・推奨システム
```typescript
// 実装対象: src/components/Menus/
【機能要件】
✅ メニューCRUD操作インターフェース
✅ カテゴリ別メニュー表示・管理
✅ 顧客別AI推奨メニュー表示
✅ 推奨理由の可視化（グラフ・チャート）
✅ メニュー売上分析ダッシュボード

【API連携】
- GET/POST/PUT/DELETE /api/v1/menus - メニューCRUD
- GET /api/v1/menus/recommendations/:customerId - AI推奨
```

#### 5. 👥 顧客管理・分析画面
```typescript
// 実装対象: src/components/Customers/
【機能要件】
✅ 顧客一覧・詳細・編集画面
✅ 顧客セグメント表示（RFM分析結果）
✅ 来店履歴・購買履歴グラフ
✅ コミュニケーション履歴統合表示
✅ VIP・新規・離脱リスク顧客の視覚的分類

【API連携】
- GET /api/v1/customers - 顧客一覧
- GET /api/v1/messages/broadcast/segments - セグメント情報
```

---

## 🛠️ 技術実装仕様

### 📦 使用技術スタック
```json
{
  "core": {
    "React": "18.2.0",
    "TypeScript": "5.0+", 
    "Vite": "4.4.5"
  },
  "UI": {
    "Tailwind CSS": "3.3.0",
    "Headless UI": "1.7.0",
    "lucide-react": "アイコン"
  },
  "状態管理": {
    "Context API": "グローバル状態",
    "React Query": "サーバー状態管理"
  },
  "通信": {
    "axios": "HTTP通信",
    "socket.io-client": "リアルタイム通信"
  }
}
```

### 🏗️ コンポーネント設計原則
```typescript
// 1. コンポーネント分割戦略
src/components/
├── Layout/           // 共通レイアウト
├── Dashboard/        // ダッシュボード関連
├── Messages/         // メッセージ管理
├── Reservations/     // 予約管理
├── Menus/           // メニュー管理
├── Customers/       // 顧客管理
├── Analytics/       // 分析・レポート
└── Common/          // 共通UI部品

// 2. TypeScript型定義
src/types/
├── api.ts           // API レスポンス型
├── domain.ts        // ドメインオブジェクト型
└── ui.ts           // UI状態型
```

### 🔌 API統合実装
```typescript
// APIクライアント設計例
// src/services/apiClient.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:4002/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 認証トークン自動添付
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 📱 レスポンシブ対応
```css
/* Tailwind CSS レスポンシブ戦略 */
.container {
  /* モバイルファースト */
  @apply w-full px-4;
  
  /* タブレット */
  @apply md:px-6 md:max-w-4xl md:mx-auto;
  
  /* デスクトップ */
  @apply lg:px-8 lg:max-w-7xl;
}
```

---

## 📋 実装チェックリスト

### ✅ Phase 1（1日目）
- [ ] **開発環境構築**
  - [ ] 最新コードのpull・依存関係更新
  - [ ] team-a-frontendブランチ作成・切り替え
  - [ ] バックエンドAPIの動作確認
  
- [ ] **ダッシュボード実装**
  - [ ] レイアウト・ナビゲーション構築
  - [ ] リアルタイムデータ表示機能
  - [ ] 売上グラフコンポーネント
  
- [ ] **メッセージ画面実装**
  - [ ] メッセージリスト表示
  - [ ] リアルタイム受信（WebSocket）
  - [ ] 送信機能実装

### ✅ Phase 2（2日目）
- [ ] **予約管理実装**
  - [ ] カレンダーコンポーネント
  - [ ] 予約作成・編集機能
  - [ ] スマート提案UI（Instance B連携）
  
- [ ] **メニュー管理実装**
  - [ ] メニューCRUD画面
  - [ ] AI推奨表示（Instance A連携）

### ✅ Phase 3（3日目）
- [ ] **顧客管理実装**
  - [ ] 顧客一覧・詳細画面
  - [ ] セグメント表示
  
- [ ] **統合テスト・最適化**
  - [ ] 全機能統合テスト
  - [ ] パフォーマンス最適化
  - [ ] レスポンシブ対応確認

---

## 🔗 Instance連携仕様

### Instance B（スマート予約）との連携
```typescript
// 予約最適化提案の表示
interface OptimizationSuggestion {
  suggestedTime: string
  reason: string
  staffId: number
  confidence: number
}

// API呼び出し例
const getOptimization = async (customerId: number, date: string) => {
  const response = await apiClient.post('/reservations/optimize', {
    customerId, 
    preferredDate: date
  })
  return response.data as OptimizationSuggestion[]
}
```

### Instance C（通知）との連携  
```typescript
// WebSocket接続・リアルタイム通知受信
import io from 'socket.io-client'

const socket = io('http://localhost:4002')

socket.on('new_message', (message) => {
  // 新着メッセージのリアルタイム表示
  updateMessagesList(message)
})

socket.on('reservation_change', (reservation) => {
  // 予約変更のリアルタイム反映
  updateCalendar(reservation)
})
```

### Instance D（一斉送信）との連携
```typescript
// セグメント別顧客表示・一斉送信UI
interface CustomerSegment {
  name: string
  customerCount: number
  criteria: string
}

const getCustomerSegments = async () => {
  const response = await apiClient.get('/messages/broadcast/segments')
  return response.data as CustomerSegment[]
}
```

---

## 📊 品質・パフォーマンス目標

### 🎯 パフォーマンス KPI
| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| **初回ロード時間** | < 2秒 | Lighthouse |
| **画面遷移速度** | < 500ms | カスタム測定 |
| **API応答反映** | < 200ms | Network DevTools |
| **モバイル対応度** | 95点+ | Lighthouse Mobile |
| **アクセシビリティ** | 90点+ | Lighthouse A11y |

### 🔍 コード品質基準
```typescript
// TypeScript 厳格設定
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}

// ESLint ルール遵守
// - コンポーネント命名: PascalCase
// - Hook使用: カスタムフック抽出
// - Props型定義: interface必須
```

---

## 🚨 注意点・制約事項

### ⚠️ API制約
- **認証**: 全APIリクエストにJWTトークン必須
- **レート制限**: 1分間100リクエスト上限
- **CORS**: 本番環境でのOrigin設定要確認

### ⚠️ 既存コードとの互換性
- **既存App.tsx**: 既存実装を活用し、段階的に置き換え
- **スタイル**: Tailwind CSS基準に統一
- **ルーティング**: React Router v6使用

### ⚠️ ブラウザ対応
- **Chrome**: 100+
- **Firefox**: 100+  
- **Safari**: 15+
- **Edge**: 100+

---

## 📞 緊急時・サポート

### 🔧 技術サポート
- **API仕様不明**: チームBに即座確認
- **リアルタイム通信問題**: Instance C実装者に相談
- **デザイン要件**: 既存デザインを踏襲、必要に応じて改善提案

### 📋 進捗報告
```markdown
## チームA日次報告テンプレート
- **実装完了**: [完了した機能・画面]
- **進行中**: [現在作業中の項目]
- **ブロッカー**: [技術的問題・他チーム依存]
- **明日の予定**: [翌日の作業計画]
```

---

## 🎉 成功の定義

### ✅ 最終成果物
1. **完全統合フロントエンド**: 全46APIエンドポイントとの完全連携
2. **高品質UI**: モダンで直感的なユーザーインターフェース
3. **リアルタイム機能**: WebSocketによる即座の情報更新
4. **レスポンシブ対応**: モバイル・タブレット・デスクトップ完全対応
5. **パフォーマンス**: 全KPI目標値クリア

### 🚀 リリース準備
- **動作確認**: 全ブラウザでの動作テスト完了
- **統合テスト**: バックエンド・他チームとの完全連携確認
- **ドキュメント**: 操作マニュアル・技術仕様書作成

---

**🎯 チームAミッション**: 美容室スタッフが直感的に使える、最高品質のフロントエンドシステムを実現する

**📅 完成期限**: 2024年12月28日 18:00  
**🔗 連携チーム**: チームB（API）、チームC（品質保証）

> ✨ **React専門性を活かし、ユーザーが感動する美しく機能的なインターフェースを創造しましょう！**