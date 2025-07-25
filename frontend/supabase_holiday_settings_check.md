# Supabase holiday_settingsテーブル確認ガイド

## 確認方法

### 1. Supabase Dashboardでの確認

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. 該当プロジェクトを選択
3. 左側メニューから「Table Editor」をクリック
4. `holiday_settings`テーブルを探す

### 2. SQL Editorでの確認

1. Supabase Dashboardの左側メニューから「SQL Editor」を選択
2. `check_holiday_settings_table.sql`の各クエリを実行

### 3. 重要な確認ポイント

#### テーブルの存在確認
```sql
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE tablename = 'holiday_settings'
);
```

#### RLSの状態確認
```sql
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'holiday_settings';
```

#### 現在のポリシー確認
```sql
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'holiday_settings';
```

## トラブルシューティング

### テーブルが存在しない場合

1. SQL Editorで以下を実行：
```sql
CREATE TABLE holiday_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_holiday BOOLEAN NOT NULL DEFAULT true,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);
```

### RLSが無効な場合

1. RLSを有効化：
```sql
ALTER TABLE holiday_settings ENABLE ROW LEVEL SECURITY;
```

2. 必要なポリシーを作成：
```sql
-- 閲覧ポリシー
CREATE POLICY "Users can view own holiday settings" 
ON holiday_settings FOR SELECT 
USING (auth.uid() = user_id);

-- 作成ポリシー
CREATE POLICY "Users can insert own holiday settings" 
ON holiday_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 更新ポリシー
CREATE POLICY "Users can update own holiday settings" 
ON holiday_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- 削除ポリシー
CREATE POLICY "Users can delete own holiday settings" 
ON holiday_settings FOR DELETE 
USING (auth.uid() = user_id);
```

### データアクセスの問題

1. 現在のユーザーIDを確認：
```sql
SELECT auth.uid();
```

2. そのユーザーのデータを確認：
```sql
SELECT * FROM holiday_settings 
WHERE user_id = auth.uid();
```

## フロントエンドでの確認

### Supabase Clientの設定確認
```typescript
// lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数が正しく設定されているか確認
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)
```

### データ取得のテスト
```typescript
// テスト用コード
const testHolidaySettings = async () => {
  const { data, error } = await supabase
    .from('holiday_settings')
    .select('*')
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Data:', data)
  }
}
```

## 推奨される次のステップ

1. まず`check_holiday_settings_table.sql`のクエリ1-5を実行してテーブルとRLSの状態を確認
2. 問題が見つかった場合は、適切な修正SQLを実行
3. フロントエンドのコンソールでエラーメッセージを確認
4. 必要に応じてSupabaseのログを確認（Dashboard → Logs）