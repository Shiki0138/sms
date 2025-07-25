-- ============================================
-- holiday_settingsテーブル確認用SQLクエリ集
-- ============================================

-- 1. テーブルの存在確認
-- テーブルが存在するかチェック
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'holiday_settings';

-- 2. テーブル構造の確認
-- カラム情報を取得
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'holiday_settings'
ORDER BY ordinal_position;

-- 3. インデックスの確認
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'holiday_settings';

-- 4. 制約の確認
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'holiday_settings'::regclass;

-- 5. RLSポリシーの確認
-- RLSが有効かチェック
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled,
    relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname = 'holiday_settings';

-- 既存のRLSポリシー一覧
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'holiday_settings';

-- 6. 現在のデータ確認
-- 全データを取得（件数が多い場合は注意）
SELECT * FROM holiday_settings ORDER BY created_at DESC LIMIT 100;

-- データ件数の確認
SELECT COUNT(*) AS total_records FROM holiday_settings;

-- ユーザー別のデータ件数
SELECT 
    user_id,
    COUNT(*) AS record_count
FROM holiday_settings
GROUP BY user_id
ORDER BY record_count DESC;

-- 7. 権限の確認
-- テーブルに対する権限を確認
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'holiday_settings';

-- 8. トリガーの確認
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'holiday_settings';

-- 9. 外部キー制約の確認
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'holiday_settings' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- 10. テーブルが存在しない場合の作成DDL
-- 以下は参考用のCREATE文です
/*
CREATE TABLE IF NOT EXISTS holiday_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_holiday BOOLEAN NOT NULL DEFAULT true,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);

-- RLSを有効化
ALTER TABLE holiday_settings ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成例
CREATE POLICY "Users can view own holiday settings" 
ON holiday_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holiday settings" 
ON holiday_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holiday settings" 
ON holiday_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holiday settings" 
ON holiday_settings FOR DELETE 
USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX idx_holiday_settings_user_id ON holiday_settings(user_id);
CREATE INDEX idx_holiday_settings_date ON holiday_settings(date);
CREATE INDEX idx_holiday_settings_user_date ON holiday_settings(user_id, date);
*/

-- 11. 最近の変更を確認
-- 最近作成されたレコード
SELECT * FROM holiday_settings 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 最近更新されたレコード
SELECT * FROM holiday_settings 
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;

-- 12. デバッグ用：特定ユーザーのデータ確認
-- user_idを指定して確認（実際のuser_idに置き換えてください）
/*
SELECT * FROM holiday_settings 
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY date DESC;
*/