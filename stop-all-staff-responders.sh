#!/bin/bash

# Stop All Staff Auto-Responders

echo "🛑 Stopping Staff Auto-Response System"

# Read PIDs from file
if [ -f /tmp/staff_responder_pids.txt ]; then
    source /tmp/staff_responder_pids.txt
    
    # Kill each process
    for pid_var in WORKER1_PID WORKER2_PID WORKER3_PID STAFF4_PID STAFF5_PID; do
        pid=${!pid_var}
        if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
            echo "Stopping ${pid_var%_PID} (PID: $pid)..."
            kill $pid
        fi
    done
    
    # Clean up PID file
    rm -f /tmp/staff_responder_pids.txt
    
    echo "✅ All staff auto-responders stopped"
else
    echo "⚠️  No running responders found"
fi

# Optional: Clean up processed message markers
read -p "Clean up processed message markers? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    find /tmp/multiagent_coordination/messages -name "*.processed" -delete
    find /tmp/sms_coordination/messages -name "*.processed" -delete
    echo "✅ Cleaned up processed markers"
fi