#!/bin/bash

# ESLint Warnings 修正スクリプト
echo "🧹 ESLint warningsを修正中..."

# 色付きの出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 自動修正可能な問題を修正
echo -e "\n${YELLOW}ステップ 1: ESLint自動修正${NC}"
npm run lint -- --fix

# 2. 現在のwarning数を表示
echo -e "\n${YELLOW}ステップ 2: 現在のwarning数をチェック${NC}"
WARNING_COUNT=$(npm run lint 2>&1 | grep -oE '[0-9]+ problems' | grep -oE '[0-9]+' | tail -1)
echo -e "現在のwarning数: ${YELLOW}$WARNING_COUNT${NC}"

# 3. 最も多いwarningタイプを表示
echo -e "\n${YELLOW}ステップ 3: 主なwarningタイプ${NC}"
npm run lint 2>&1 | grep warning | sed 's/.*warning *//' | sort | uniq -c | sort -nr | head -10

# 4. 提案
echo -e "\n${GREEN}推奨される対応:${NC}"
echo "1. 未使用のimport/変数: 手動で削除するか、使用する"
echo "2. any型の使用: 適切な型定義に置き換える"
echo "3. non-null assertion(!): オプショナルチェイニング(?.)に置き換える"
echo "4. React Hook依存: 依存配列に追加するか、eslint-disable-lineコメントを使用"

echo -e "\n${YELLOW}一時的な対処法:${NC}"
echo "package.jsonのlintスクリプトで --max-warnings を増やす（現在: 500）"
echo "例: \"lint\": \"eslint . --ext ts,tsx --max-warnings 600\""