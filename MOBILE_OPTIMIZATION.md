# 📱 モバイル最適化ガイド

## 🎯 モバイル対応の目標

スマートフォンユーザーが美容室の現場で快適に利用できるシステムを実現する。

---

## 📐 レスポンシブデザイン基準

### 画面サイズ対応
```css
/* ブレークポイント */
/* スマートフォン */
@media (max-width: 480px) {
  /* モバイル専用スタイル */
}

/* タブレット */
@media (min-width: 481px) and (max-width: 768px) {
  /* タブレット専用スタイル */
}

/* デスクトップ */
@media (min-width: 769px) {
  /* デスクトップ専用スタイル */
}
```

### 重要な設定項目
```html
<!-- viewport設定 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- PWA対応 -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
```

---

## 🎨 UI/UXガイドライン

### 1. タッチターゲットサイズ
```css
/* 最小タッチサイズ: 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* ボタンの間隔 */
.button-group button {
  margin: 8px;
}
```

### 2. フォント・文字サイズ
```css
/* 基本文字サイズ */
body {
  font-size: 16px; /* 最小推奨サイズ */
  line-height: 1.5;
}

/* 見出し */
h1 { font-size: 24px; }
h2 { font-size: 20px; }
h3 { font-size: 18px; }

/* 小さい文字は避ける */
.small-text {
  font-size: 14px; /* 最小限 */
}
```

### 3. 色とコントラスト
```css
/* 高コントラスト確保 */
.primary-text {
  color: #333333;
  background: #ffffff;
}

/* アクセシブルなカラーパレット */
.success { color: #22c55e; }
.warning { color: #f59e0b; }
.error { color: #ef4444; }
```

---

## 📋 ページ別最適化要件

### 1. ログイン画面
```javascript
// 最適化ポイント
- 入力フィールドの大きさ（最小44px高）
- パスワード表示/非表示ボタン
- キーボード表示時のレイアウト調整
- Touch IDの活用（将来的）

// 実装例
const LoginForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <input 
          className="w-full h-12 px-4 rounded-lg border text-16"
          type="email"
          placeholder="メールアドレス"
        />
        <input 
          className="w-full h-12 px-4 rounded-lg border text-16"
          type="password"
          placeholder="パスワード"
        />
        <button className="w-full h-12 bg-blue-600 text-white rounded-lg">
          ログイン
        </button>
      </div>
    </div>
  )
}
```

### 2. 顧客一覧
```javascript
// 最適化ポイント
- カード形式での表示
- 無限スクロールまたはページネーション
- スワイプでの操作（編集・削除）
- 検索フィールドの使いやすさ

// 実装例
const CustomerList = () => {
  return (
    <div className="p-4 space-y-3">
      {/* 検索バー */}
      <div className="sticky top-0 bg-white pb-2">
        <input 
          className="w-full h-12 px-4 rounded-lg border"
          placeholder="顧客名で検索..."
        />
      </div>
      
      {/* 顧客カード */}
      {customers.map(customer => (
        <div key={customer.id} className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <p className="text-gray-600">{customer.phone}</p>
            </div>
            <button className="w-10 h-10 text-blue-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 3. 予約カレンダー
```javascript
// 最適化ポイント
- 月/週/日表示の切り替え
- スワイプでの日付移動
- タップでの予約選択
- 予約詳細のモーダル表示

// 実装例
const MobileCalendar = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <button className="w-10 h-10">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold">2025年7月</h2>
          <button className="w-10 h-10">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      {/* カレンダー本体 */}
      <div className="flex-1 overflow-auto p-2">
        {/* 予約スロット */}
        {timeSlots.map(slot => (
          <div key={slot.time} className="border-b py-2">
            <div className="text-sm text-gray-600 mb-1">{slot.time}</div>
            {slot.reservations.map(reservation => (
              <div 
                key={reservation.id}
                className="bg-blue-100 rounded p-2 mb-1 text-sm"
              >
                {reservation.customerName}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* 新規予約ボタン */}
      <div className="p-4">
        <button className="w-full h-12 bg-blue-600 text-white rounded-lg">
          新規予約
        </button>
      </div>
    </div>
  )
}
```

### 4. 顧客詳細・編集
```javascript
// 最適化ポイント
- 入力フィールドの大きさと間隔
- 数値入力キーボードの活用
- 写真撮影・アップロード機能
- 保存・キャンセルボタンの配置

// 実装例
const CustomerEdit = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <form className="p-4 space-y-4">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">基本情報</h3>
          
          <input 
            className="w-full h-12 px-4 rounded-lg border"
            placeholder="お名前"
            value={customer.name}
          />
          
          <input 
            className="w-full h-12 px-4 rounded-lg border"
            type="tel"
            placeholder="電話番号"
            value={customer.phone}
          />
          
          <input 
            className="w-full h-12 px-4 rounded-lg border"
            type="email"
            placeholder="メールアドレス"
            value={customer.email}
          />
        </div>
        
        {/* アクションボタン */}
        <div className="flex space-x-3">
          <button 
            type="button"
            className="flex-1 h-12 border border-gray-300 rounded-lg"
          >
            キャンセル
          </button>
          <button 
            type="submit"
            className="flex-1 h-12 bg-blue-600 text-white rounded-lg"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## ⚡ パフォーマンス最適化

### 1. 画像最適化
```javascript
// レスポンシブ画像
const ResponsiveImage = ({ src, alt }) => {
  return (
    <picture>
      <source media="(max-width: 480px)" srcSet={`${src}?w=480`} />
      <source media="(max-width: 768px)" srcSet={`${src}?w=768`} />
      <img src={`${src}?w=1200`} alt={alt} loading="lazy" />
    </picture>
  )
}
```

### 2. コード分割
```javascript
// 遅延読み込み
const LazyCalendar = lazy(() => import('./components/Calendar/SalonCalendar'))
const LazyAnalytics = lazy(() => import('./components/Analytics/AnalyticsDashboard'))

// 使用例
<Suspense fallback={<LoadingSpinner />}>
  <LazyCalendar />
</Suspense>
```

### 3. キャッシュ戦略
```javascript
// Service Worker設定
const CACHE_NAME = 'salon-app-v1'
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
]

// インストール時
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})
```

---

## 🧪 テスト項目

### 1. 機能テスト
- [ ] 全ページでのスクロール動作
- [ ] フォーム入力の正確性
- [ ] ボタンのタップ反応
- [ ] モーダルの表示・非表示

### 2. パフォーマンステスト
- [ ] 初回読み込み時間（3秒以内）
- [ ] ページ遷移速度（1秒以内）
- [ ] スクロール時のフレームレート
- [ ] メモリ使用量

### 3. ユーザビリティテスト
- [ ] 片手での操作可能性
- [ ] 画面の見やすさ
- [ ] 直感的な操作性
- [ ] エラー時の分かりやすさ

### 4. 互換性テスト
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] 各種画面サイズ
- [ ] 横画面・縦画面