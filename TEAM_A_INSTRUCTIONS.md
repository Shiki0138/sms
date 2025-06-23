# 📋 チームA作業指示書：フロントエンドTypeScriptエラー修正

## 🎯 ミッション
明日の美容師向けデモに向けて、フロントエンドの致命的なTypeScriptエラーを修正し、システムの安定動作を確保する。

## 👥 チームメンバー
- リーダー：TypeScript経験者
- メンバー：フロントエンドエンジニア2-3名

## 🚨 最優先タスク（所要時間：1-2時間）

### 1. TypeScriptエラー修正対象ファイル

#### ① `frontend/src/components/Salary/SalaryDashboard.tsx`
**問題：** import文が1行に連結されている
**修正内容：**
```typescript
// 修正前（エラー）
import React, { useState, useEffect } from 'react';import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// 修正後（正しい形式）
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
```

#### ② `frontend/src/components/Settings/FeatureFlagSettings.tsx`
**問題：** 同様のimport文連結エラー
**修正内容：** 各import文を別々の行に分離

#### ③ `frontend/src/components/SupportBeautician/SupportRequestForm.tsx`
**問題：** 同様のimport文連結エラー
**修正内容：** 各import文を別々の行に分離

### 2. 修正手順

```bash
# 1. プロジェクトディレクトリに移動
cd /Users/MBP/Desktop/system/salon-management-system/frontend

# 2. 各ファイルを開いて修正
# VSCodeまたは任意のエディタで開く

# 3. 修正後、TypeScriptのコンパイルチェック
npm run type-check

# 4. エラーが解消されたことを確認
# エラーが残っている場合は、エラーメッセージを確認して追加修正

# 5. 開発サーバーで動作確認
npm run dev
```

### 3. 追加確認事項

各ファイル修正後、以下を確認：
- [ ] コンポーネントが正しくレンダリングされるか
- [ ] コンソールにエラーが出ていないか
- [ ] 関連する画面遷移が正常に動作するか

## ⚠️ 重要な注意事項

### やってはいけないこと
1. **ロジックの変更禁止** - import文の修正のみ行う
2. **新機能追加禁止** - エラー修正のみに集中
3. **大規模リファクタリング禁止** - 最小限の修正に留める
4. **他のファイルへの影響** - 修正対象3ファイル以外は触らない

### 必ず守ること
1. **バックアップ** - 修正前にファイルのバックアップを取る
2. **段階的修正** - 1ファイルずつ修正して動作確認
3. **チーム内レビュー** - 修正完了後、別メンバーがレビュー
4. **ドキュメント** - 修正内容を記録する

## 📝 チェックリスト

### 修正前
- [ ] Gitで現在の状態をコミット
- [ ] 各ファイルのバックアップ作成
- [ ] npm installが完了している

### 修正作業
- [ ] SalaryDashboard.tsx のimport文修正
- [ ] FeatureFlagSettings.tsx のimport文修正  
- [ ] SupportRequestForm.tsx のimport文修正
- [ ] 各ファイルのTypeScriptエラー解消確認

### 修正後
- [ ] npm run type-check でエラーなし
- [ ] npm run dev で正常起動
- [ ] 各画面の表示確認
- [ ] コンソールエラーなし
- [ ] 修正内容のドキュメント作成

## 🔧 トラブルシューティング

### よくある問題と対処法

1. **import pathが見つからない**
   - 相対パスを確認（../ui/card → @/components/ui/card など）
   - tsconfig.jsonのpathsマッピングを確認

2. **型定義エラーが残る**
   - 必要な型定義パッケージをインストール
   - any型の一時的使用も検討（後で修正前提）

3. **ビルドエラー**
   - node_modulesを削除して再インストール
   - キャッシュクリア: `npm run clean`

## 📞 エスカレーション

以下の場合は即座にプロジェクトリーダーに連絡：
- 修正により他の機能が動作しなくなった
- 想定時間（2時間）を超えそうな場合
- 修正方法が不明な深刻なエラーを発見

## ✅ 完了条件

1. 3つのファイルのTypeScriptエラーが完全に解消
2. 開発環境で各画面が正常に表示される
3. コンソールにエラーが出ていない
4. チーム内レビュー完了
5. 修正内容のドキュメント提出

## 🎯 成功基準

明日のデモで美容師の方々が：
- エラー画面を見ることなくスムーズに操作できる
- 給料見える化機能を問題なく確認できる
- 機能フラグ設定を正常に操作できる
- 応援美容師募集フォームを利用できる

---

**開始時刻：** ___________
**完了予定：** ___________ （2時間以内）
**実際完了：** ___________
**確認者：** ___________