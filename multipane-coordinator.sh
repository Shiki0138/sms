#!/bin/bash

# Multi-Pane Agent Coordination System
# Boss1 + Worker1-5 (6 panes total)

COORD_DIR="/tmp/multiagent_coordination"
MESSAGE_DIR="$COORD_DIR/messages"
RESPONSE_DIR="$COORD_DIR/responses"
STATUS_DIR="$COORD_DIR/status"

# Initialize coordination directories
mkdir -p "$MESSAGE_DIR" "$RESPONSE_DIR" "$STATUS_DIR"

# Pane configuration
PANES=("boss1" "worker1" "worker2" "worker3" "worker4" "worker5")

# Initialize status files
for pane in "${PANES[@]}"; do
    echo "IDLE" > "$STATUS_DIR/${pane}.status"
done

echo "🚀 Multi-Pane Agent Coordination System Started"
echo "📋 Active Panes: ${PANES[*]}"
echo "📁 Coordination Directory: $COORD_DIR"
echo ""
echo "Available commands:"
echo "  ./boss-command.sh [worker] '[task]'     - Boss assigns task to worker"
echo "  ./worker-report.sh [worker] '[report]'  - Worker reports completion"
echo "  ./status-check.sh                       - Check all pane statuses"
echo ""

# Monitor loop
while true; do
    echo "🔄 Monitoring pane communication..."
    
    # Check for new messages
    if [ "$(ls -A $MESSAGE_DIR 2>/dev/null)" ]; then
        for msg_file in "$MESSAGE_DIR"/*.txt; do
            if [ -f "$msg_file" ]; then
                recipient=$(basename "$msg_file" | cut -d'_' -f1)
                echo "📨 New message for: $recipient"
                echo "   File: $msg_file"
            fi
        done
    fi
    
    # Check for responses
    if [ "$(ls -A $RESPONSE_DIR 2>/dev/null)" ]; then
        for resp_file in "$RESPONSE_DIR"/*.txt; do
            if [ -f "$resp_file" ]; then
                sender=$(basename "$resp_file" | cut -d'_' -f1)
                echo "📤 Response from: $sender"
                echo "   File: $resp_file"
            fi
        done
    fi
    
    sleep 5
done