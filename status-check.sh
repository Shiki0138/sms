#!/bin/bash

# Multi-Pane Status Checker
# Shows current status of all panes in the system

COORD_DIR="/tmp/multiagent_coordination"
STATUS_DIR="$COORD_DIR/status"
MESSAGE_DIR="$COORD_DIR/messages"
RESPONSE_DIR="$COORD_DIR/responses"
NOTIFICATION_DIR="$COORD_DIR/notifications"

echo "🔍 MULTI-PANE SYSTEM STATUS CHECK"
echo "=================================="
echo "⏰ Check Time: $(date)"
echo ""

# Check if coordination system is initialized
if [ ! -d "$COORD_DIR" ]; then
    echo "❌ Coordination system not initialized"
    echo "Run ./multipane-coordinator.sh first"
    exit 1
fi

echo "📊 PANE STATUS:"
echo "---------------"
PANES=("boss1" "worker1" "worker2" "worker3" "worker4" "worker5")

for pane in "${PANES[@]}"; do
    status="UNKNOWN"
    if [ -f "$STATUS_DIR/${pane}.status" ]; then
        status=$(cat "$STATUS_DIR/${pane}.status")
    fi
    
    case $status in
        "IDLE")
            echo "✅ $pane: $status (Ready for tasks)"
            ;;
        "BUSY")
            echo "🔄 $pane: $status (Working on task)"
            ;;
        *)
            echo "❓ $pane: $status"
            ;;
    esac
done

echo ""
echo "📨 MESSAGE QUEUE:"
echo "-----------------"
if [ -d "$MESSAGE_DIR" ] && [ "$(ls -A $MESSAGE_DIR 2>/dev/null)" ]; then
    for msg in "$MESSAGE_DIR"/*.txt; do
        if [ -f "$msg" ]; then
            recipient=$(basename "$msg" | cut -d'_' -f1)
            timestamp=$(basename "$msg" | cut -d'_' -f2-3 | sed 's/.txt//')
            echo "📬 Pending message for $recipient (${timestamp})"
        fi
    done
else
    echo "📭 No pending messages"
fi

echo ""
echo "📤 RECENT RESPONSES:"
echo "--------------------"
if [ -d "$RESPONSE_DIR" ] && [ "$(ls -A $RESPONSE_DIR 2>/dev/null)" ]; then
    # Show last 5 responses
    ls -t "$RESPONSE_DIR"/*.txt 2>/dev/null | head -5 | while read resp; do
        if [ -f "$resp" ]; then
            sender=$(basename "$resp" | cut -d'_' -f1)
            type=$(basename "$resp" | cut -d'_' -f2)
            timestamp=$(basename "$resp" | cut -d'_' -f3-4 | sed 's/.txt//')
            echo "📨 $sender sent $type report (${timestamp})"
        fi
    done
else
    echo "📭 No responses yet"
fi

echo ""
echo "🔔 NOTIFICATIONS:"
echo "-----------------"
if [ -d "$NOTIFICATION_DIR" ] && [ "$(ls -A $NOTIFICATION_DIR 2>/dev/null)" ]; then
    # Show unread notifications
    for notif in "$NOTIFICATION_DIR"/*.txt; do
        if [ -f "$notif" ]; then
            timestamp=$(basename "$notif" | cut -d'_' -f2-3 | sed 's/.txt//')
            echo "🔔 New notification for boss1 (${timestamp})"
        fi
    done
else
    echo "🔕 No notifications"
fi

echo ""
echo "🛠️  SYSTEM COMMANDS:"
echo "--------------------"
echo "👨‍💼 Boss commands:"
echo "   ./boss-command.sh [worker] '[task]'"
echo "👷 Worker reports:"
echo "   ./worker-report.sh [worker] '[report]'"
echo "🔄 Status check:"
echo "   ./status-check.sh"
echo "🚀 Start coordinator:"
echo "   ./multipane-coordinator.sh"