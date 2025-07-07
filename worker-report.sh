#!/bin/bash

# Worker Completion Report System
# Usage: ./worker-report.sh [worker_id] "[completion report]"

WORKER=$1
REPORT=$2

if [ -z "$WORKER" ] || [ -z "$REPORT" ]; then
    echo "Usage: ./worker-report.sh [worker_id] \"[completion report]\""
    echo "Worker IDs: worker1, worker2, worker3, worker4, worker5"
    exit 1
fi

# Validate worker ID
if [[ ! "$WORKER" =~ ^worker[1-5]$ ]]; then
    echo "❌ Invalid worker ID. Use: worker1, worker2, worker3, worker4, or worker5"
    exit 1
fi

COORD_DIR="/tmp/multiagent_coordination"
RESPONSE_DIR="$COORD_DIR/responses"
STATUS_DIR="$COORD_DIR/status"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create directories if they don't exist
mkdir -p "$RESPONSE_DIR" "$STATUS_DIR"

# Create completion report
REPORT_FILE="$RESPONSE_DIR/${WORKER}_completion_${TIMESTAMP}.txt"
cat > "$REPORT_FILE" << EOF
=== TASK COMPLETION REPORT ===
FROM: $WORKER
TO: boss1
TIMESTAMP: $(date)
REPORT_ID: REPORT_${TIMESTAMP}
STATUS: COMPLETED
==========================================

📊 COMPLETION REPORT:
$REPORT

==========================================
✅ Task Status: COMPLETED
⏰ Completion Time: $(date)
🔄 Worker Status: Returning to IDLE

==========================================
Ready for next assignment.
EOF

# Update worker status to IDLE
echo "IDLE" > "$STATUS_DIR/${WORKER}.status"

echo "✅ Completion report submitted by $WORKER"
echo "📁 Report file: $REPORT_FILE"
echo "🔄 Worker status updated to: IDLE"
echo "📊 Report Summary:"
echo "=================="
echo "$REPORT"
echo "=================="

# Notify boss1 (create notification file)
NOTIFICATION_FILE="$COORD_DIR/notifications/boss1_${TIMESTAMP}.txt"
mkdir -p "$COORD_DIR/notifications"
cat > "$NOTIFICATION_FILE" << EOF
🎉 TASK COMPLETED NOTIFICATION
Worker: $WORKER
Completion Time: $(date)
Report: $REPORT
Report File: $REPORT_FILE
EOF

echo "📬 Boss1 notification created: $NOTIFICATION_FILE"