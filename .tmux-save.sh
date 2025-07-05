#!/bin/bash

# Tmux自動保存スクリプト
# salon_managementセッションの状態を保存

SESSION_NAME="sms"
SAVE_DIR="$HOME/.tmux-resurrect"
SAVE_FILE="$SAVE_DIR/last"

# ディレクトリ作成
mkdir -p "$SAVE_DIR"

# セッション情報を保存
tmux list-windows -t "$SESSION_NAME" -F "#{window_index}:#{window_name}:#{pane_current_path}" > "$SAVE_FILE"
tmux list-panes -s -t "$SESSION_NAME" -F "#{session_name}:#{window_index}.#{pane_index}:#{pane_current_path}:#{pane_current_command}" >> "$SAVE_FILE"

echo "Session saved: $(date)"