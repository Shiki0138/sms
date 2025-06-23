# 📋 チームB作業指示書：バックエンドTypeScriptエラー対応

## 🎯 ミッション
バックエンドの型エラーを修正し、APIの安定動作を確保する。明日のデモで問題なく動作するバックエンドを提供する。

## 👥 チームメンバー
- リーダー：バックエンド経験者（TypeScript/Prisma経験必須）
- メンバー：バックエンドエンジニア2-3名

## 🚨 優先タスク（所要時間：2-3時間）

### 1. Express Request型の拡張（最優先）

#### ファイル作成：`backend/src/types/express.d.ts`
```typescript
declare namespace Express {
  interface Request {
    staffId?: string;
    tenantId?: string;
    role?: string;
    user?: {
      id: string;
      email: string;
      role: string;
      tenantId: string;
    };
  }
}
```

#### tsconfig.jsonの確認
```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"]
  }
}
```

### 2. Prismaクライアント再生成

```bash
cd backend
npx prisma generate
npm run build
```

### 3. 主要コントローラーの修正優先順位

#### ① authController.ts（最重要）
**修正ポイント：**
- JWT_SECRETのundefinedチェック追加
- req.staffId, req.tenantIdの型エラー解消
- エラーレスポンスの型統一

```typescript
// 例：環境変数のチェック
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}
```

#### ② customerController.ts
**修正ポイント：**
- Prisma whereクエリの型修正
- createInputの型エラー解消
- 日付フォーマットの統一

#### ③ reservationController.ts
**修正ポイント：**
- 予約作成時の型エラー
- スタッフID、顧客IDの型チェック
- タイムスロット計算の型安全性

### 4. 共通エラーパターンと修正方法

#### パターン1：string | undefined → string
```typescript
// 修正前（エラー）
const value: string = process.env.SOME_VALUE;

// 修正後
const value = process.env.SOME_VALUE;
if (!value) {
  throw new Error('SOME_VALUE is required');
}
```

#### パターン2：Prismaクエリの型エラー
```typescript
// 修正前（エラー）
where: { id: staffId } // staffIdがundefinedの可能性

// 修正後
where: { id: staffId || '' } // デフォルト値
// または
if (!staffId) {
  return res.status(400).json({ error: 'Staff ID is required' });
}
where: { id: staffId }
```

#### パターン3：Request拡張プロパティ
```typescript
// 修正前（エラー）
req.staffId = decoded.staffId;

// 修正後（型定義追加後）
req.staffId = decoded.staffId as string;
```

## ⚠️ 重要な注意事項

### やってはいけないこと
1. **ビジネスロジックの変更** - 型修正のみ
2. **データベーススキーマの変更** - Prismaスキーマは触らない
3. **APIレスポンス形式の変更** - フロントエンドに影響
4. **認証フローの変更** - 既存の動作を維持

### 必ず守ること
1. **エラーハンドリング** - try-catchで適切に処理
2. **型安全性** - anyの使用は最小限に
3. **後方互換性** - 既存APIの動作を変えない
4. **ログ出力** - エラー時は詳細なログを残す

## 📝 チェックリスト

### 修正前
- [ ] 現在のビルドエラー数を記録
- [ ] テスト環境のバックアップ
- [ ] Prismaスキーマの確認

### 修正作業
- [ ] express.d.ts作成
- [ ] tsconfig.json更新
- [ ] Prismaクライアント再生成
- [ ] authController.ts修正
- [ ] customerController.ts修正
- [ ] reservationController.ts修正
- [ ] その他の重要なコントローラー修正

### 修正後
- [ ] npm run build成功
- [ ] npm run devで起動確認
- [ ] 主要APIエンドポイントの動作テスト
- [ ] エラーログの確認

## 🧪 動作確認手順

### 1. ビルド確認
```bash
cd backend
npm run build
# エラーが0になることを確認
```

### 2. 開発サーバー起動
```bash
npm run dev
# ポート3001で起動確認
```

### 3. APIテスト（Postmanまたはcurl）

#### ログインテスト
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

#### 顧客一覧取得
```bash
curl -X GET http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 トラブルシューティング

### よくある問題

1. **Prismaクライアントエラー**
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

2. **型定義が反映されない**
   ```bash
   npm run clean
   rm -rf dist
   npm run build
   ```

3. **環境変数エラー**
   - .envファイルの確認
   - dotenvの読み込み順序確認

## 📞 エスカレーション

以下の場合は即座に連絡：
- Prismaスキーマの変更が必要な場合
- APIの仕様変更が必要な場合
- 3時間以内に完了できない見込み

## ✅ 完了条件

1. `npm run build`でエラー0
2. 開発サーバーが正常起動
3. 主要API（認証、顧客、予約）が動作
4. TypeScriptの型エラーが解消
5. エラーログに異常なし

## 🎯 成功基準

- 美容師の方がAPIエラーに遭遇しない
- レスポンスタイムが適切（<500ms）
- エラー時も適切なメッセージを返す
- 認証が安定して動作する

## 📊 進捗管理

| タスク | 開始時刻 | 完了時刻 | 担当者 | 備考 |
|--------|----------|----------|--------|------|
| express.d.ts作成 | | | | |
| Prisma再生成 | | | | |
| authController修正 | | | | |
| customerController修正 | | | | |
| reservationController修正 | | | | |
| ビルドテスト | | | | |
| API動作確認 | | | | |

---

**開始時刻：** ___________
**完了予定：** ___________ （3時間以内）
**実際完了：** ___________
**確認者：** ___________