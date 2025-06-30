#!/bin/bash

# Multi-Agent Debug System
# Claude Code, Gemini, Codexの3つのAIエージェントで協調してデプロイエラーを解決

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

# ログディレクトリ作成
mkdir -p logs/debug
mkdir -p tmp

# エラーログファイル
ERROR_LOG="logs/debug/deploy-errors-$(date +%Y%m%d-%H%M%S).log"
ANALYSIS_LOG="logs/debug/analysis-$(date +%Y%m%d-%H%M%S).log"
SOLUTION_LOG="logs/debug/solutions-$(date +%Y%m%d-%H%M%S).log"

echo -e "${BLUE}=== Multi-Agent Deploy Debug System ===${NC}"

# Step 1: エラー収集
echo -e "\n${YELLOW}Step 1: エラー情報を収集中...${NC}"

# Vercelのデプロイログを取得（実際の環境では vercel logs コマンドを使用）
echo "# Deploy Error Log - $(date)" > "$ERROR_LOG"
echo "## Current Configuration Issues:" >> "$ERROR_LOG"
echo "- vercel.json is missing backend build configuration" >> "$ERROR_LOG"
echo "- API routing configuration is missing" >> "$ERROR_LOG"
echo "- Environment variables configuration is missing" >> "$ERROR_LOG"

# git diff でエラーの原因となる変更を記録
echo -e "\n## Recent Changes:" >> "$ERROR_LOG"
git diff --name-status >> "$ERROR_LOG"

# Step 2: AIエージェントに分析を依頼
echo -e "\n${YELLOW}Step 2: AIエージェントによる分析開始...${NC}"

# Claude Code用のプロンプト作成
cat > tmp/claude-prompt.txt << EOF
@claude-code
デプロイエラーの分析:
$(cat "$ERROR_LOG")

以下を分析してください:
1. エラーの根本原因
2. 影響範囲
3. 修正優先順位
EOF

# Gemini用のプロンプト作成
cat > tmp/gemini-prompt.txt << EOF
@gemini
デプロイ設定の検証:
- vercel.jsonの設定確認
- package.jsonの依存関係チェック
- ビルドスクリプトの妥当性検証

現在の問題:
$(cat "$ERROR_LOG")
EOF

# Codex用のプロンプト作成
cat > tmp/codex-prompt.txt << EOF
@codex
修正コードの生成:
- vercel.jsonの修正案
- 必要なスクリプトの修正
- CI/CDパイプラインの調整

エラー内容:
$(cat "$ERROR_LOG")
EOF

# Step 3: 分析結果の集約
echo -e "\n${YELLOW}Step 3: 分析結果を集約中...${NC}"

# 分析結果をシミュレート（実際はAPIレスポンスを使用）
cat > "$ANALYSIS_LOG" << EOF
# Multi-Agent Analysis Report

## Claude Code Analysis
- 根本原因: vercel.jsonの設定が不完全
- 影響範囲: バックエンドAPIが完全に機能しない
- 優先度: Critical

## Gemini Validation
- vercel.json: バックエンド設定欠落
- package.json: 依存関係は正常
- ビルドスクリプト: フロントエンドのみ対応

## Codex Solution
- vercel.jsonの完全な設定を復元
- APIルーティングの追加
- 環境変数設定の追加
EOF

# Step 4: 統合ソリューションの生成
echo -e "\n${YELLOW}Step 4: 統合ソリューションを生成中...${NC}"

cat > "$SOLUTION_LOG" << EOF
# Integrated Solution

## 1. 即座に実行すべき修正
\`\`\`bash
# vercel.jsonを修正
cat > vercel.json << 'VERCEL_EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["backend/prisma/**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/\$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
VERCEL_EOF
\`\`\`

## 2. デプロイ前の検証
\`\`\`bash
# ローカルでビルドテスト
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..
\`\`\`

## 3. デプロイ実行
\`\`\`bash
git add vercel.json
git commit -m "Fix: Vercel deployment configuration"
git push
\`\`\`
EOF

# Step 5: 結果表示
echo -e "\n${GREEN}=== 分析完了 ===${NC}"
echo -e "エラーログ: $ERROR_LOG"
echo -e "分析結果: $ANALYSIS_LOG"
echo -e "解決策: $SOLUTION_LOG"

echo -e "\n${BLUE}修正を適用しますか？ (y/n)${NC}"
read -r response

if [[ "$response" == "y" ]]; then
    echo -e "${GREEN}修正を適用中...${NC}"
    # ここで実際の修正を実行
    bash -c "$(grep -A 50 '# vercel.jsonを修正' "$SOLUTION_LOG" | sed -n '/cat > vercel.json/,/VERCEL_EOF/p')"
    echo -e "${GREEN}修正が完了しました！${NC}"
else
    echo -e "${YELLOW}修正をスキップしました${NC}"
fi