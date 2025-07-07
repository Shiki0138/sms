#!/bin/bash

# Start All Staff Auto-Responders
# This script launches auto-responders for all staff members

echo "🚀 Starting Staff Auto-Response System"

# Make scripts executable
chmod +x staff-auto-responder.sh

# Start responders for each staff member in background
echo "Starting Worker1 (Frontend/Deployment)..."
./staff-auto-responder.sh worker1 1 > /tmp/worker1_responder.out 2>&1 &
WORKER1_PID=$!

echo "Starting Worker2 (Backend/API)..."
./staff-auto-responder.sh worker2 2 > /tmp/worker2_responder.out 2>&1 &
WORKER2_PID=$!

echo "Starting Worker3 (Frontend Optimization)..."
./staff-auto-responder.sh worker3 3 > /tmp/worker3_responder.out 2>&1 &
WORKER3_PID=$!

echo "Starting Staff4 (Security/Infrastructure)..."
./staff-auto-responder.sh staff4 4 > /tmp/staff4_responder.out 2>&1 &
STAFF4_PID=$!

echo "Starting Staff5 (Testing/QA)..."
./staff-auto-responder.sh staff5 5 > /tmp/staff5_responder.out 2>&1 &
STAFF5_PID=$!

# Save PIDs for later management
cat > /tmp/staff_responder_pids.txt << EOF
WORKER1_PID=$WORKER1_PID
WORKER2_PID=$WORKER2_PID
WORKER3_PID=$WORKER3_PID
STAFF4_PID=$STAFF4_PID
STAFF5_PID=$STAFF5_PID
EOF

echo "✅ All staff auto-responders started!"
echo ""
echo "📊 Status:"
echo "- Worker1 (PID: $WORKER1_PID): Frontend/Deployment"
echo "- Worker2 (PID: $WORKER2_PID): Backend/API"
echo "- Worker3 (PID: $WORKER3_PID): Frontend Optimization"
echo "- Staff4 (PID: $STAFF4_PID): Security/Infrastructure"
echo "- Staff5 (PID: $STAFF5_PID): Testing/QA"
echo ""
echo "📝 Logs available at:"
echo "- /tmp/worker1_auto_responder.log"
echo "- /tmp/worker2_auto_responder.log"
echo "- /tmp/worker3_auto_responder.log"
echo "- /tmp/staff4_auto_responder.log"
echo "- /tmp/staff5_auto_responder.log"
echo ""
echo "🛑 To stop all responders, run: ./stop-all-staff-responders.sh"