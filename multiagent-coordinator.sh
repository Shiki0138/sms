#!/bin/bash

# Multi-Agent Coordination System for Salon Management System
# セッション構成: sms:president → sms:boss → sms:workers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COORD_DIR="/tmp/sms_coordination"
MESSAGE_DIR="$COORD_DIR/messages"
RESPONSE_DIR="$COORD_DIR/responses"

# 初期化
init_coordination() {
    mkdir -p "$MESSAGE_DIR" "$RESPONSE_DIR"
    echo "🔧 Multi-Agent coordination system initialized"
    echo "📁 Message directory: $MESSAGE_DIR"
    echo "📁 Response directory: $RESPONSE_DIR"
}

# セッション構成の確認
check_sessions() {
    echo "🔍 Checking SMS session structure..."
    
    if ! tmux has-session -t sms 2>/dev/null; then
        echo "❌ SMS session not found"
        return 1
    fi
    
    echo "✅ SMS session found"
    echo "📋 Window structure:"
    tmux list-windows -t sms | while read line; do
        echo "   $line"
    done
}

# プレジデントからボスへメッセージ送信
president_to_boss() {
    local message="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local msg_file="$MESSAGE_DIR/boss_${timestamp}.txt"
    
    cat > "$msg_file" << EOF
=== PRESIDENT → BOSS MESSAGE ===
FROM: sms:president
TO: sms:boss
TIMESTAMP: $(date)
PRIORITY: HIGH
===================================

$message

===================================
Response required in: $RESPONSE_DIR/boss_response_${timestamp}.txt
EOF
    
    # ボスウィンドウにメッセージ送信
    tmux send-keys -t sms:boss "echo '📨 New message from PRESIDENT'" C-m
    tmux send-keys -t sms:boss "cat $msg_file" C-m
    
    echo "📤 Message sent from PRESIDENT to BOSS"
    echo "📄 File: $msg_file"
}

# ボスからワーカーへメッセージ送信
boss_to_workers() {
    local worker_id="$1"
    local message="$2"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local msg_file="$MESSAGE_DIR/worker${worker_id}_${timestamp}.txt"
    
    cat > "$msg_file" << EOF
=== BOSS → WORKER$worker_id MESSAGE ===
FROM: sms:team (pane 0 - boss)
TO: sms:team (pane $worker_id)
TIMESTAMP: $(date)
PRIORITY: HIGH
=====================================

$message

=====================================
Response required in: $RESPONSE_DIR/worker${worker_id}_response_${timestamp}.txt
EOF
    
    # 対応するワーカーペインにメッセージ送信
    tmux send-keys -t "sms:team.$worker_id" "echo '📨 New message from BOSS'" C-m
    tmux send-keys -t "sms:team.$worker_id" "cat $msg_file" C-m
    
    echo "📤 Message sent from BOSS to WORKER$worker_id"
    echo "📄 File: $msg_file"
}

# ワーカーからボスへ応答
worker_response() {
    local worker_id="$1"
    local response="$2"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local response_file="$RESPONSE_DIR/worker${worker_id}_response_${timestamp}.txt"
    
    cat > "$response_file" << EOF
=== WORKER$worker_id → BOSS RESPONSE ===
FROM: sms:team (pane $worker_id)
TO: sms:team (pane 0 - boss)
TIMESTAMP: $(date)
======================================

$response

======================================
EOF
    
    # ボスペインに応答通知
    tmux send-keys -t sms:team.0 "echo '📨 Response from WORKER$worker_id'" C-m
    tmux send-keys -t sms:team.0 "cat $response_file" C-m
    
    echo "📤 Response sent from WORKER$worker_id to BOSS"
}

# ボスからプレジデントへ応答
boss_response() {
    local response="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local response_file="$RESPONSE_DIR/boss_response_${timestamp}.txt"
    
    cat > "$response_file" << EOF
=== BOSS → PRESIDENT RESPONSE ===
FROM: sms:team (pane 0 - boss)
TO: sms:president
TIMESTAMP: $(date)
==================================

$response

==================================
EOF
    
    # プレジデントウィンドウに応答通知
    tmux send-keys -t sms:president "echo '📨 Response from BOSS'" C-m
    tmux send-keys -t sms:president "cat $response_file" C-m
    
    echo "📤 Response sent from BOSS to PRESIDENT"
}

# 使用方法表示
show_usage() {
    cat << EOF
🤖 Multi-Agent Coordination System

使用方法:
  $0 init                              # システム初期化
  $0 check                             # セッション構成確認
  $0 president-to-boss "[message]"     # プレジデント→ボス
  $0 boss-to-worker [1-5] "[message]"  # ボス→ワーカー
  $0 worker-response [1-5] "[response]" # ワーカー→ボス応答
  $0 boss-response "[response]"        # ボス→プレジデント応答

セッション構成:
  sms:president  (ウィンドウ1) - プロジェクト統括
  sms:team       (ウィンドウ2) - チーム全体 (6分割)
    ├── ペイン0: boss (チームリーダー)
    ├── ペイン1: worker1
    ├── ペイン2: worker2
    ├── ペイン3: worker3
    ├── ペイン4: worker4
    └── ペイン5: worker5

例:
  $0 president-to-boss "Hello World プロジェクト開始指示"
  $0 boss-to-worker 1 "あなたはworker1です。Hello World 作業開始"
  $0 worker-response 1 "作業完了しました"
  $0 boss-response "全員完了しました"
EOF
}

# メイン処理
case "$1" in
    "init")
        init_coordination
        check_sessions
        ;;
    "check")
        check_sessions
        ;;
    "president-to-boss")
        if [ -z "$2" ]; then
            echo "❌ メッセージが必要です"
            exit 1
        fi
        president_to_boss "$2"
        ;;
    "boss-to-worker")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "❌ ワーカーIDとメッセージが必要です"
            exit 1
        fi
        boss_to_workers "$2" "$3"
        ;;
    "worker-response")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "❌ ワーカーIDと応答が必要です"
            exit 1
        fi
        worker_response "$2" "$3"
        ;;
    "boss-response")
        if [ -z "$2" ]; then
            echo "❌ 応答が必要です"
            exit 1
        fi
        boss_response "$2"
        ;;
    *)
        show_usage
        ;;
esac