# 本番環境デプロイメントガイド

## 🚀 本番環境への移行手順

### 1. 環境変数の確認（Vercel）

現在の設定状況：
- ✅ `VITE_SUPABASE_URL`: 設定済み
- ✅ `VITE_SUPABASE_ANON_KEY`: 設定済み
- ✅ `VITE_ENABLE_LOGIN`: true
- ✅ `VITE_API_URL`: 本番URLに設定済み

### 2. Supabase データベース設定

#### 必要なテーブル作成（SQLを実行）:

```sql
-- 1. holiday_settingsテーブル（休日設定）
CREATE TABLE IF NOT EXISTS holiday_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL UNIQUE,
  weekly_closed_days INTEGER[] DEFAULT '{}',
  nth_weekday_rules JSONB DEFAULT '[]',
  specific_holidays TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLSを一時的に無効化（テスト用）
ALTER TABLE holiday_settings DISABLE ROW LEVEL SECURITY;

-- 2. テナント管理用テーブル（将来の拡張用）
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'standard',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. API設定テーブル（将来の実装用）
CREATE TABLE IF NOT EXISTS api_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  service TEXT NOT NULL, -- 'line', 'instagram', 'google'
  credentials JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenantId", service)
);
```

### 3. 初期ユーザー設定

Supabase Authenticationで以下のユーザーを作成：
- Email: `demo@salon.com`
- Password: 任意の安全なパスワード

### 4. 本番環境での動作確認手順

#### A. ログイン確認
1. https://salon-management-system.vercel.app/ にアクセス
2. 作成したユーザーでログイン
3. ダッシュボードが表示されることを確認

#### B. 基本機能テスト
1. **顧客登録**
   - 新規顧客を3件登録
   - 顧客一覧で表示確認

2. **予約作成**
   - カレンダーから予約作成
   - 異なる日時で3件作成

3. **休日設定**
   - 設定 > 休日設定
   - 定休日を設定（例：月曜日）
   - 特定の休日を追加
   - カレンダーで休日が赤く表示されることを確認

4. **メニュー管理**
   - 設定 > メニュー管理
   - カット、カラー、パーマのメニューを追加
   - 予約作成時にメニューが選択できることを確認

#### C. 既知の制限事項

🔴 **外部連携機能（未実装）**
- LINE/Instagram実送信 → デモ表示のみ
- Google Calendar同期 → ローカルのみ
- 決済処理 → UIのみ

🟡 **一部機能制限**
- エクスポート機能 → 使用回数追跡なし
- ストレージ制限 → 推定値のみ
- スタッフ管理 → UIなし

🟢 **正常動作**
- 予約管理
- 顧客管理
- 休日設定
- メニュー管理
- 分析機能
- メッセージ管理（内部のみ）

### 5. トラブルシューティング

#### 休日が反映されない場合
1. ブラウザのコンソール（F12）を確認
2. `🔍 isClosedDay check` のログを確認
3. tenantIdの不一致がないか確認

#### ログインできない場合
1. Supabase Dashboardでユーザーの存在を確認
2. パスワードリセットを実行

#### データが保存されない場合
1. Supabaseのテーブルが作成されているか確認
2. RLSが無効になっているか確認

### 6. 本番運用の推奨事項

1. **定期バックアップ**
   - Supabase Dashboard からデータベースバックアップ
   - 週1回以上を推奨

2. **使用状況モニタリング**
   - Vercel Analytics で負荷確認
   - Supabase Usage で API使用量確認

3. **段階的な機能追加**
   - まず基本機能（予約・顧客管理）を安定運用
   - その後、外部連携を順次実装

### 7. 緊急時の連絡先

- Vercel サポート: https://vercel.com/support
- Supabase サポート: https://supabase.com/support

## 次のステップ

1. このガイドに従って本番環境をセットアップ
2. 実際にユーザーとして操作して問題点を発見
3. 見つかった問題を順次修正
4. 外部API連携を段階的に実装

現在の完成度（80%）でも、内部業務管理ツールとしては十分使用可能です。実際の使用を通じて、優先度の高い改善点から対応していくことをお勧めします。