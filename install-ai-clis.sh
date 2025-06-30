#!/bin/bash

# AI CLI Installation Script
# Gemini CLI と Codex CLI のインストール支援

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}=== AI CLI Installation Helper ===${NC}\n"

# 1. Gemini CLI のインストール
install_gemini_cli() {
    echo -e "${YELLOW}1. Gemini CLI のインストール${NC}"
    
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}Python3 が利用可能です${NC}"
        
        # Google Generative AI のインストール
        echo -e "Google Generative AI をインストールしています..."
        pip3 install google-generativeai
        
        # 簡易CLIラッパーを作成
        cat > /usr/local/bin/gemini << 'EOF'
#!/usr/bin/env python3
import sys
import google.generativeai as genai
import os

def main():
    # API keyの設定（環境変数から）
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set")
        print("Get your API key from: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    
    if len(sys.argv) < 2:
        print("Usage: gemini <prompt>")
        sys.exit(1)
    
    if sys.argv[1] == "analyze":
        prompt = " ".join(sys.argv[3:]) if len(sys.argv) > 3 else "Analyze the provided content"
    else:
        prompt = " ".join(sys.argv[1:])
    
    try:
        response = model.generate_content(prompt)
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
EOF
        
        chmod +x /usr/local/bin/gemini
        echo -e "${GREEN}Gemini CLI インストール完了${NC}"
        echo -e "使用前に環境変数を設定してください:"
        echo -e "export GEMINI_API_KEY='your-api-key'"
    else
        echo -e "${RED}Python3 が見つかりません${NC}"
    fi
}

# 2. OpenAI Codex CLI のインストール
install_codex_cli() {
    echo -e "\n${YELLOW}2. OpenAI Codex CLI のインストール${NC}"
    
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}Python3 が利用可能です${NC}"
        
        # OpenAI CLI のインストール
        echo -e "OpenAI CLI をインストールしています..."
        pip3 install openai
        
        # 簡易Codex CLIラッパーを作成
        cat > /usr/local/bin/codex << 'EOF'
#!/usr/bin/env python3
import openai
import sys
import os

def main():
    # API keyの設定（環境変数から）
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set")
        print("Get your API key from: https://platform.openai.com/api-keys")
        sys.exit(1)
    
    openai.api_key = api_key
    
    if len(sys.argv) < 2:
        print("Usage: codex <prompt>")
        print("       codex complete <prompt>")
        sys.exit(1)
    
    command = sys.argv[1]
    if command == "complete":
        prompt = " ".join(sys.argv[2:])
    else:
        prompt = " ".join(sys.argv[1:])
    
    try:
        response = openai.Completion.create(
            engine="code-davinci-002",
            prompt=prompt,
            max_tokens=500,
            temperature=0.1
        )
        print(response.choices[0].text.strip())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
EOF
        
        chmod +x /usr/local/bin/codex
        echo -e "${GREEN}OpenAI Codex CLI インストール完了${NC}"
        echo -e "使用前に環境変数を設定してください:"
        echo -e "export OPENAI_API_KEY='your-api-key'"
        
    else
        echo -e "${RED}Python3 が見つかりません${NC}"
        echo -e "Python3 をインストールしてください"
    fi
}

# 3. 設定ファイルの作成
create_config() {
    echo -e "\n${YELLOW}3. 設定ファイルを作成中...${NC}"
    
    cat > ~/.ai-cli-config << 'EOF'
# AI CLI Configuration

# Gemini API Key (get from https://makersuite.google.com/app/apikey)
export GEMINI_API_KEY=""

# OpenAI API Key (for Codex)
export OPENAI_API_KEY=""

# Default prompts
export AI_CLI_CONTEXT_DIR="./tmp/cli-context"
EOF

    echo -e "${GREEN}設定ファイルを作成しました: ~/.ai-cli-config${NC}"
    echo -e "設定を有効にするには: ${BLUE}source ~/.ai-cli-config${NC}"
}

# 4. テスト
test_installations() {
    echo -e "\n${YELLOW}4. インストールテスト${NC}"
    
    # Gemini テスト
    if command -v gemini &> /dev/null; then
        echo -e "${GREEN}✓ Gemini CLI: インストール済み${NC}"
    else
        echo -e "${RED}✗ Gemini CLI: 未インストール${NC}"
    fi
    
    # Codex テスト
    if command -v codex &> /dev/null; then
        echo -e "${GREEN}✓ OpenAI Codex CLI: インストール済み${NC}"
    else
        echo -e "${RED}✗ OpenAI Codex CLI: 未インストール${NC}"
    fi
    
    # Claude Code (現在実行中)
    echo -e "${GREEN}✓ Claude Code: アクティブ${NC}"
}

# メインメニュー
main() {
    echo -e "${BLUE}インストールするCLIを選択してください:${NC}"
    echo "1) Gemini CLI"
    echo "2) OpenAI Codex CLI"
    echo "3) 両方"
    echo "4) 設定ファイルのみ作成"
    echo "5) テスト実行"
    read -p "選択 (1-5): " choice
    
    case $choice in
        1)
            install_gemini_cli
            create_config
            ;;
        2)
            install_codex_cli
            create_config
            ;;
        3)
            install_gemini_cli
            install_codex_cli
            create_config
            ;;
        4)
            create_config
            ;;
        5)
            test_installations
            ;;
        *)
            echo -e "${RED}無効な選択です${NC}"
            ;;
    esac
    
    test_installations
    
    echo -e "\n${GREEN}セットアップ完了！${NC}"
    echo -e "Multi-CLI協調システムを実行: ${BLUE}./multi-cli-coordinator.sh${NC}"
}

main "$@"