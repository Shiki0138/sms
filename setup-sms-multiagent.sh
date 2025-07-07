#!/bin/bash

# SMS Multiagent Session Setup
# Boss (Pane 0) + Staff 1-5 (Panes 1-5)

SESSION_NAME="sms_multiagent"

# Check if session already exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Session $SESSION_NAME already exists"
    tmux attach -t $SESSION_NAME
    exit 0
fi

# Create new session with Boss in pane 0
tmux new-session -d -s $SESSION_NAME -n team

# Split window for 6 panes total (Boss + 5 Staff)
# Create 6 panes in a grid layout
tmux split-window -t $SESSION_NAME:0 -h
tmux split-window -t $SESSION_NAME:0.0 -v
tmux split-window -t $SESSION_NAME:0.1 -v
tmux split-window -t $SESSION_NAME:0.2 -v
tmux split-window -t $SESSION_NAME:0.3 -v

# Select layout for 6 panes
tmux select-layout -t $SESSION_NAME:0 tiled

# Send initialization commands to each pane
# Pane 0: Boss
tmux send-keys -t $SESSION_NAME:0.0 "echo '🎯 Boss Pane (Pane 0) - Ready to coordinate'" C-m
tmux send-keys -t $SESSION_NAME:0.0 "export PANE_ROLE=boss" C-m

# Pane 1-5: Staff
for i in {1..5}; do
    tmux send-keys -t $SESSION_NAME:0.$i "echo '👷 Staff $i (Pane $i) - Ready for instructions'" C-m
    tmux send-keys -t $SESSION_NAME:0.$i "export PANE_ROLE=staff$i" C-m
    tmux send-keys -t $SESSION_NAME:0.$i "export PANE_ID=$i" C-m
done

# Create communication directories
mkdir -p /tmp/sms_multiagent/{instructions,reports,work}

echo "✅ SMS Multiagent session created with 6 panes"
echo "Boss: Pane 0"
echo "Staff 1-5: Panes 1-5"
echo ""
echo "To attach: tmux attach -t $SESSION_NAME"