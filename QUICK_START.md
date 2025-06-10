# 🚀 美容室統合管理システム - クイックスタートガイド

## エラー回避のための推奨手順

### ✅ 1. 正常な起動方法
```bash
cd /Users/MBP/LINE
./start-system.sh
```

### ✅ 2. 正常な停止方法
```bash
cd /Users/MBP/LINE
./stop-system.sh
```

### ✅ 3. アクセス URL
- **美容室管理システム**: http://localhost:4003
- **API ヘルスチェック**: http://localhost:4002/health

## 🛡️ エラーを防ぐための注意点

### 1. **必ず停止スクリプトを使用**
手動でプロセスを停止せず、必ず `./stop-system.sh` を使用してください

### 2. **ポート競合を避ける**
- ポート 4002, 4003 を他のアプリで使用しない
- Zoom、Skype等のアプリが使用する場合があります

### 3. **システム状態確認**
起動後、以下で正常性を確認：
```bash
curl http://localhost:4002/health
curl http://localhost:4003
```

### 4. **ログ監視**
問題発生時は以下でログを確認：
```bash
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

## 🔧 自動メッセージ機能

### 機能概要
1. **予約リマインダー**: 1週間前・3日前の自動送信
2. **来店促進**: 次回来店目安から1週間後の自動送信
3. **チャネル優先**: LINE → Instagram → Email
4. **テンプレート管理**: 管理画面で編集可能

### 使い方
1. システム起動後、http://localhost:4003 にアクセス
2. サイドバーの「自動メッセージ」をクリック
3. 設定のON/OFF切り替え
4. テンプレート内容の編集・保存
5. 手動実行テスト

## 🚨 トラブル時の対処

### よくあるエラーと解決法

#### 「このサイトにアクセスできません」
```bash
./stop-system.sh
./start-system.sh
```

#### ポート使用中エラー
```bash
lsof -ti:4002 | xargs kill -9
lsof -ti:4003 | xargs kill -9
./start-system.sh
```

#### データベースエラー
```bash
cd backend
npx prisma db push
./start-system.sh
```

## ⚡ 高速トラブルシューティング

1. **まず停止**: `./stop-system.sh`
2. **プロセス確認**: `ps aux | grep node`
3. **ポート確認**: `lsof -i :4002 && lsof -i :4003`
4. **再起動**: `./start-system.sh`
5. **動作確認**: ブラウザで http://localhost:4003

---

**💡 Tips**: 
- 起動スクリプトは自動でエラーチェック・修復を行います
- 問題が解決しない場合は `TROUBLESHOOTING.md` を参照
- システム全体のリセットが必要な場合は完全停止→起動で解決します