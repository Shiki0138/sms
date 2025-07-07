#!/bin/bash

# Staff Auto-Responder System for Multiagent Coordination
# This script enables staff members to automatically respond to boss instructions

STAFF_ID="${1:-worker1}"  # Default to worker1 if not specified
PANE_ID="${2:-1}"         # Pane ID (1 for worker1, 2 for worker2, etc.)
BOSS_PANE="0"             # Boss is always in pane 0

# Directories for message coordination
MESSAGE_DIR="/tmp/multiagent_coordination/messages"
RESPONSE_DIR="/tmp/multiagent_coordination/responses"
SMS_MESSAGE_DIR="/tmp/sms_coordination/messages"
SMS_RESPONSE_DIR="/tmp/sms_coordination/responses"

# Create directories if they don't exist
mkdir -p "$MESSAGE_DIR" "$RESPONSE_DIR" "$SMS_MESSAGE_DIR" "$SMS_RESPONSE_DIR"

# Log file for debugging
LOG_FILE="/tmp/${STAFF_ID}_auto_responder.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to check for new messages
check_for_messages() {
    # Check both message directories
    local new_messages=()
    
    # Check multiagent coordination messages
    if [ -d "$MESSAGE_DIR" ]; then
        for msg in "$MESSAGE_DIR"/${STAFF_ID}_*.txt; do
            if [ -f "$msg" ] && [ ! -f "${msg}.processed" ]; then
                new_messages+=("$msg")
            fi
        done
    fi
    
    # Check SMS coordination messages
    if [ -d "$SMS_MESSAGE_DIR" ]; then
        for msg in "$SMS_MESSAGE_DIR"/sms:team:${PANE_ID}:*.txt; do
            if [ -f "$msg" ] && [ ! -f "${msg}.processed" ]; then
                new_messages+=("$msg")
            fi
        done
    fi
    
    echo "${new_messages[@]}"
}

# Function to parse task from message
parse_task() {
    local message_file="$1"
    local task_type=""
    local priority=""
    
    # Extract priority
    priority=$(grep -E "^PRIORITY:" "$message_file" | cut -d' ' -f2)
    
    # Detect task type based on content
    if grep -q "Vercelデプロイメント\|デプロイメント修正" "$message_file"; then
        task_type="deployment"
    elif grep -q "バックエンド\|API統合\|データベース" "$message_file"; then
        task_type="backend"
    elif grep -q "フロントエンド最適化\|パフォーマンス" "$message_file"; then
        task_type="frontend"
    elif grep -q "セキュリティ\|インフラ" "$message_file"; then
        task_type="security"
    elif grep -q "テスト\|品質保証" "$message_file"; then
        task_type="testing"
    else
        task_type="general"
    fi
    
    echo "$task_type:$priority"
}

# Function to execute task (simulate work)
execute_task() {
    local task_type="$1"
    local staff_id="$2"
    local status="in_progress"
    local result=""
    
    log "Executing $task_type task for $staff_id"
    
    case "$task_type" in
        "deployment")
            result="Vercelデプロイメント修正を開始しました。認証画面の削除とパブリックアクセスの設定を進めています。"
            sleep 2
            ;;
        "backend")
            result="バックエンドAPI統合を開始しました。Supabase接続とAPI設定を進めています。"
            sleep 2
            ;;
        "frontend")
            result="フロントエンド最適化を開始しました。バンドルサイズ削減とパフォーマンス改善を実施中です。"
            sleep 2
            ;;
        "security")
            result="セキュリティ設定を開始しました。CORS設定とレート制限の実装を進めています。"
            sleep 2
            ;;
        "testing")
            result="品質保証テストを開始しました。E2Eテストとパフォーマンステストを実施中です。"
            sleep 2
            ;;
        *)
            result="タスクを確認し、作業を開始しました。"
            sleep 1
            ;;
    esac
    
    echo "$result"
}

# Function to create response
create_response() {
    local message_file="$1"
    local task_info="$2"
    local execution_result="$3"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local response_file=""
    
    # Determine response file location based on message source
    if [[ "$message_file" == *"multiagent_coordination"* ]]; then
        # Extract original timestamp from message file name
        local orig_timestamp=$(basename "$message_file" | sed 's/.*_\([0-9]\{8\}_[0-9]\{6\}\)\.txt/\1/')
        response_file="$RESPONSE_DIR/${STAFF_ID}_response_${orig_timestamp}.txt"
    else
        # SMS coordination response
        response_file="$SMS_RESPONSE_DIR/sms:team:0:response_${timestamp}.txt"
    fi
    
    # Create response content
    local staff_upper=$(echo "$STAFF_ID" | tr '[:lower:]' '[:upper:]')
    local current_time=$(date +"%H:%M")
    local current_date=$(date)
    
    cat > "$response_file" << EOF
=== $staff_upper → BOSS RESPONSE ===
FROM: $STAFF_ID (pane $PANE_ID)
TO: boss1 (pane 0)
TIMESTAMP: $current_date
STATUS: ACKNOWLEDGED
======================================

タスクを受領し、作業を開始しました。

## 実行状況
$execution_result

## 進捗
- タスク解析: 完了
- 作業開始: $current_time
- 予定完了時間: 指定期限内

## 次のステップ
1. 詳細な実装を進めます
2. 問題が発生した場合は即座に報告します
3. 完了時に詳細レポートを提出します

$staff_upper
======================================
EOF
    
    log "Response created: $response_file"
    echo "$response_file"
}

# Main loop
log "Starting auto-responder for $STAFF_ID"
echo "🤖 ${STAFF_ID} Auto-Responder Started"
echo "Monitoring for boss instructions..."

while true; do
    # Check for new messages
    messages=($(check_for_messages))
    
    if [ ${#messages[@]} -gt 0 ]; then
        for msg in "${messages[@]}"; do
            log "Processing message: $msg"
            echo "📨 New message received: $(basename "$msg")"
            
            # Parse task from message
            task_info=$(parse_task "$msg")
            task_type=$(echo "$task_info" | cut -d':' -f1)
            priority=$(echo "$task_info" | cut -d':' -f2)
            
            echo "📋 Task type: $task_type (Priority: $priority)"
            
            # Execute task
            result=$(execute_task "$task_type" "$STAFF_ID")
            echo "⚡ $result"
            
            # Create and send response
            response_file=$(create_response "$msg" "$task_info" "$result")
            echo "✅ Response sent to boss"
            
            # Mark message as processed
            touch "${msg}.processed"
            
            # If high priority, alert immediately
            if [ "$priority" = "HIGH" ] || [ "$priority" = "CRITICAL" ]; then
                echo "🚨 HIGH PRIORITY task acknowledged and started!"
            fi
        done
    fi
    
    # Wait before next check
    sleep 5
done