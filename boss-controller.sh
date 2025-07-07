#!/bin/bash

# Boss Controller for SMS Multiagent
# Runs in Pane 0 to coordinate all staff

INSTRUCTION_DIR="/tmp/sms_multiagent/instructions"
REPORT_DIR="/tmp/sms_multiagent/reports"
WORK_DIR="/tmp/sms_multiagent/work"

# Create directories if they don't exist
mkdir -p "$INSTRUCTION_DIR" "$REPORT_DIR" "$WORK_DIR"

# Function to send instruction to staff
send_instruction() {
    local staff_id=$1
    local task=$2
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local instruction_file="$INSTRUCTION_DIR/staff${staff_id}_${timestamp}.txt"
    
    cat > "$instruction_file" << EOF
=== INSTRUCTION FROM BOSS ===
TO: Staff $staff_id
TIMESTAMP: $(date)
TASK_ID: ${timestamp}
==============================

$task

==============================
Report completion to: $REPORT_DIR/staff${staff_id}_complete_${timestamp}.txt
EOF
    
    # Send notification to staff pane
    tmux send-keys -t sms_multiagent:0.$staff_id "echo '📨 New instruction received!'" C-m
    echo "✅ Instruction sent to Staff $staff_id"
}

# Function to check for completion reports
check_reports() {
    local new_reports=$(find "$REPORT_DIR" -name "*.txt" -newer /tmp/sms_multiagent/.last_check 2>/dev/null || find "$REPORT_DIR" -name "*.txt")
    
    if [ ! -z "$new_reports" ]; then
        echo "📊 New completion reports:"
        for report in $new_reports; do
            echo "---"
            cat "$report"
            echo "---"
            
            # Extract staff ID from report filename
            local staff_id=$(basename "$report" | sed 's/staff\([0-9]\)_complete.*/\1/')
            
            # Mark as processed
            mv "$report" "${report}.processed"
            
            # Decide next task
            assign_next_task "$staff_id"
        done
    fi
    
    touch /tmp/sms_multiagent/.last_check
}

# Function to assign next task based on completion
assign_next_task() {
    local staff_id=$1
    echo "🤔 Considering next task for Staff $staff_id..."
    
    case $staff_id in
        1)
            send_instruction 1 "Continue with Vercel environment variable configuration"
            ;;
        2)
            send_instruction 2 "Proceed with Stripe API integration"
            ;;
        3)
            send_instruction 3 "Implement lazy loading for components"
            ;;
        4)
            send_instruction 4 "Configure rate limiting middleware"
            ;;
        5)
            send_instruction 5 "Set up automated test suite"
            ;;
    esac
}

# Initial task assignment
echo "🎯 Boss Controller Started"
echo "Assigning initial tasks to all staff..."

send_instruction 1 "Remove Vercel authentication screen and enable public access"
send_instruction 2 "Establish Supabase database connection"
send_instruction 3 "Optimize frontend bundle size"
send_instruction 4 "Implement CORS configuration"
send_instruction 5 "Prepare test environment setup"

echo "📡 Monitoring for completion reports..."

# Main monitoring loop
while true; do
    check_reports
    sleep 5
done