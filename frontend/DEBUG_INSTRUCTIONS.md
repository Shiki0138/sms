# 休日設定デバッグ手順 / Holiday Settings Debug Instructions

## greenroom51@gmail.com ユーザー向け

### 1. デバッグ機能の確認

1. **本番環境にアクセス**: https://salon-management-system.vercel.app/
2. **greenroom51@gmail.com** でログイン
3. 以下のデバッグ機能が動作します：

### 2. デバッグアラート

ログイン後、以下のタイミングでアラートが表示されます：

1. **休日設定読み込み時**:
   - App.tsx: 休日設定を読み込みました
   - AdvancedHolidaySettings: 休日設定を読み込みました

2. **休日設定保存時**:
   - デバッグ: 保存成功

3. **休日設定が見つからない場合**:
   - デバッグ: 休日設定が見つかりません

### 3. コンソールログの確認

ブラウザの開発者ツール（F12）を開いて、Consoleタブで以下を確認：

1. **初期化時のログ**:
   ```
   🔍 AdvancedHolidaySettings - Debug Info:
   ✅ App.tsx - Holiday settings loaded from Supabase:
   ```

2. **カレンダー表示時のログ**:
   ```
   🔍 isClosedDay check for YYYY-MM-DD:
   ✅ YYYY-MM-DD is weekly closed day
   ```

### 4. デバッグHTMLツール

もしアプリ内のデバッグパネルが見えない場合：
1. **https://salon-management-system.vercel.app/debug-holiday.html** にアクセス
2. 各ボタンをクリックして情報を確認

### 5. 確認手順

1. **設定ページ**で休日設定を確認・保存
2. **予約管理**ページに移動
3. カレンダーで休日が赤く表示されているか確認
4. コンソールログで休日判定が正しく動作しているか確認

### 6. トラブルシューティング

問題が続く場合は、以下を確認：

1. **Tenant ID の一致**: 
   - 設定保存時のTenant ID
   - カレンダー読み込み時のTenant ID
   - これらが一致しているか

2. **Supabaseテーブル**:
   - holiday_settingsテーブルが存在するか
   - データが正しく保存されているか

3. **データ形式**:
   - weekly_closed_days: 数値配列 [0-6]
   - specific_holidays: 文字列配列 ['YYYY-MM-DD']

### 7. デバッグ情報の共有

問題を報告する際は、以下の情報を含めてください：
- コンソールログのスクリーンショット
- アラートメッセージの内容
- デバッグHTMLツールの結果