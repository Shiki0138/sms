# 🔒 デモモード機能制限仕様書

## 概要
デモモードでは、システムの基本的な使い勝手を体験していただきながら、有料プランへのアップグレード意欲を高めるため、戦略的に機能を制限します。

## 🎯 制限戦略

### 1. 完全非表示にする機能（成約率向上のため）

#### AI分析・予測機能
- **理由**: 最も価値の高い機能として、有料プラン限定の特別感を演出
- **表示方法**: ダッシュボードに「🔒 AI分析機能」としてグレーアウト表示
- **メッセージ**: 「この機能は有料プランでご利用いただけます」

#### 外部API連携
- **理由**: 設定の複雑さを見せず、導入後のスムーズな連携をアピール
- **非表示項目**:
  - ホットペッパービューティー連携設定
  - LINE/Instagram連携設定
  - Google Calendar同期設定

#### 高度なレポート機能
- **理由**: データの価値を理解してもらうため、基本レポートのみ提供
- **非表示項目**:
  - カスタムレポート作成
  - 予測分析レポート
  - 顧客セグメント分析

### 2. 機能制限付きで表示する機能

#### 顧客管理
```javascript
// デモモード制限
const DEMO_LIMITS = {
  maxCustomers: 50,          // 顧客登録上限
  searchResults: 10,         // 検索結果表示上限
  exportEnabled: false,      // エクスポート無効
  bulkOperations: false,     // 一括操作無効
};
```

#### 予約管理
```javascript
// デモモード制限
const DEMO_BOOKING_LIMITS = {
  maxFutureBookings: 20,     // 未来の予約上限
  autoReminder: false,       // 自動リマインダー無効
  multiBooking: false,       // 複数予約無効
  waitingList: false,        // キャンセル待ち無効
};
```

#### メッセージ機能
```javascript
// デモモード制限
const DEMO_MESSAGE_LIMITS = {
  dailyLimit: 10,            // 1日の送信上限
  templates: 3,              // テンプレート数上限
  bulkSend: false,           // 一斉送信無効
  scheduling: false,         // 予約送信無効
};
```

### 3. 使用回数制限

| 機能 | デモ版制限 | 制限到達時メッセージ |
|------|-----------|-------------------|
| CSVエクスポート | 月1回 | 「エクスポート回数が上限に達しました。有料プランで無制限に！」 |
| レポート生成 | 1日3回 | 「本日のレポート生成回数が上限です。明日またお試しください」 |
| データインポート | 不可 | 「データインポート機能は有料プランでご利用いただけます」 |

## 📊 デモ用ダミーデータ

### 初期データセット
```javascript
const DEMO_INITIAL_DATA = {
  // 架空の顧客データ（30名）
  customers: [
    {
      name: "山田 花子",
      lastVisit: "2024-01-15",
      totalSpent: 45000,
      visitCount: 8,
      favoriteMenu: "カット＆カラー",
    },
    // ... 他29名
  ],
  
  // 過去3ヶ月の予約データ
  bookings: generateDemoBookings(90), // 90日分
  
  // 売上データ（右肩上がりのトレンド）
  sales: generatePositiveTrendSales(90),
};
```

### ダッシュボード表示
- 売上グラフ: 過去3ヶ月の上昇トレンド
- 顧客数: 緩やかな増加
- リピート率: 75%（高めに設定）
- 平均単価: ¥8,500

## 🚫 エラーメッセージとアップセル

### 制限到達時の表示
```typescript
// コンポーネント例
const LimitReachedModal = ({ feature, currentPlan, recommendedPlan }) => (
  <Modal>
    <h3>機能制限に達しました</h3>
    <p>{feature}をさらにご利用いただくには、アップグレードが必要です。</p>
    
    <div className="plan-comparison">
      <div className="current-plan">
        <h4>現在: デモ版</h4>
        <ul>
          <li>基本機能のみ</li>
          <li>データ登録50件まで</li>
        </ul>
      </div>
      
      <div className="recommended-plan">
        <h4>おすすめ: {recommendedPlan}プラン</h4>
        <ul>
          <li>全機能アンロック</li>
          <li>無制限データ登録</li>
          <li>AI分析機能</li>
        </ul>
      </div>
    </div>
    
    <button className="upgrade-btn">今すぐアップグレード</button>
  </Modal>
);
```

## 🎨 UI/UX配慮

### グレーアウト表示
- ロックアイコン付き
- ホバー時に「有料プラン限定」ツールチップ
- 魅力的な機能説明を表示

### プログレスバー表示
```typescript
// 使用量表示コンポーネント
const UsageProgress = ({ used, limit, feature }) => (
  <div className="usage-progress">
    <label>{feature}: {used}/{limit}</label>
    <progress value={used} max={limit} />
    {used >= limit * 0.8 && (
      <p className="warning">まもなく上限に達します</p>
    )}
  </div>
);
```

## 📱 デモモード設定

### 環境変数
```env
# デモモード設定
DEMO_MODE=true
DEMO_EXPIRY_DAYS=14
DEMO_DATA_RESET=daily
DEMO_FEATURE_RESTRICTIONS=true
```

### デモ期限管理
```typescript
// デモ期限チェック
const checkDemoExpiry = (user) => {
  const daysRemaining = calculateDaysRemaining(user.demoStartDate);
  
  if (daysRemaining <= 3) {
    showExpiryWarning(daysRemaining);
  }
  
  if (daysRemaining <= 0) {
    redirectToUpgradePage();
  }
};
```

## 🎯 成約促進施策

### 1. タイミング通知
- デモ開始3日後: 「AI機能を試してみませんか？」
- デモ開始7日後: 「データ分析で見える経営改善ポイント」
- デモ終了3日前: 「特別割引のご案内」

### 2. 成功体験の演出
- 初回ログイン時のウォークスルー
- 達成可能な目標設定（予約3件登録など）
- 完了時の祝福メッセージ

### 3. 価値の可視化
- 「このシステムで月◯時間の業務削減」
- 「リピート率◯%向上の可能性」
- 「売上◯%アップの事例紹介」

---

この制限仕様に基づいて、デモユーザーが基本機能を十分に体験しながら、有料プランの価値を感じていただける設計となっています。