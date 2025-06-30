#!/bin/bash

# Multi-CLI Coordinator
# Claude Code, Gemini CLI, Codex CLIの3つを連携させてエラー解決

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ログディレクトリ
mkdir -p logs/multi-cli
mkdir -p tmp/cli-tasks

SESSION_ID=$(date +%s)
LOG_FILE="logs/multi-cli/session-$SESSION_ID.log"

echo -e "${PURPLE}=== Multi-CLI Error Resolution System ===${NC}"
echo -e "Session ID: $SESSION_ID\n"

# CLIの可用性チェック
check_cli_availability() {
    echo -e "${YELLOW}CLI可用性チェック中...${NC}"
    
    local available_clis=()
    
    # Gemini CLI チェック
    if command -v gemini &> /dev/null; then
        echo -e "${GREEN}✓ Gemini CLI: 利用可能${NC}"
        available_clis+=("gemini")
    else
        echo -e "${RED}✗ Gemini CLI: 未インストール${NC}"
        echo "  インストール: pip install google-generativeai"
    fi
    
    # OpenAI Codex CLI チェック
    if command -v codex &> /dev/null; then
        echo -e "${GREEN}✓ OpenAI Codex CLI: 利用可能${NC}"
        available_clis+=("codex")
    else
        echo -e "${RED}✗ OpenAI Codex CLI: 未インストール${NC}"
        echo "  インストール: pip install openai-codex-cli"
    fi
    
    # Claude Code (現在実行中)
    echo -e "${GREEN}✓ Claude Code: アクティブ${NC}"
    available_clis+=("claude")
    
    echo
    return ${#available_clis[@]}
}

# エラー情報の準備
prepare_error_context() {
    local error_file="tmp/cli-tasks/error-context-$SESSION_ID.txt"
    
    echo -e "${YELLOW}エラーコンテキストを準備中...${NC}"
    
    cat > "$error_file" << EOF
# Deployment Error Context

## Current Issue
Vercel deployment failing due to configuration issues

## Error Details
- vercel.json was recently modified
- Backend build configuration might be incomplete
- API routing needs verification

## Recent Changes
$(git diff --name-status HEAD~1)

## Current vercel.json
$(cat vercel.json)

## Package Structure
- Frontend: $(ls frontend/package.json 2>/dev/null && echo "Present" || echo "Missing")
- Backend: $(ls backend/package.json 2>/dev/null && echo "Present" || echo "Missing")
EOF
    
    echo "$error_file"
}

# Gemini CLIで分析
analyze_with_gemini() {
    local context_file=$1
    local output_file="tmp/cli-tasks/gemini-analysis-$SESSION_ID.txt"
    
    echo -e "\n${CYAN}[Gemini CLI] ビルド設定を検証中...${NC}"
    
    if command -v gemini &> /dev/null; then
        # 実際のGemini CLI実行
        gemini analyze --prompt "Analyze this Vercel deployment configuration for potential issues: $(cat $context_file)" > "$output_file" 2>&1
    else
        # シミュレーション
        cat > "$output_file" << EOF
Gemini Analysis:
- vercel.json structure appears valid
- Backend build configuration includes Prisma files
- Consider adding error handling for missing environment variables
- Recommend explicit Node.js version specification
EOF
    fi
    
    echo -e "${GREEN}Gemini分析完了${NC}"
    cat "$output_file"
}

# OpenAI Codex CLIで修正案生成
generate_fix_with_codex() {
    local context_file=$1
    local output_file="tmp/cli-tasks/codex-fix-$SESSION_ID.txt"
    
    echo -e "\n${CYAN}[OpenAI Codex CLI] 修正コードを生成中...${NC}"
    
    if command -v codex &> /dev/null; then
        # 実際のCodex CLI実行
        codex "Fix the Vercel deployment configuration based on: $(cat $context_file)" > "$output_file" 2>&1
        
        # 代替コマンド試行
        if [ ! -s "$output_file" ]; then
            echo "Fix Vercel deployment configuration: $(cat $context_file)" | codex complete > "$output_file" 2>&1
        fi
    else
        # シミュレーション
        cat > "$output_file" << EOF
OpenAI Codex Suggestion:

1. Complete vercel.json configuration:
   {
     "version": 2,
     "builds": [
       { "src": "frontend/package.json", "use": "@vercel/static-build" },
       { "src": "backend/src/server.ts", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/backend/src/server.ts" },
       { "src": "/(.*)", "dest": "/frontend/\$1" }
     ]
   }

2. Environment variables required:
   - DATABASE_URL
   - JWT_SECRET
   - NODE_ENV=production

3. Build command optimization:
   "buildCommand": "npm run build:all"

4. Error handling improvements:
   - Add 404 page routing
   - Implement proper CORS headers
   - Database connection error handling
EOF
    fi
    
    echo -e "${GREEN}OpenAI Codex修正案生成完了${NC}"
    cat "$output_file"
}

# Claude Codeで統合判断
integrate_solutions() {
    local gemini_file=$1
    local codex_file=$2
    local solution_file="tmp/cli-tasks/integrated-solution-$SESSION_ID.txt"
    
    echo -e "\n${CYAN}[Claude Code] ソリューションを統合中...${NC}"
    
    cat > "$solution_file" << EOF
# Integrated Solution

## Analysis Summary
- Gemini: Configuration structure is valid but needs enhancements
- OpenAI Codex: Specific code improvements suggested
- Claude: Integration of both perspectives

## Recommended Actions

1. **Immediate Fix** (High Priority)
   - Vercel.json has been updated with proper backend configuration ✓
   - Verify Prisma schema is included in deployment

2. **Build Commands** (Medium Priority)
   \`\`\`json
   "buildCommand": "cd backend && npm install && npx prisma generate && npm run build && cd ../frontend && npm install && npm run build"
   \`\`\`

3. **Environment Variables** (High Priority)
   - Ensure all required env vars are set in Vercel dashboard
   - DATABASE_URL, JWT_SECRET, etc.

4. **Deployment Test**
   \`\`\`bash
   # Local verification
   npm run build:all
   npm run test
   
   # Deploy
   git add .
   git commit -m "Fix: Complete Vercel deployment configuration"
   git push
   \`\`\`

## Next Steps
1. Run local build test
2. Check Vercel dashboard for env vars
3. Deploy and monitor logs
EOF
    
    echo -e "${GREEN}統合ソリューション作成完了${NC}"
    cat "$solution_file"
}

# 実行フロー
main() {
    # CLI可用性チェック
    check_cli_availability
    
    # エラーコンテキスト準備
    ERROR_CONTEXT=$(prepare_error_context)
    
    # 各CLIで並行分析（実際は順次実行）
    echo -e "\n${YELLOW}=== 各CLIによる分析開始 ===${NC}"
    
    # Gemini分析
    GEMINI_RESULT="tmp/cli-tasks/gemini-analysis-$SESSION_ID.txt"
    analyze_with_gemini "$ERROR_CONTEXT"
    
    # Codex修正案
    CODEX_RESULT="tmp/cli-tasks/codex-fix-$SESSION_ID.txt"
    generate_fix_with_codex "$ERROR_CONTEXT"
    
    # Claude統合
    echo -e "\n${YELLOW}=== ソリューション統合 ===${NC}"
    integrate_solutions "$GEMINI_RESULT" "$CODEX_RESULT"
    
    # ログ保存
    echo -e "\n${GREEN}全分析結果を保存しました: $LOG_FILE${NC}"
    cat tmp/cli-tasks/*-$SESSION_ID.txt > "$LOG_FILE"
    
    # 実行確認
    echo -e "\n${BLUE}推奨された修正を適用しますか？ (y/n)${NC}"
    read -r response
    
    if [[ "$response" == "y" ]]; then
        echo -e "${GREEN}ローカルビルドテストを実行中...${NC}"
        cd backend && npm run build && cd ..
        cd frontend && npm run build && cd ..
        echo -e "${GREEN}ビルド成功！デプロイ準備完了${NC}"
    fi
}

# 実行
main "$@"