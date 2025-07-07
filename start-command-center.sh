#!/bin/bash

# Command Center Start Script
# tmuxマルチペインコマンドセンターを開始

echo "=========================================="
echo "     TMUX COMMAND CENTER 起動中"
echo "=========================================="

# 作業ディレクトリに移動
cd /Users/MBP/Desktop/system/salon-management-system

# 実行権限を確認・設定
chmod +x tmux-command-center.sh
chmod +x boss-command-center.sh
chmod +x staff-worker.sh

# tmuxコマンドセンターを開始
./tmux-command-center.sh

echo "Command Center を開始しました。"
echo ""
echo "使用方法:"
echo "- Boss(左上): タスクを配布・報告を受け取り"
echo "- Staff1-5: 各ペインで自動的にタスクを実行"
echo "- Ctrl+b → 矢印キー: ペイン間の移動"
echo "- Ctrl+b → d: セッションからデタッチ"
echo "- tmux attach -t command-center: 再接続"