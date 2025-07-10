#!/bin/bash

# Safe Deployment Script
# エラーを防ぐための安全なデプロイスクリプト

echo "🚀 安全なデプロイプロセスを開始します..."

# 色付きの出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 設定
BRANCH=$(git branch --show-current)
REMOTE="origin"

# 1. プリデプロイチェックを実行
echo -e "\n${BLUE}ステップ 1: デプロイ前チェック${NC}"
if [ -f "scripts/pre-deploy-check.sh" ]; then
    ./scripts/pre-deploy-check.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ デプロイ前チェックに失敗しました${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  pre-deploy-check.shが見つかりません${NC}"
fi

# 2. 現在のブランチ確認
echo -e "\n${BLUE}ステップ 2: ブランチ確認${NC}"
echo -e "現在のブランチ: ${GREEN}$BRANCH${NC}"
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  メインブランチではありません。続行しますか？ (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "デプロイをキャンセルしました。"
        exit 0
    fi
fi

# 3. リモートとの同期確認
echo -e "\n${BLUE}ステップ 3: リモートとの同期確認${NC}"
git fetch $REMOTE
LOCAL=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse $REMOTE/$BRANCH)

if [ "$LOCAL" != "$REMOTE_HEAD" ]; then
    echo -e "${YELLOW}⚠️  ローカルとリモートが同期していません${NC}"
    echo "  ローカル:  $LOCAL"
    echo "  リモート:  $REMOTE_HEAD"
    echo -e "${YELLOW}プル/プッシュが必要です。続行しますか？ (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "デプロイをキャンセルしました。"
        exit 0
    fi
fi

# 4. package-lock.jsonの再生成（必要な場合）
echo -e "\n${BLUE}ステップ 4: 依存関係の確認${NC}"
if [ -f "package.json" ]; then
    # package.jsonの変更をチェック
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
        echo -e "${YELLOW}package.jsonが変更されています。package-lock.jsonを更新します...${NC}"
        rm -f package-lock.json
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ npm installに失敗しました${NC}"
            exit 1
        fi
        git add package-lock.json
        git commit -m "Update package-lock.json"
    fi
fi

# 5. 最終ビルドテスト
echo -e "\n${BLUE}ステップ 5: 最終ビルドテスト${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ビルドに失敗しました${NC}"
    exit 1
fi
echo -e "${GREEN}✅ ビルド成功${NC}"

# 6. コミットとプッシュ
echo -e "\n${BLUE}ステップ 6: Git操作${NC}"

# 未コミットの変更を確認
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}未コミットの変更があります:${NC}"
    git status --short
    echo -e "${YELLOW}これらの変更をコミットしますか？ (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "コミットメッセージを入力してください:"
        read -r commit_message
        git add -A
        git commit -m "$commit_message"
    fi
fi

# プッシュ確認
echo -e "\n${YELLOW}リモートにプッシュしますか？ (y/N)${NC}"
echo -e "ブランチ: ${GREEN}$BRANCH${NC} → ${GREEN}$REMOTE/$BRANCH${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    git push $REMOTE $BRANCH
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ プッシュ成功${NC}"
    else
        echo -e "${RED}❌ プッシュに失敗しました${NC}"
        exit 1
    fi
else
    echo "プッシュをスキップしました。"
fi

# 7. デプロイ結果の確認
echo -e "\n${BLUE}ステップ 7: デプロイ確認${NC}"
echo -e "${GREEN}🎉 デプロイプロセスが完了しました！${NC}"
echo -e "\n次のステップ:"
echo -e "1. Vercelダッシュボードでビルド状況を確認"
echo -e "2. デプロイ完了後、本番環境で動作確認"
echo -e "3. エラーが発生した場合は、Vercelのビルドログを確認"

# VercelのURLを表示（設定されている場合）
if [ -f ".vercel/project.json" ]; then
    echo -e "\n${BLUE}Vercel プロジェクト情報:${NC}"
    cat .vercel/project.json | grep -E '"name"|"id"'
fi

echo -e "\n${GREEN}お疲れ様でした！${NC}"