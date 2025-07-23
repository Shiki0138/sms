# 休日設定機能のセットアップガイド

## 概要
このシステムは複数の美容室（テナント）が利用するマルチテナント型のシステムです。各美容室の休日設定はSupabaseクラウドデータベースに保存され、どのデバイスからでもアクセスできます。

## Supabaseでのテーブル作成手順

### 1. Supabaseダッシュボードにログイン
1. [Supabase](https://app.supabase.com)にアクセス
2. プロジェクトを選択

### 2. SQLエディタでテーブルを作成
1. 左側メニューから「SQL Editor」を選択
2. 「New Query」をクリック
3. 以下のSQLをコピーして貼り付け：

```sql
-- まず既存のholiday_settingsテーブルを削除（存在する場合）
DROP TABLE IF EXISTS holiday_settings CASCADE;

-- 新しいholiday_settingsテーブルを作成
CREATE TABLE holiday_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL UNIQUE,
  weekly_closed_days INTEGER[] DEFAULT '{}',
  nth_weekday_rules JSONB DEFAULT '[]',
  specific_holidays TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT
);

-- インデックスを作成
CREATE INDEX idx_holiday_settings_tenant_id ON holiday_settings("tenantId");

-- Row Level Security (RLS)を有効化
ALTER TABLE holiday_settings ENABLE ROW LEVEL SECURITY;

-- 全てのユーザーがアクセスできるポリシーを作成（開発用）
CREATE POLICY "Allow all access to holiday_settings" ON holiday_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 更新時のタイムスタンプ自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_holiday_settings_updated_at
  BEFORE UPDATE ON holiday_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. 「Run」ボタンをクリックして実行

### 3. テーブルが作成されたことを確認
1. 左側メニューから「Table Editor」を選択
2. `holiday_settings`テーブルが表示されることを確認

## 機能の特徴

### マルチテナント対応
- 各美容室（テナント）ごとに独立した休日設定
- 他の美容室の設定は見えない・変更できない
- ログインユーザーごとに自動的に適切なデータを表示

### クラウド同期
- Supabaseクラウドデータベースに保存
- どのデバイス・ブラウザからでも同じ設定を参照
- リアルタイムで設定が同期される

### 休日設定の種類
1. **定休日**: 毎週決まった曜日
2. **第◯◯曜日**: 第2・第4火曜日など
3. **特別休業日**: 年末年始や臨時休業など

## トラブルシューティング

### エラー: "holiday_settingsテーブルが存在しません"
→ 上記の手順でテーブルを作成してください

### エラー: "permission denied for table holiday_settings"
→ RLSポリシーが正しく設定されていない可能性があります。上記のSQLを再実行してください

### 設定が保存されない
1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. Supabaseの接続設定（環境変数）が正しいか確認
3. ネットワーク接続を確認

## 本番環境での推奨設定

本番環境では、より厳格なセキュリティポリシーを適用することを推奨します：

```sql
-- 開発用のポリシーを削除
DROP POLICY IF EXISTS "Allow all access to holiday_settings" ON holiday_settings;

-- tenants/staffテーブルと連携した本番用ポリシー
CREATE POLICY "Staff can view own tenant holiday settings" ON holiday_settings
  FOR SELECT USING (
    "tenantId" IN (
      SELECT "tenantId" FROM staff WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Staff can update own tenant holiday settings" ON holiday_settings
  FOR ALL USING (
    "tenantId" IN (
      SELECT "tenantId" FROM staff WHERE id = auth.uid()::text
    )
  );
```