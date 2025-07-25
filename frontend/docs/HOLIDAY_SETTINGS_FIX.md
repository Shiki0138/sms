# 休日設定がカレンダーに反映されない問題の修正ガイド

## 問題の概要
休日設定（定休日、第◯◯曜日、特別休業日）が保存されているにも関わらず、カレンダーに正しく反映されない問題。

## 原因
1. **テナントIDの不一致**: 設定保存時と読み込み時でテナントIDが異なる
2. **Supabaseテーブルの構造問題**: `holiday_settings`テーブルが存在しないか、カラムが不足
3. **リアルタイム同期の問題**: 設定変更がリアルタイムで反映されない
4. **認証状態の不整合**: デモユーザーと実際のSupabaseユーザーの切り替え時の問題

## 実装した修正

### 1. デバッグコンポーネントの追加
`HolidaySettingsDebug.tsx`を作成し、以下の情報を表示：
- 現在のテナントID
- Supabase認証状態
- 保存されている休日設定
- データベース内の全設定

### 2. 設定マネージャーの改善
`settings-manager.ts`の`subscribeToHolidaySettings`関数を修正：
```typescript
// 修正前: Promiseを返さない
export function subscribeToHolidaySettings(user: any, callback: Function) {
  getUnifiedTenantId(user).then(tenantId => {
    // ...
  })
}

// 修正後: async/awaitで適切にPromiseを返す
export async function subscribeToHolidaySettings(user: any, callback: Function) {
  const tenantId = await getUnifiedTenantId(user)
  // ...
  return subscription
}
```

### 3. Supabaseテーブル修正スクリプト
`20250125_fix_holiday_settings_table.sql`を作成：
- テーブルが存在しない場合は作成
- 必要なカラムが不足している場合は追加
- RLS（Row Level Security）の設定
- リアルタイム機能の有効化

## 設定手順

### ステップ1: Supabaseでテーブルを修正
1. Supabase Dashboardにログイン
2. SQL Editorを開く
3. `/frontend/supabase/migrations/20250125_fix_holiday_settings_table.sql`の内容を実行

### ステップ2: 環境変数の確認
`.env`ファイルで以下が正しく設定されているか確認：
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### ステップ3: デバッグ情報の確認
1. 設定ページ（営業時間・休日）を開く
2. 上部に表示される「休日設定デバッグ情報」を確認
3. テナントIDが正しいか確認
4. 推奨アクションに従って対処

### ステップ4: 休日設定の保存
1. 定休日を選択
2. 必要に応じて第◯曜日や特別休業日を追加
3. 「保存」ボタンをクリック
4. デバッグ情報で保存されたことを確認

### ステップ5: カレンダーで確認
1. カレンダー画面に移動
2. 設定した休日が赤色で表示されることを確認
3. 表示されない場合はページを再読み込み

## トラブルシューティング

### 問題: テナントIDが一致しない
**症状**: デバッグ情報で「テナントIDとSupabaseユーザーIDが一致しません」と表示される
**解決策**: 
- ログアウトして再ログイン
- ブラウザのキャッシュをクリア

### 問題: テーブルが存在しないエラー
**症状**: 「relation "holiday_settings" does not exist」エラー
**解決策**: 
- 上記のSQLスクリプトを実行
- Supabaseの権限設定を確認

### 問題: 設定が保存されない
**症状**: 保存ボタンを押してもエラーが出る
**解決策**: 
- Supabaseの認証状態を確認
- ネットワーク接続を確認
- ブラウザのコンソールでエラーを確認

### 問題: カレンダーに反映されない
**症状**: 設定は保存されているがカレンダーに表示されない
**解決策**: 
- ページを再読み込み（F5）
- ブラウザのキャッシュをクリア
- コンソールログで`isClosedDay`関数の出力を確認

## 技術詳細

### データフロー
1. **設定保存**: `AdvancedHolidaySettings` → `supabase.holiday_settings`
2. **設定読込**: `App.tsx` ← `settings-manager.ts` ← `supabase.holiday_settings`
3. **カレンダー表示**: `App.tsx`の`isClosedDay`関数 → `SalonCalendar`の`isHoliday`プロップ

### 重要なファイル
- `/frontend/src/components/Settings/AdvancedHolidaySettings.tsx` - 休日設定UI
- `/frontend/src/components/Settings/HolidaySettingsDebug.tsx` - デバッグ情報表示
- `/frontend/src/lib/settings-manager.ts` - 設定の読み書き
- `/frontend/src/lib/tenant-utils.ts` - テナントID管理
- `/frontend/src/App.tsx` - 休日判定ロジック（`isClosedDay`関数）
- `/frontend/src/components/Calendar/SalonCalendar.tsx` - カレンダー表示

## 今後の改善案
1. テナントID管理の一元化
2. オフライン対応（ローカルストレージへのキャッシュ）
3. 設定変更履歴の記録
4. 休日設定のインポート/エクスポート機能