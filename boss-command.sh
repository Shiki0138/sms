#!/bin/bash

# Boss1 Command Distribution System
# Usage: ./boss-command.sh [worker] "[task description]"

WORKER=$1
TASK=$2

if [ -z "$WORKER" ] || [ -z "$TASK" ]; then
    echo "Usage: ./boss-command.sh [worker] \"[task description]\""
    echo "Available workers: worker1, worker2, worker3, worker4, worker5"
    exit 1
fi

# Validate worker
if [[ ! "$WORKER" =~ ^worker[1-5]$ ]]; then
    echo "❌ Invalid worker. Use: worker1, worker2, worker3, worker4, or worker5"
    exit 1
fi

COORD_DIR="/tmp/multiagent_coordination"
MESSAGE_DIR="$COORD_DIR/messages"
STATUS_DIR="$COORD_DIR/status"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create directories if they don't exist
mkdir -p "$MESSAGE_DIR" "$STATUS_DIR"

# Check worker status
WORKER_STATUS="IDLE"
if [ -f "$STATUS_DIR/${WORKER}.status" ]; then
    WORKER_STATUS=$(cat "$STATUS_DIR/${WORKER}.status")
fi

if [ "$WORKER_STATUS" = "BUSY" ]; then
    echo "⚠️  Warning: $WORKER is currently BUSY"
    read -p "Continue anyway? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "❌ Task assignment cancelled"
        exit 1
    fi
fi

# Create task message
MESSAGE_FILE="$MESSAGE_DIR/${WORKER}_${TIMESTAMP}.txt"
cat > "$MESSAGE_FILE" << EOF
=== TASK ASSIGNMENT FROM BOSS1 ===
TO: $WORKER
FROM: boss1
TIMESTAMP: $(date)
TASK_ID: TASK_${TIMESTAMP}
PRIORITY: HIGH
==========================================

📋 TASK DESCRIPTION:
$TASK

==========================================
📝 INSTRUCTIONS:
1. Update your status to BUSY when starting
2. Complete the assigned task
3. Report completion using: ./worker-report.sh $WORKER "[completion report]"
4. Update your status to IDLE when finished

⏰ Expected completion: ASAP
🔄 Status updates required: Yes

==========================================
Please acknowledge receipt and start working on this task.
EOF

# Update worker status to BUSY
echo "BUSY" > "$STATUS_DIR/${WORKER}.status"

echo "✅ Task assigned to $WORKER"
echo "📁 Message file: $MESSAGE_FILE"
echo "🔄 Worker status updated to: BUSY"
echo "⏳ Waiting for acknowledgment..."

# Wait for acknowledgment
RESPONSE_FILE="$COORD_DIR/responses/${WORKER}_ack_${TIMESTAMP}.txt"
COUNTER=0

while [ $COUNTER -lt 60 ]; do
    if [ -f "$RESPONSE_FILE" ]; then
        echo "✅ Acknowledgment received from $WORKER"
        echo "📄 Response:"
        echo "=================="
        cat "$RESPONSE_FILE"
        echo "=================="
        break
    fi
    sleep 1
    COUNTER=$((COUNTER + 1))
    echo -ne "\r⏳ Waiting for acknowledgment... ${COUNTER}s"
done

if [ $COUNTER -eq 60 ]; then
    echo ""
    echo "⚠️  No acknowledgment received within 60 seconds"
    echo "📨 Task message delivered to: $MESSAGE_FILE"
fi