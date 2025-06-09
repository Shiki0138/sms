# 美容室向けSaaS統合管理システム

## 概要
美容室向けのSaaS型統合メッセージ管理・予約管理・顧客管理システムです。
InstagramのDMとLINE公式アカウントのメッセージを一元管理し、Hot Pepper Beautyの予約とGoogleカレンダーを統合表示する機能を提供します。

## 主要機能
- 統合メッセージ管理（Instagram DM & LINE公式アカウント）
- 予約統合管理（Hot Pepper Beauty「サロンボード」 & Googleカレンダー）
- 顧客管理・分析機能
- 管理者向け機能（スタッフ管理・設定・統計など）

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Tailwind CSS
- Vite
- React Router
- React Query

### バックエンド
- Node.js + Express + TypeScript
- Prisma ORM
- JWT認証
- bcrypt

### データベース
- PostgreSQL 15

### 外部API
- Instagram Graph API
- LINE Messaging API
- Google Calendar API

### 開発環境
- Docker & Docker Compose
- ESLint + Prettier

## プロジェクト構造
```
salon-management-system/
├── backend/           # Node.js + Express API
├── frontend/          # React + TypeScript
├── database/          # DBスキーマとマイグレーション
├── docker-compose.yml # 開発環境
├── README.md
├── docs/              # ドキュメント
└── .gitignore
```

## 開発フェーズ

### フェーズ1: MVP (Minimum Viable Product)
- 統合メッセージ管理の基本機能
- 予約統合表示の基本機能
- 顧客管理の基本機能
- 認証システム

### フェーズ2: 機能拡充
- テンプレート返信機能
- 統計ダッシュボード
- スタッフアサイン・ステータス管理強化

### フェーズ3: 商用ローンチ
- マルチテナント対応
- セキュリティ強化
- 決済機能

## セットアップ手順

### 前提条件
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15

### 開発環境起動
```bash
# リポジトリクローン
git clone <repository-url>
cd salon-management-system

# 開発環境起動
docker-compose up -d

# バックエンド起動
cd backend
npm install
npm run dev

# フロントエンド起動
cd ../frontend
npm install
npm run dev
```

## API仕様
- 開発中のAPI仕様は `/docs/api-spec.md` を参照

## セキュリティ
- HTTPS通信
- JWT認証
- データベース暗号化
- マルチテナント対応によるデータ分離

## ライセンス
Proprietary - All rights reserved