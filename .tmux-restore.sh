#!/bin/bash

# Tmux復元スクリプト
# salon_managementセッションを復元

SESSION_NAME="sms"
SAVE_DIR="$HOME/.tmux-resurrect"
SAVE_FILE="$SAVE_DIR/last"

# セッションが存在しない場合のみ作成
if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    # 新規セッション作成
    tmux new-session -d -s "$SESSION_NAME" -c "/Users/MBP/Desktop/system/salon-management-system"
    
    # 保存ファイルがある場合は復元
    if [ -f "$SAVE_FILE" ]; then
        echo "Restoring session from saved state..."
        # ここに復元ロジックを追加可能
    fi
    
    echo "Session '$SESSION_NAME' created"
else
    echo "Session '$SESSION_NAME' already exists"
fi

# セッションにアタッチ
tmux attach-session -t "$SESSION_NAME"