#!/bin/bash

# tmux Command Center Setup Script
# 6ペイン構成: Boss + Staff1-5

SESSION_NAME="command-center"
WORK_DIR="/Users/MBP/Desktop/system/salon-management-system"

# 既存セッションを終了
tmux kill-session -t $SESSION_NAME 2>/dev/null

# 新しいセッションを作成
tmux new-session -d -s $SESSION_NAME -c $WORK_DIR

# ウィンドウを6つのペインに分割
# 上段: Boss | Staff1 | Staff2
# 下段: Staff3 | Staff4 | Staff5

# 横に2つに分割
tmux split-window -h -t $SESSION_NAME

# 左側を縦に2つに分割（Boss, Staff3）
tmux split-window -v -t $SESSION_NAME:0.0

# 右側を縦に2つに分割
tmux split-window -v -t $SESSION_NAME:0.1

# 右上を横に分割（Staff1, Staff2）
tmux split-window -h -t $SESSION_NAME:0.1

# 右下を横に分割（Staff4, Staff5）
tmux split-window -h -t $SESSION_NAME:0.3

# 各ペインにタイトルを設定し、対応するスクリプトを実行
tmux send-keys -t $SESSION_NAME:0.0 "echo 'BOSS COMMAND CENTER' && ./boss-command-center.sh" C-m
tmux send-keys -t $SESSION_NAME:0.1 "echo 'STAFF1 WORKER' && ./staff-worker.sh 1" C-m
tmux send-keys -t $SESSION_NAME:0.2 "echo 'STAFF2 WORKER' && ./staff-worker.sh 2" C-m
tmux send-keys -t $SESSION_NAME:0.3 "echo 'STAFF3 WORKER' && ./staff-worker.sh 3" C-m
tmux send-keys -t $SESSION_NAME:0.4 "echo 'STAFF4 WORKER' && ./staff-worker.sh 4" C-m
tmux send-keys -t $SESSION_NAME:0.5 "echo 'STAFF5 WORKER' && ./staff-worker.sh 5" C-m

# Bossペインをアクティブにしてセッションにアタッチ
tmux select-pane -t $SESSION_NAME:0.0
tmux attach-session -t $SESSION_NAME

echo "Command Center セッションが開始されました"
echo "使用方法:"
echo "- Ctrl+b → 矢印キー: ペイン切り替え"
echo "- Ctrl+b → d: セッションからデタッチ"
echo "- tmux attach -t $SESSION_NAME: セッションに再アタッチ"