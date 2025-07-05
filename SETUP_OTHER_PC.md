# 他のPCでの使用方法

このドキュメントでは、美容室統合管理システムを他のPCで起動・使用する方法について説明します。

## 🖥️ 必要な環境

### システム要件
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 最低 4GB（推奨 8GB以上）
- **ストレージ**: 最低 2GB の空き容量

### 必要なソフトウェア
1. **Node.js 18以上**
   - [Node.js公式サイト](https://nodejs.org/) からダウンロード
   - インストール時に npm も自動的にインストールされます

2. **Git**
   - [Git公式サイト](https://git-scm.com/) からダウンロード

3. **コードエディタ（任意）**
   - Visual Studio Code (推奨)
   - Sublime Text
   - Atom など

## 🚀 セットアップ手順

### 1. リポジトリのクローン

ターミナル（コマンドプロンプト）を開いて以下を実行：

```bash
# リポジトリをクローン
git clone https://github.com/Shiki0138/salon-management-system.git

# プロジェクトディレクトリに移動
cd salon-management-system
```

### 2. 依存関係のインストール

```bash
# バックエンドの依存関係をインストール
cd backend
npm install

# フロントエンドの依存関係をインストール
cd ../frontend
npm install

# プロジェクトルートに戻る
cd ..
```

### 3. データベースの初期化

```bash
# バックエンドディレクトリに移動
cd backend

# Prismaマイグレーション実行
npx prisma migrate dev

# 初期データの投入
npx prisma db seed

# プロジェクトルートに戻る
cd ..
```

### 4. システムの起動

#### 🖥️ Windows の場合

PowerShellまたはコマンドプロンプトで：

```powershell
# バックエンド起動（新しいターミナルウィンドウで）
cd backend
npm run dev

# フロントエンド起動（別の新しいターミナルウィンドウで）
cd frontend
npm run dev
```

#### 🍎 macOS/Linux の場合

自動起動スクリプトを使用：

```bash
# 実行権限を付与
chmod +x start-system.sh stop-system.sh

# システム起動
./start-system.sh
```

## 🌐 アクセス方法

システムが正常に起動すると、以下のURLでアクセスできます：

- **メインアプリケーション**: http://localhost:4003
- **API サーバー**: http://localhost:4002
- **API ドキュメント**: http://localhost:4002/api/v1/docs

## 🔧 システム停止方法

### Windows の場合
各ターミナルウィンドウで `Ctrl + C` を押してプロセスを停止

### macOS/Linux の場合
```bash
./stop-system.sh
```

## 📱 使用方法

### 初回アクセス時
1. ブラウザで http://localhost:4003 にアクセス
2. 左側のサイドバーから各機能にアクセス可能

### 主要機能の場所
- **メッセージ管理**: サイドバー「メッセージ」
- **顧客管理**: サイドバー「顧客管理」  
- **予約管理**: サイドバー「予約管理」
- **分析**: サイドバー「分析」
- **設定**: サイドバー「設定」

### サンプルデータ
システムには以下のサンプルデータが含まれています：
- 顧客データ: 8人の顧客
- 予約データ: 複数の予約情報
- メッセージデータ: LINE/Instagram のサンプルメッセージ
- メニューデータ: 美容室の基本メニュー

## 🔄 データの更新・同期

### 最新コードの取得
```bash
# 最新の変更を取得
git pull origin master

# 依存関係の更新
cd backend && npm install
cd ../frontend && npm install

# データベースの更新
cd backend && npx prisma migrate dev
```

## ❗ トラブルシューティング

### ポートが既に使用されている場合
```bash
# Windows
netstat -ano | findstr :4003
netstat -ano | findstr :4002

# macOS/Linux  
lsof -ti:4003
lsof -ti:4002

# プロセス終了（PID確認後）
# Windows: taskkill /F /PID <PID>
# macOS/Linux: kill -9 <PID>
```

### データベースエラーの場合
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

### 依存関係エラーの場合
```bash
# node_modules削除と再インストール
rm -rf backend/node_modules frontend/node_modules
cd backend && npm install
cd ../frontend && npm install
```

### よくあるエラーと解決方法

1. **「Cannot find module」エラー**
   → `npm install` を再実行

2. **「Port already in use」エラー**
   → 既存のプロセスを停止してから再起動

3. **データベース接続エラー**
   → `npx prisma migrate reset` でデータベースをリセット

## 📞 サポート

問題が解決しない場合：
1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を確認
2. [GitHub Issues](https://github.com/Shiki0138/salon-management-system/issues) で質問投稿
3. プロジェクトの README.md を参照

## 🔐 セキュリティ注意事項

- 本システムは開発・テスト用です
- 本番環境で使用する場合は適切なセキュリティ設定が必要
- デフォルトではローカルネットワークからのみアクセス可能

---

**注意**: このシステムはデモ・開発用途向けです。実際の美容室業務で使用する場合は、適切なセキュリティ対策とバックアップ体制を整えてください。