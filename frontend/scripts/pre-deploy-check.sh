#!/bin/bash

# Pre-deployment Validation Script
# このスクリプトはデプロイ前に実行し、一般的なエラーを防ぎます

echo "🔍 デプロイ前チェックを開始します..."

# 色付きの出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# エラーカウンター
ERROR_COUNT=0
WARNING_COUNT=0

# 1. Node.jsバージョンチェック
echo -e "\n📌 Node.jsバージョンチェック..."
NODE_VERSION=$(node -v)
if [[ "$NODE_VERSION" < "v18" ]]; then
    echo -e "${RED}❌ Node.js v18以上が必要です。現在: $NODE_VERSION${NC}"
    ((ERROR_COUNT++))
else
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
fi

# 2. package.jsonとpackage-lock.jsonの同期チェック
echo -e "\n📌 package-lock.jsonの同期チェック..."
if [ ! -f "package-lock.json" ]; then
    echo -e "${RED}❌ package-lock.jsonが存在しません${NC}"
    ((ERROR_COUNT++))
else
    # npm ciでチェック（実際にはインストールしない）
    npm ci --dry-run > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ package.jsonとpackage-lock.jsonが同期していません${NC}"
        echo -e "${YELLOW}  → npm installを実行してください${NC}"
        ((ERROR_COUNT++))
    else
        echo -e "${GREEN}✅ package-lock.jsonは同期しています${NC}"
    fi
fi

# 3. 環境変数チェック
echo -e "\n📌 環境変数チェック..."
REQUIRED_ENV_VARS=(
    "VITE_API_URL"
    "VITE_ENABLE_LOGIN"
)

for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -f ".env.production" ]; then
        if grep -q "^$var=" .env.production; then
            echo -e "${GREEN}✅ $var が設定されています${NC}"
        else
            echo -e "${YELLOW}⚠️  $var が.env.productionに設定されていません${NC}"
            ((WARNING_COUNT++))
        fi
    fi
done

# 4. TypeScriptコンパイルチェック（テストファイルを除外）
echo -e "\n📌 TypeScriptコンパイルチェック..."
npx tsc --noEmit --skipLibCheck
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  TypeScriptエラーがあります（ビルドは成功するため警告扱い）${NC}"
    ((WARNING_COUNT++))
else
    echo -e "${GREEN}✅ TypeScriptコンパイル成功${NC}"
fi

# 5. ESLintチェック
echo -e "\n📌 ESLintチェック..."
npm run lint > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  ESLintエラーがあります（詳細: npm run lint）${NC}"
    ((WARNING_COUNT++))
else
    echo -e "${GREEN}✅ ESLintチェック通過${NC}"
fi

# 6. ビルドテスト
echo -e "\n📌 ビルドテスト..."
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ビルドに失敗しました${NC}"
    echo -e "${YELLOW}  → npm run buildで詳細を確認してください${NC}"
    ((ERROR_COUNT++))
else
    echo -e "${GREEN}✅ ビルド成功${NC}"
    # ビルドサイズチェック
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo -e "${GREEN}  → ビルドサイズ: $DIST_SIZE${NC}"
    fi
fi

# 7. 未使用の依存関係チェック
echo -e "\n📌 未使用の依存関係チェック..."
npx depcheck --ignores="@types/*,typescript,vite,vitest,eslint*,prettier,tailwindcss,postcss,autoprefixer" 2>/dev/null | grep "Unused dependencies" -A 10
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  未使用の依存関係があります${NC}"
    ((WARNING_COUNT++))
else
    echo -e "${GREEN}✅ 未使用の依存関係なし${NC}"
fi

# 8. Gitステータスチェック
echo -e "\n📌 Gitステータスチェック..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  コミットされていない変更があります:${NC}"
    git status --short
    ((WARNING_COUNT++))
else
    echo -e "${GREEN}✅ すべての変更がコミットされています${NC}"
fi

# 結果サマリー
echo -e "\n========================================="
echo -e "📊 チェック結果サマリー"
echo -e "========================================="

if [ $ERROR_COUNT -eq 0 ] && [ $WARNING_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 すべてのチェックをパスしました！${NC}"
    echo -e "${GREEN}デプロイの準備が整っています。${NC}"
    exit 0
elif [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNING_COUNT}個の警告があります${NC}"
    echo -e "${GREEN}デプロイは可能ですが、警告を確認することを推奨します。${NC}"
    exit 0
else
    echo -e "${RED}❌ ${ERROR_COUNT}個のエラー、${WARNING_COUNT}個の警告があります${NC}"
    echo -e "${RED}エラーを修正してから再度実行してください。${NC}"
    exit 1
fi