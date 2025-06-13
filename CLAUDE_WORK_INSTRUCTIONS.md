# 🤖 Claude作業分担指示書

## 📋 プロジェクト概要
**美容室統合管理システム**の革新的機能実装を複数のClaude instanceで並行作業

## 🎯 実装対象機能（優先度順）

### 🔥 **Claude Instance A - AIレコメンド機能付きメニュー管理システム**
```
📁 作業範囲: backend/src/controllers/menuController.ts + services/menuService.ts
🎯 目標: 顧客履歴ベースのAIメニューレコメンド機能実装

【実装内容】
1. データベーススキーマ拡張
   - Menu, MenuCategory, MenuRecommendation テーブル作成
   - 顧客来店履歴との関連付け

2. AIレコメンドエンジン
   - 顧客の過去メニュー分析
   - 季節・トレンド・年齢層別推奨
   - 売上最適化アルゴリズム

3. APIエンドポイント
   - GET /api/v1/menus - メニュー一覧
   - POST /api/v1/menus - メニュー作成
   - GET /api/v1/menus/recommendations/:customerId - AI推奨
   - PUT /api/v1/menus/:id - メニュー更新
   - DELETE /api/v1/menus/:id - メニュー削除

【技術仕様】
- TypeScript + Express.js
- Prisma ORM でデータベース操作
- 機械学習ライブラリ（tensorflow.js or simple-statistics）
- 既存のcustomerController.tsと連携

【完成条件】
✅ フロントエンドの既存メニュー管理UIが完全動作
✅ 顧客別AIレコメンド機能が動作
✅ メニューCRUD操作が完全実装
```

### 🚀 **Claude Instance B - スマート予約システム（空き時間最適化）**
```
📁 作業範囲: backend/src/services/smartBookingService.ts + reservationController.ts拡張
🎯 目標: AI駆動の予約最適化・空き時間提案システム

【実装内容】
1. 予約最適化アルゴリズム
   - スタッフスキル × メニュー適性マッチング
   - 移動時間・準備時間の考慮
   - 顧客優先度（VIP・リピーター）考慮

2. 予測アルゴリズム
   - No-show予測（過去データベース）
   - 繁忙期予測・需要予測
   - 動的価格調整提案

3. APIエンドポイント
   - POST /api/v1/reservations/optimize - 最適予約提案
   - GET /api/v1/reservations/availability/:date - 空き状況分析
   - POST /api/v1/reservations/smart-book - スマート予約作成
   - GET /api/v1/reservations/predictions - 需要予測データ

【技術仕様】
- 遺伝的アルゴリズム or 貪欲法での最適化
- 既存のreservationController.ts・googleCalendarService.ts連携
- Redis でキャッシュ最適化
- WebSocket for リアルタイム空き状況更新

【完成条件】
✅ 予約時に最適時間帯提案が表示
✅ スタッフ稼働率が可視化
✅ No-show予測が80%以上の精度
```

### ⚡ **Claude Instance C - リアルタイム通知システム**
```
📁 作業範囲: backend/src/services/notificationService.ts + WebSocket実装
🎯 目標: WebSocket基盤のリアルタイム通知システム

【実装内容】
1. WebSocket サーバー構築
   - Socket.io 実装
   - ルーム管理（スタッフ別・店舗別）
   - 接続状態管理・再接続処理

2. 通知エンジン
   - 新規メッセージ即座通知
   - 予約変更・キャンセル通知
   - 緊急アラート（遅刻・トラブル）
   - プッシュ通知（Service Worker）

3. APIエンドポイント
   - WebSocket /socket.io 
   - POST /api/v1/notifications/send - 通知送信
   - GET /api/v1/notifications - 通知履歴
   - PUT /api/v1/notifications/:id/read - 既読管理

【技術仕様】
- Socket.io for リアルタイム通信
- Service Worker for プッシュ通知
- Redis for セッション管理
- 既存messageController.ts連携

【完成条件】
✅ 新メッセージが1秒以内に全端末に配信
✅ オフライン復帰時の未読通知同期
✅ プッシュ通知がブラウザ・PWAで動作
```

### 💬 **Claude Instance D - パーソナライズド一斉送信システム**
```
📁 作業範囲: backend/src/services/broadcastService.ts + messageController.ts拡張
🎯 目標: 顧客セグメント別パーソナライズ一斉送信

【実装内容】
1. 顧客セグメンテーション
   - RFM分析（Recency, Frequency, Monetary）
   - 年齢・性別・地域別セグメント
   - 来店間隔・好みメニュー別分類
   - VIP・新規・離脱リスク顧客分類

2. パーソナライズエンジン
   - 動的コンテンツ生成（名前・過去メニュー挿入）
   - 送信タイミング最適化（顧客の活動時間分析）
   - A/Bテスト機能（件名・内容テスト）

3. APIエンドポイント
   - POST /api/v1/broadcast/segments - セグメント作成
   - GET /api/v1/broadcast/segments - セグメント一覧
   - POST /api/v1/broadcast/send - パーソナライズ一斉送信
   - GET /api/v1/broadcast/analytics - 送信効果分析

【技術仕様】
- キューシステム（Bull.js）で大量送信制御
- テンプレートエンジン（Handlebars）
- 既存externalApiService.ts（LINE・Instagram）連携
- 送信スケジューリング機能

【完成条件】
✅ 1000件以上の一斉送信が安定動作
✅ 開封率・反応率が20%向上
✅ セグメント別効果測定が可視化
```

## 🛠️ 共通技術仕様

### データベーススキーマ更新
```bash
# 各Instance は以下手順でDB更新
cd /Users/MBP/salon-management-system/backend
npx prisma db push
npx prisma generate
```

### 開発環境
```bash
# バックエンド起動
cd backend && npm run dev

# フロントエンド起動（別ターミナル）
cd frontend && npm run dev
```

### 連携ポイント
- 各機能は独立実装だが、共通の Customer・Reservation・Message テーブルを使用
- API仕様は OpenAPI で統一
- エラーハンドリングは既存 middleware/errorHandler.ts 使用

## 📋 作業完了報告フォーマット

```markdown
## ✅ [機能名] 実装完了報告

### 📊 実装サマリー
- ファイル数: X個
- コード行数: X行  
- APIエンドポイント: X個
- テストケース: X個

### 🔧 実装内容
1. [具体的実装項目1]
2. [具体的実装項目2]
3. [具体的実装項目3]

### 🚀 動作確認
- ✅ [確認項目1]
- ✅ [確認項目2] 
- ✅ [確認項目3]

### 📝 備考・注意事項
[他のInstanceとの連携で注意すべき点など]
```

## 🎯 推奨作業順序
1. **Instance A** → メニュー管理（基盤データ）
2. **Instance B** → スマート予約（メニューデータ活用）
3. **Instance C** → リアルタイム通知（予約変更通知）
4. **Instance D** → 一斉送信（全データ活用）

**各Instance は独立して作業開始可能です！**