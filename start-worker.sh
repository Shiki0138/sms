#!/bin/bash

# Worker Terminal Setup Script
# Usage: ./start-worker.sh [worker_number]

WORKER_NUM=$1

if [ -z "$WORKER_NUM" ]; then
    echo "Usage: ./start-worker.sh [1|2|3]"
    exit 1
fi

WORKER_NAME="worker${WORKER_NUM}"
PROJECT_DIR="/Users/MBP/Desktop/system/salon-management-system"

echo "🚀 Starting $WORKER_NAME terminal environment..."
echo "=====================================+"

# Create worker directory
mkdir -p "/tmp/multiagent_coordination/workers/$WORKER_NAME"

# Set working directory
cd "$PROJECT_DIR"

# Create worker environment variables
export WORKER_ID="$WORKER_NAME"
export WORKER_PROJECT_DIR="$PROJECT_DIR"
export WORKER_COORDINATION_DIR="/tmp/multiagent_coordination"

echo "✅ Environment setup complete for $WORKER_NAME"
echo "📁 Project directory: $PROJECT_DIR"
echo "🔧 Worker ID: $WORKER_ID"
echo "📨 Message directory: /tmp/multiagent_coordination/messages"
echo "📤 Response directory: /tmp/multiagent_coordination/responses"
echo ""
echo "🎯 Now starting Claude with skip permissions..."
echo "Run: claude --dangerously-skip-permissions"
echo ""
echo "📋 Worker Instructions:"
echo "1. Monitor: /tmp/multiagent_coordination/messages/${WORKER_NAME}_*.txt"
echo "2. Respond: /tmp/multiagent_coordination/responses/${WORKER_NAME}_response_*.txt"
echo "3. Working dir: $PROJECT_DIR"
echo ""
echo "🔄 Starting Claude session..."

# Start Claude with skip permissions
claude --dangerously-skip-permissions