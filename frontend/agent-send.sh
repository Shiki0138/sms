#!/bin/bash

# Agent Communication Script for Salon Management System
# Usage: ./agent-send.sh [recipient] "[message]"

RECIPIENT=$1
MESSAGE=$2

if [ -z "$RECIPIENT" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: ./agent-send.sh [recipient] \"[message]\""
    echo "Recipients: boss1, worker1, worker2, worker3"
    exit 1
fi

# Create coordination directory if it doesn't exist
mkdir -p /tmp/multiagent_coordination/messages

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create message file
MESSAGE_FILE="/tmp/multiagent_coordination/messages/${RECIPIENT}_${TIMESTAMP}.txt"

echo "=== MESSAGE FROM PRESIDENT ===" > "$MESSAGE_FILE"
echo "TO: $RECIPIENT" >> "$MESSAGE_FILE"
echo "TIMESTAMP: $(date)" >> "$MESSAGE_FILE"
echo "PRIORITY: HIGH" >> "$MESSAGE_FILE"
echo "===========================================" >> "$MESSAGE_FILE"
echo "" >> "$MESSAGE_FILE"
echo "$MESSAGE" >> "$MESSAGE_FILE"
echo "" >> "$MESSAGE_FILE"
echo "===========================================" >> "$MESSAGE_FILE"
echo "Please acknowledge receipt by creating a response file:" >> "$MESSAGE_FILE"
echo "/tmp/multiagent_coordination/responses/${RECIPIENT}_response_${TIMESTAMP}.txt" >> "$MESSAGE_FILE"

echo " Message sent to $RECIPIENT"
echo "=Á File: $MESSAGE_FILE"
echo "ð Timestamp: $TIMESTAMP"

# Check if recipient responds within 30 seconds
echo "ó Waiting for response from $RECIPIENT..."

RESPONSE_FILE="/tmp/multiagent_coordination/responses/${RECIPIENT}_response_${TIMESTAMP}.txt"
COUNTER=0

while [ $COUNTER -lt 30 ]; do
    if [ -f "$RESPONSE_FILE" ]; then
        echo " Response received from $RECIPIENT:"
        echo "=================="
        cat "$RESPONSE_FILE"
        echo "=================="
        exit 0
    fi
    sleep 1
    COUNTER=$((COUNTER + 1))
    echo -ne "\rWaiting... ${COUNTER}s"
done

echo ""
echo "   No response received from $RECIPIENT within 30 seconds"
echo "=Ë Message was delivered to: $MESSAGE_FILE"
exit 1