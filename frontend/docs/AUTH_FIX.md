# 認証システムのバグ修正ガイド

## 問題の概要
ログイン時に2回ログイン画面が表示される問題。

## 原因
1. **重複した認証ラッパー**: 
   - `AppWrapper.tsx` と `App.tsx (RootApp)` の両方で `AuthProvider` を使用
   - これにより認証コンテキストが二重にラップされていた

2. **複数の認証システム**:
   - `pages/LoginPage.tsx` - mockAuthService を使用
   - `components/Auth/LoginPage.tsx` - AuthContext を使用
   - 2つの異なるログインページが存在

3. **ルーティングの競合**:
   - `AppWithAuth.tsx` と `AppWrapper.tsx` の2つのルーティングシステム
   - 異なるナビゲーションパスによる競合

## 実装した修正

### 1. メインエントリーポイントの統一
`main.tsx` を修正:
```typescript
// 修正前
import { AppWithAuth } from './AppWithAuth'

// 修正後
import AppWrapper from './AppWrapper'
```

### 2. 重複した AuthProvider の削除
`App.tsx` の `RootApp` コンポーネントを修正:
```typescript
// 修正前
return (
  <>
    <AuthProvider>
      <SubscriptionProvider>
        <AuthenticatedApp />
      </SubscriptionProvider>
    </AuthProvider>
  </>
)

// 修正後
return <AuthenticatedApp />
```

### 3. ルーティングの最適化
`AppWrapper.tsx` のルーティングを修正:
- ルートパス (`/`) を メインアプリケーションに設定
- `/dashboard` へのアクセスはルートパスにリダイレクト
- `replace` オプションを使用してブラウザ履歴の重複を防止

## 認証フロー

### 正しい認証フロー
1. ユーザーが `/` にアクセス
2. `AppWrapper` の `PrivateRoute` が認証状態をチェック
3. 未認証の場合は `/login` にリダイレクト
4. ログイン成功後、`/` にリダイレクト
5. `App` コンポーネントがレンダリング

### 認証コンテキストの階層
```
main.tsx
  └── AppWrapper (Router)
      └── AuthProvider
          └── SubscriptionProvider
              └── Routes
                  ├── /login → LoginPage
                  └── / → PrivateRoute → App
```

## トラブルシューティング

### 問題: まだ2回ログイン画面が表示される
**解決策**:
1. ブラウザのキャッシュをクリア
2. ローカルストレージをクリア
3. 開発サーバーを再起動

### 問題: ログイン後にリダイレクトされない
**解決策**:
1. `VITE_ENABLE_LOGIN` 環境変数が `true` に設定されているか確認
2. Supabase の認証設定を確認

### 問題: 認証状態が保持されない
**解決策**:
1. ローカルストレージの `salon_auth_token` キーを確認
2. JWT トークンの有効期限を確認

## 今後の改善案

1. **認証システムの統一**:
   - mockAuthService を削除し、Supabase 認証に統一
   - 不要な LoginPage コンポーネントを削除

2. **エラーハンドリングの改善**:
   - 認証エラー時の詳細なメッセージ表示
   - ネットワークエラー時の適切な処理

3. **セッション管理の強化**:
   - リフレッシュトークンの実装
   - セッションタイムアウトの設定

## ファイル構成

### 認証関連ファイル
- `/src/main.tsx` - アプリケーションのエントリーポイント
- `/src/AppWrapper.tsx` - 認証付きルーティングラッパー（使用中）
- `/src/AppWithAuth.tsx` - 旧認証ラッパー（未使用）
- `/src/contexts/AuthContext.tsx` - 認証コンテキスト
- `/src/components/Auth/LoginPage.tsx` - ログインページ（使用中）
- `/src/pages/LoginPage.tsx` - 旧ログインページ（未使用）
- `/src/services/mockAuth.ts` - モック認証サービス（未使用）