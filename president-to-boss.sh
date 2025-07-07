#!/bin/bash

# PRESIDENT to Boss1 Direct Communication
# Usage: ./president-to-boss.sh "[message]"

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
    echo "Usage: ./president-to-boss.sh \"[message]\""
    exit 1
fi

COORD_DIR="/tmp/multiagent_coordination"
MESSAGE_DIR="$COORD_DIR/messages"
RESPONSE_DIR="$COORD_DIR/responses"

# Create directories if they don't exist
mkdir -p "$MESSAGE_DIR" "$RESPONSE_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MESSAGE_FILE="$MESSAGE_DIR/boss1_${TIMESTAMP}.txt"

# Create message file
cat > "$MESSAGE_FILE" << EOF
=== MESSAGE FROM PRESIDENT ===
TO: boss1
TIMESTAMP: $(date)
PRIORITY: HIGH
===========================================

$MESSAGE

===========================================
Please acknowledge receipt by creating a response file:
$RESPONSE_DIR/boss1_response_${TIMESTAMP}.txt
EOF

echo "📨 Message sent to boss1"
echo "📁 File: $MESSAGE_FILE"
echo "⏰ Timestamp: $TIMESTAMP"

# Check if boss1 responds within 30 seconds
echo "⏳ Waiting for response from boss1..."

RESPONSE_FILE="$RESPONSE_DIR/boss1_response_${TIMESTAMP}.txt"
COUNTER=0

while [ $COUNTER -lt 30 ]; do
    if [ -f "$RESPONSE_FILE" ]; then
        echo "✅ Response received from boss1:"
        echo "=================="
        cat "$RESPONSE_FILE"
        echo "=================="
        exit 0
    fi
    sleep 1
    COUNTER=$((COUNTER + 1))
    echo -ne "\r⏳ Waiting... ${COUNTER}s"
done

echo ""
echo "⚠️  No response received from boss1 within 30 seconds"
echo "📁 Message was delivered to: $MESSAGE_FILE"
exit 1