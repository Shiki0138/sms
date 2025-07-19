# Supabaseログイン問題の解決方法

## 問題の原因

1. **認証情報の不一致**
   - フロントエンド: `username`フィールドを使用
   - Supabase: `email`での認証が必要

2. **staffテーブルの不整合**
   - Supabase Authenticationにユーザーが存在
   - staffテーブルに対応するレコードがない

## 解決手順

### ステップ1: staffテーブルにレコードを追加

Supabase SQLエディタで以下を実行：

```sql
-- 管理者ユーザーをstaffテーブルに追加
INSERT INTO staff (email, name, role, "isActive", password, "tenantId")
VALUES (
  'あなたが登録したメールアドレス',
  'システム管理者',
  'ADMIN',
  true,
  'dummy-password-not-used',  -- Supabase認証を使うため実際には使用されません
  'demo-tenant-id'  -- または実際のテナントID
);
```

### ステップ2: ログイン方法

1. **ログイン画面で入力する値**：
   - ユーザー名欄: **メールアドレスを入力**（例: admin@example.com）
   - パスワード欄: Supabaseで設定したパスワード

2. **重要**: ユーザー名欄にメールアドレスを入力してください

### ステップ3: トラブルシューティング

#### エラー: "パスワードが正しくありません"
- staffテーブルにレコードが存在するか確認
- roleが大文字（ADMIN, STAFF, MANAGER）になっているか確認

#### SQLで確認:
```sql
-- staffテーブルの内容を確認
SELECT * FROM staff WHERE email = 'あなたのメールアドレス';
```

#### 必要に応じてroleを更新:
```sql
-- roleを大文字に変更
UPDATE staff 
SET role = 'ADMIN' 
WHERE email = 'あなたのメールアドレス';
```

### 一時的な解決策

開発中は環境変数でログインを無効化することも可能：

```env
VITE_ENABLE_LOGIN=false
```

これにより自動的に管理者としてログインされます。