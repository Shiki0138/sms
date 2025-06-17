# ✅ 美容室統合管理システム - デプロイ後確認チェックリスト

## 🎯 概要
本ドキュメントは、美容室統合管理システムの本番デプロイ後に実施すべき確認項目をまとめたものです。

## 📋 基本システム確認

### 1. 🩺 ヘルスチェック（必須）
```bash
# システム全体の健康状態確認
curl http://localhost/health
# 期待値: HTTP 200 + "healthy"

# バックエンドAPI確認  
curl http://localhost/api/v1/system/health
# 期待値: 詳細なシステム状態JSON

# フロントエンド確認
curl -I http://localhost/
# 期待値: HTTP 200 + Content-Type: text/html
```

**✅ 確認完了**: [ ] システム全体正常稼働  
**✅ 確認完了**: [ ] API応答正常  
**✅ 確認完了**: [ ] フロントエンド正常表示

### 2. 🗄️ データベース接続確認
```bash
# PostgreSQL接続確認
docker compose exec database pg_isready -U salon_user -d salon_management
# 期待値: "accepting connections"

# データベース内容確認
docker compose exec database psql -U salon_user -d salon_management -c "\dt"
# 期待値: テーブル一覧表示
```

**✅ 確認完了**: [ ] PostgreSQL正常接続  
**✅ 確認完了**: [ ] テーブル構造正常

### 3. 🔄 Redis接続確認
```bash
# Redis接続確認
docker compose exec redis redis-cli ping
# 期待値: "PONG"

# Redis設定確認
docker compose exec redis redis-cli config get requirepass
# 期待値: パスワード設定されている
```

**✅ 確認完了**: [ ] Redis正常稼働  
**✅ 確認完了**: [ ] セキュリティ設定正常

## 🔐 セキュリティ確認

### 1. 認証システム動作確認
```bash
# 認証エンドポイント確認
curl -X GET http://localhost/api/v1/auth/health
# 期待値: HTTP 200

# 未認証アクセス制限確認
curl -X GET http://localhost/api/v1/analytics/dashboard
# 期待値: HTTP 401 Unauthorized
```

**✅ 確認完了**: [ ] 認証システム正常  
**✅ 確認完了**: [ ] アクセス制御正常

### 2. HTTPS・セキュリティヘッダー確認
```bash
# セキュリティヘッダー確認
curl -I http://localhost/
# 確認項目:
# - X-Frame-Options: SAMEORIGIN
# - X-Content-Type-Options: nosniff
# - X-XSS-Protection: 1; mode=block
```

**✅ 確認完了**: [ ] セキュリティヘッダー設定済み  
**⚠️ 要対応**: [ ] SSL証明書設定（本番環境推奨）

## 📊 監視システム確認

### 1. Prometheus監視確認
```bash
# Prometheus稼働確認
curl http://localhost:9090/-/healthy
# 期待値: "Prometheus is Healthy."

# メトリクス収集確認
curl http://localhost:9090/api/v1/targets
# 期待値: ターゲット一覧（UP状態確認）
```

**✅ 確認完了**: [ ] Prometheus正常稼働  
**✅ 確認完了**: [ ] メトリクス収集正常

### 2. Grafana監視ダッシュボード確認
```bash
# Grafana稼働確認
curl http://localhost:3000/api/health
# 期待値: {"database":"ok","version":"..."}

# 管理者ログイン確認
# ブラウザで http://localhost:3000 にアクセス
# admin / <GRAFANA_ADMIN_PASSWORD> でログイン
```

**✅ 確認完了**: [ ] Grafana正常稼働  
**✅ 確認完了**: [ ] 管理者ログイン成功  
**✅ 確認完了**: [ ] ダッシュボード表示正常

### 3. アラート設定確認
```bash
# Alertmanager稼働確認
curl http://localhost:9093/-/healthy
# 期待値: "OK"
```

**✅ 確認完了**: [ ] Alertmanager正常稼働

## 🚀 パフォーマンス確認

### 1. レスポンス時間確認
```bash
# API応答時間測定
time curl http://localhost/api/v1/system/health
# 目標: 100ms以下

# フロントエンド表示時間測定
time curl http://localhost/
# 目標: 500ms以下
```

**✅ 確認完了**: [ ] API応答時間 < 100ms  
**✅ 確認完了**: [ ] フロントエンド表示 < 500ms

### 2. 同時接続テスト
```bash
# 軽負荷テスト（10同時接続）
for i in {1..10}; do
  curl http://localhost/health &
done
wait
# 期待値: 全て成功
```

**✅ 確認完了**: [ ] 同時接続テスト成功

## 💾 バックアップシステム確認

### 1. 自動バックアップ動作確認
```bash
# バックアップコンテナ状態確認
docker compose ps backup
# 期待値: Up状態

# バックアップファイル確認
ls -la ./backups/
# 期待値: 日付付きバックアップファイル存在
```

**✅ 確認完了**: [ ] バックアップシステム稼働  
**✅ 確認完了**: [ ] バックアップファイル生成確認

### 2. バックアップリストア手順確認
```bash
# テスト用データベース作成＆リストア
# （実際のリストアテストは慎重に実施）
echo "バックアップリストア手順確認済み"
```

**✅ 確認完了**: [ ] リストア手順確認

## 🎨 フロントエンド機能確認

### 1. 主要画面表示確認
ブラウザで以下を確認：

1. **ログイン画面**: http://localhost/login
   - [ ] 画面正常表示
   - [ ] フォーム動作確認

2. **ダッシュボード**: http://localhost/dashboard  
   - [ ] 画面正常表示
   - [ ] チャート表示確認

3. **顧客管理**: http://localhost/customers
   - [ ] 顧客一覧表示
   - [ ] 検索機能動作

**✅ 確認完了**: [ ] 全主要画面正常表示

### 2. モバイル対応確認
```bash
# モバイルUser-Agent テスト
curl -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
     http://localhost/
# 期待値: レスポンシブデザイン対応
```

**✅ 確認完了**: [ ] モバイル表示正常

## 🔗 外部API連携確認（オプション）

### 1. OpenAI API連携確認
```bash
# AI分析機能テスト（API設定済みの場合）
curl -X POST http://localhost/api/v1/ai/analyze \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <test_token>" \
     -d '{"data":"test"}'
```

**✅ 確認完了**: [ ] OpenAI連携正常  
**N/A**: [ ] 未設定（本番で設定予定）

### 2. LINE API連携確認
```bash
# LINE通知機能テスト（設定済みの場合）
# テストメッセージ送信確認
```

**✅ 確認完了**: [ ] LINE連携正常  
**N/A**: [ ] 未設定（本番で設定予定）

## 📈 システムリソース確認

### 1. メモリ・CPU使用量確認
```bash
# コンテナリソース使用量確認
docker stats --no-stream
# 確認項目:
# - CPU使用率 < 50%
# - メモリ使用率 < 70%
```

**✅ 確認完了**: [ ] CPU使用率正常  
**✅ 確認完了**: [ ] メモリ使用率正常

### 2. ディスク容量確認
```bash
# ディスク使用量確認
df -h
# 確認項目: / パーティション < 80%

# Dockerディスク使用量確認  
docker system df
```

**✅ 確認完了**: [ ] ディスク容量十分

## 📋 最終確認チェックリスト

### システム全体
- [ ] 全サービス正常稼働（Up状態）
- [ ] ヘルスチェック全て正常
- [ ] ログにエラーなし
- [ ] パフォーマンス要件達成

### セキュリティ
- [ ] 認証システム正常動作
- [ ] アクセス制御正常
- [ ] セキュリティヘッダー設定済み
- [ ] デフォルトパスワード全て変更済み

### 監視・運用
- [ ] Prometheus収集正常
- [ ] Grafanaダッシュボード動作
- [ ] アラート設定完了
- [ ] バックアップ自動実行確認

### ユーザビリティ
- [ ] フロントエンド全機能正常
- [ ] モバイル対応確認
- [ ] 主要ユーザーフロー動作確認

## 🎉 運用開始承認

**システム管理者承認**: [ ] 全項目確認完了  
**品質保証承認**: [ ] 品質基準達成確認  
**プロジェクト責任者承認**: [ ] 本番運用開始承認

---

**📅 確認実施日**: ___________  
**👤 確認実施者**: ___________  
**📝 特記事項**: 

```
確認時に発見された問題点：
1. 
2. 
3. 

対応完了事項：
1. 
2. 
3. 
```

**🎯 結論**: 
- [ ] ✅ 本番運用開始可能
- [ ] ⚠️ 軽微な修正後運用開始可能  
- [ ] ❌ 重大な問題あり、修正必要

---

**📞 運用開始後の緊急連絡先**:
- システム管理者: admin@salon-system.com
- 技術サポート: tech-support@salon-system.com