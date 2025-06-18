# フィーチャーフラグ初期設定ガイド

## 🎯 概要

本番環境向けのフィーチャーフラグシステムの初期設定が完了しました。
ベータテスト機能、プレミアム機能、段階的リリース機能が適切に設定されています。

## 📋 設定済み機能一覧

### ベータテスト機能 (3機能)
- `beta_application` - ベータテスター申請機能
- `beta_dashboard` - ベータテスト専用ダッシュボード  
- `beta_feedback` - ベータフィードバック収集

### プレミアム機能 (AIプレミアムプラン限定)
- `premium_ai_analytics` - 高度AI分析 (50%展開)
- `custom_reports` - カスタムレポート作成 (75%展開)
- `api_access` - API アクセス (25%展開)

### スタンダード機能 (スタンダード・プレミアムプラン)
- `line_integration` - LINE連携機能 (25%展開)
- `instagram_integration` - Instagram連携機能 (25%展開)
- `realtime_analytics` - リアルタイム分析 (50%展開)
- `advanced_search` - 高度な検索とフィルタ (75%展開)
- `data_export` - データエクスポート (100%展開)

### 基本機能 (全プラン対応)
- `setup_wizard` - 初回セットアップウィザード (100%展開)
- `dashboard_customize` - ダッシュボードカスタマイズ (50%展開)
- `mobile_view` - モバイル専用ビュー (75%展開)
- `customer_template` - 顧客カルテテンプレート (100%展開)
- `staff_sharing` - スタッフ間情報共有 (80%展開)
- `auto_save` - 自動保存機能 (100%展開)

### 実験的機能
- `sales_prediction_ai` - 売上予測AI (10%展開, プレミアム限定)
- `pos_integration` - 簡易POS連携 (5%展開)

## 🚀 初期設定実行手順

### 1. データベースマイグレーション確認
```bash
cd backend
npx prisma migrate deploy
```

### 2. 本番環境フィーチャーフラグ初期設定
```bash
# 管理者権限でAPIエンドポイントにアクセス
POST /api/v1/features/admin/setup-production
```

または

```bash
cd backend
npm run setup-feature-flags
```

### 3. 設定確認
```bash
# 全フィーチャーフラグ確認
GET /api/v1/features/admin/all

# 有効なフィーチャー確認
GET /api/v1/features/enabled
```

## 🎛️ 管理機能

### 段階的リリース調整
```bash
# 展開率を調整 (0-100%)
PUT /api/v1/features/admin/rollout/{featureKey}
Body: { "percentage": 75 }
```

### ベータテスト機能有効化
```bash
# 特定テナントでベータ機能を有効化
POST /api/v1/features/admin/beta/enable/{tenantId}
```

### 緊急機能無効化
```bash
# 緊急時の機能無効化
POST /api/v1/features/admin/emergency-disable/{featureKey}
```

## 🎨 フロントエンド管理画面

### プレミアム機能管理ダッシュボード
- パス: `/admin/premium-features`
- コンポーネント: `PremiumFeatureController`
- 機能:
  - リアルタイム展開率調整
  - 緊急無効化ボタン
  - 視覚的なロールアウト状況表示
  - 本番環境初期設定ボタン

### 使用方法
```tsx
import { FeatureGate } from '../components/Common/FeatureGate';
import { useFeature } from '../hooks/useFeatureFlags';

// 機能ゲート使用例
<FeatureGate feature="premium_ai_analytics">
  <AdvancedAnalyticsComponent />
</FeatureGate>

// フック使用例
const hasBetaAccess = useFeature('beta_dashboard');
```

## 📊 プラン別機能制限

| 機能カテゴリ | ライト | スタンダード | プレミアム |
|-------------|-------|-------------|-----------|
| 基本機能 | ✅ | ✅ | ✅ |
| ベータテスト | ✅ | ✅ | ✅ |
| 外部連携 | ❌ | ✅ | ✅ |
| 高度分析 | ❌ | 一部 | ✅ |
| API アクセス | ❌ | ❌ | ✅ |

## 🔧 運用管理

### モニタリング
- 機能利用状況の追跡
- エラー率の監視
- ユーザーフィードバックの収集

### 段階的リリース戦略
1. **実験段階 (5-10%)** - 新機能の初期テスト
2. **低展開 (25%)** - 安定性確認
3. **中展開 (50%)** - 広範囲テスト
4. **高展開 (75-80%)** - 最終確認
5. **完全展開 (100%)** - 全ユーザーに提供

### トラブルシューティング
- 機能で問題が発生した場合は緊急無効化機能を使用
- ロールバック機能でバージョン管理
- ログ監視でパフォーマンス追跡

## 🎉 完了状態

✅ フィーチャーフラグ管理システム構築完了
✅ ベータテスト機能設定完了
✅ プレミアム機能設定完了
✅ 段階的リリース設定完了
✅ 管理ダッシュボード実装完了
✅ 動作テスト完了

## 📞 サポート

設定や運用で問題が発生した場合:
1. 管理ダッシュボードでの状況確認
2. ログファイルの確認
3. 緊急時は該当機能の無効化
4. 必要に応じて開発チームに連絡

---

**注意**: 本番環境での設定変更は慎重に行い、必要に応じてバックアップを取得してください。