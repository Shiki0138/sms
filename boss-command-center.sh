#!/bin/bash

# Boss Command Center System
# 各Staffに指示を出し、完了報告を受け取る

WORK_DIR="/Users/MBP/Desktop/system/salon-management-system"
MESSAGES_DIR="$WORK_DIR/messages"
BOSS_ID="boss1"

# メッセージディレクトリを作成
mkdir -p "$MESSAGES_DIR"

# Boss用のメッセージファイル
BOSS_INBOX="$MESSAGES_DIR/boss_inbox.txt"
BOSS_OUTBOX="$MESSAGES_DIR/boss_outbox.txt"

# 初期化
echo "=== BOSS COMMAND CENTER ===" > "$BOSS_INBOX"
echo "=== BOSS COMMANDS ===" > "$BOSS_OUTBOX"

# 作業キューシステム
TASK_QUEUE="$MESSAGES_DIR/task_queue.txt"
ACTIVE_TASKS="$MESSAGES_DIR/active_tasks.txt"
COMPLETED_TASKS="$MESSAGES_DIR/completed_tasks.txt"

# 初期タスクを設定
cat > "$TASK_QUEUE" << 'EOF'
task1:フロントエンドの依存関係チェック
task2:バックエンドAPIの動作確認
task3:データベース接続テスト
task4:本番環境設定の確認
task5:セキュリティ設定の検証
EOF

echo "" > "$ACTIVE_TASKS"
echo "" > "$COMPLETED_TASKS"

# メイン処理関数
show_status() {
    clear
    echo "======================================"
    echo "       BOSS COMMAND CENTER"
    echo "======================================"
    echo "時刻: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    echo "【待機中のタスク】"
    if [ -s "$TASK_QUEUE" ]; then
        cat "$TASK_QUEUE" | nl
    else
        echo "  なし"
    fi
    echo ""
    
    echo "【実行中のタスク】"
    if [ -s "$ACTIVE_TASKS" ]; then
        cat "$ACTIVE_TASKS"
    else
        echo "  なし"
    fi
    echo ""
    
    echo "【完了したタスク】"
    if [ -s "$COMPLETED_TASKS" ]; then
        tail -5 "$COMPLETED_TASKS"
    else
        echo "  なし"
    fi
    echo ""
    
    echo "【最新の報告】"
    if [ -s "$BOSS_INBOX" ]; then
        tail -3 "$BOSS_INBOX"
    fi
    echo ""
    
    echo "======================================"
    echo "コマンド:"
    echo "  1) タスク配布"
    echo "  2) 報告確認"
    echo "  3) 新規タスク追加"
    echo "  4) システム状態確認"
    echo "  q) 終了"
    echo "======================================"
}

# タスク配布関数
distribute_tasks() {
    echo "タスクを配布中..."
    
    # 利用可能なスタッフを確認
    available_staff=()
    for staff_id in 1 2 3 4 5; do
        if ! grep -q "staff$staff_id" "$ACTIVE_TASKS" 2>/dev/null; then
            available_staff+=($staff_id)
        fi
    done
    
    if [ ${#available_staff[@]} -eq 0 ]; then
        echo "すべてのスタッフが作業中です"
        return
    fi
    
    # タスクを配布
    staff_index=0
    while [ -s "$TASK_QUEUE" ] && [ $staff_index -lt ${#available_staff[@]} ]; do
        staff_id=${available_staff[$staff_index]}
        task=$(head -1 "$TASK_QUEUE")
        
        if [ -n "$task" ]; then
            # タスクをアクティブに移動
            echo "$(date '+%H:%M:%S') staff$staff_id: $task" >> "$ACTIVE_TASKS"
            
            # スタッフにタスクを送信
            echo "TASK:$task" > "$MESSAGES_DIR/to_staff$staff_id.txt"
            
            # キューから削除
            sed -i '1d' "$TASK_QUEUE"
            
            echo "Staff$staff_id に「$task」を配布しました"
            staff_index=$((staff_index + 1))
        else
            break
        fi
    done
}

# 報告確認関数
check_reports() {
    echo "報告を確認中..."
    
    for staff_id in 1 2 3 4 5; do
        report_file="$MESSAGES_DIR/from_staff$staff_id.txt"
        if [ -f "$report_file" ] && [ -s "$report_file" ]; then
            echo "=== Staff$staff_id からの報告 ==="
            cat "$report_file"
            echo ""
            
            # 完了報告の場合、アクティブタスクから削除
            if grep -q "COMPLETED" "$report_file"; then
                task_line=$(grep "staff$staff_id" "$ACTIVE_TASKS")
                if [ -n "$task_line" ]; then
                    echo "$(date '+%H:%M:%S') $task_line [完了]" >> "$COMPLETED_TASKS"
                    grep -v "staff$staff_id" "$ACTIVE_TASKS" > "$ACTIVE_TASKS.tmp"
                    mv "$ACTIVE_TASKS.tmp" "$ACTIVE_TASKS"
                fi
            fi
            
            # 報告をボスの受信箱に移動
            echo "$(date '+%H:%M:%S') Staff$staff_id: $(cat "$report_file")" >> "$BOSS_INBOX"
            
            # 報告ファイルをクリア
            > "$report_file"
        fi
    done
}

# 新規タスク追加関数
add_task() {
    echo "新規タスクを追加します"
    echo -n "タスク内容: "
    read task_content
    
    if [ -n "$task_content" ]; then
        echo "task_$(date +%s):$task_content" >> "$TASK_QUEUE"
        echo "タスクを追加しました: $task_content"
    fi
}

# システム状態確認関数
check_system() {
    echo "=== システム状態 ==="
    echo "プロセス数: $(ps aux | grep -c staff-worker)"
    echo "メッセージファイル数: $(ls -1 "$MESSAGES_DIR" 2>/dev/null | wc -l)"
    echo "ディスク使用量: $(du -sh "$WORK_DIR")"
    echo "======================="
}

# メインループ
while true; do
    show_status
    
    # 自動的に報告をチェック
    check_reports
    
    echo -n "選択してください: "
    read choice
    
    case $choice in
        1)
            distribute_tasks
            ;;
        2)
            check_reports
            ;;
        3)
            add_task
            ;;
        4)
            check_system
            ;;
        q)
            echo "Boss Command Center を終了します"
            exit 0
            ;;
        *)
            echo "無効な選択です"
            ;;
    esac
    
    echo "Enterキーで続行..."
    read
done