#!/bin/bash

# Start SMS Multiagent System
# This script initializes the Boss-Staff communication system

echo "🚀 Starting SMS Multiagent System..."

# Make scripts executable
chmod +x setup-sms-multiagent.sh boss-controller.sh staff-worker.sh

# Setup tmux session if not exists
./setup-sms-multiagent.sh

# Wait a moment for session to be ready
sleep 1

# Start Boss controller in pane 0
echo "Starting Boss controller..."
tmux send-keys -t sms_multiagent:0.0 "cd $(pwd) && ./boss-controller.sh" C-m

# Start Staff workers in panes 1-5
for i in {1..5}; do
    echo "Starting Staff $i worker..."
    tmux send-keys -t sms_multiagent:0.$i "cd $(pwd) && ./staff-worker.sh $i" C-m
done

echo "✅ SMS Multiagent System started!"
echo ""
echo "📊 System Overview:"
echo "- Boss (Pane 0): Coordinating and assigning tasks"
echo "- Staff 1 (Pane 1): Deployment/Vercel tasks"
echo "- Staff 2 (Pane 2): Backend/Database tasks"
echo "- Staff 3 (Pane 3): Frontend optimization tasks"
echo "- Staff 4 (Pane 4): Security/Infrastructure tasks"
echo "- Staff 5 (Pane 5): Testing/QA tasks"
echo ""
echo "📁 Communication directories:"
echo "- Instructions: /tmp/sms_multiagent/instructions/"
echo "- Reports: /tmp/sms_multiagent/reports/"
echo "- Work: /tmp/sms_multiagent/work/"
echo ""
echo "To view the session: tmux attach -t sms_multiagent"
echo "To stop: tmux kill-session -t sms_multiagent"