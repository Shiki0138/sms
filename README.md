# 美容室統合管理システム (Salon Management System)

完全な美容室向けSaaS管理システムです。顧客管理、予約管理、メッセージ統合管理、自動リマインダー機能を備えています。

## 🌟 主要機能

### 📱 統合メッセージ管理
- LINE・Instagram DM・Emailの一元管理
- 自動応答・AI返信生成
- 顧客とのコミュニケーション履歴管理
- 一斉送信機能（条件フィルター付き）

### ⏰ 自動リマインダー機能
- 予約1週間前・3日前の自動リマインダー
- LINE → Instagram → Email の優先順位自動送信
- カスタマイズ可能なメッセージテンプレート
- 次回来店促進メッセージ

### 📅 予約管理システム
- カレンダービュー（1日・3日・1週間・1ヶ月表示）
- 営業時間・定休日・臨時休業日の設定
- 予約ステータス管理
- 予約履歴の完全追跡

### 👥 顧客管理システム
- 顧客番号自動生成（年度別）
- 来店履歴・メニュー履歴管理
- 顧客属性・連絡先管理
- 担当スタッフ割り当て

### 🔧 メニュー管理
- カテゴリー別メニュー管理
- 料金・所要時間設定
- メニューの有効/無効切り替え
- 新規メニュー追加・編集・削除

### 📊 分析・レポート機能
- 売上分析・顧客分析
- 予約状況・スタッフ稼働率
- リアルタイムダッシュボード

### ⚙️ 管理機能
- スタッフ権限管理
- システム設定
- 外部API連携設定

## 🚀 クイックスタート

### 必要な環境
- Node.js 18以上
- npm または yarn

### インストールと起動

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd salon-management-system
```

2. **依存関係のインストール**
```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

3. **データベースの初期化**
```bash
cd ../backend
npx prisma migrate dev
npx prisma db seed
```

4. **システムの起動**
```bash
# プロジェクトルートディレクトリで
./start-system.sh
```

システムが起動後、以下のURLでアクセス可能です：
- **フロントエンド**: http://localhost:4003
- **バックエンドAPI**: http://localhost:4002
- **API仕様書**: http://localhost:4002/api/v1/docs

### 停止方法
```bash
./stop-system.sh
```

## 📋 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (アイコン)

### バックエンド
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- node-cron (スケジューラー)

### 開発ツール
- ESLint
- Prettier
- Jest (テスト)

## 🔧 開発環境

### 開発サーバーの起動
```bash
# フロントエンド開発サーバー
cd frontend
npm run dev

# バックエンド開発サーバー
cd backend
npm run dev
```

### データベース管理
```bash
# マイグレーション作成
npx prisma migrate dev --name migration_name

# データベースリセット
npx prisma migrate reset

# Prisma Studio（GUI）
npx prisma studio
```

## 📚 ドキュメント

- [QUICK_START.md](./QUICK_START.md) - 詳細なセットアップガイド
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - トラブルシューティング
- [PROJECT_EXPORT.md](./PROJECT_EXPORT.md) - プロジェクト概要

## 🆘 トラブルシューティング

よくある問題と解決方法は [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) をご確認ください。

### 主要なトラブルシューティング
1. **ポートの競合**: `./stop-system.sh` でプロセスを完全停止
2. **データベースエラー**: `npx prisma migrate reset` でリセット
3. **依存関係エラー**: `rm -rf node_modules && npm install` で再インストール

## 📈 今後の計画

- [ ] リアルタイム通知機能
- [ ] モバイルアプリ対応
- [ ] 決済システム連携
- [ ] 在庫管理機能
- [ ] 多店舗対応

## 🤝 コントリビューション

プルリクエストや課題報告をお待ちしています。

## 📄 ライセンス

MIT License

---

**開発者**: Claude & Human Collaboration  
**最終更新**: 2025年6月11日