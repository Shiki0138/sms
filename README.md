# 美容室統合管理システム

## 概要
美容室向けの包括的な顧客管理・予約管理システム

## 技術スタック
- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: PostgreSQL (Supabase)
- **認証**: JWT + 2FA
- **デプロイ**: Vercel (Frontend) + Supabase (Backend)

## セットアップ

### 環境変数の設定
`.env.example`を`.env`にコピーして、必要な値を設定してください。

### 開発環境の起動
```bash
# 依存関係のインストール
cd frontend && npm install
cd ../backend && npm install

# 開発サーバーの起動
cd frontend && npm run dev
cd ../backend && npm run dev
```

## デプロイ
- フロントエンド: Vercelにデプロイ
- バックエンド: Supabase Edge Functionsまたは他のNode.js対応サービス

## ライセンス
MIT