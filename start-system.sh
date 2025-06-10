#!/bin/bash

# Salon Management System Startup Script
echo "🚀 Starting Salon Management System..."

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🔪 Killing processes on port $port..."
        kill -9 $pids 2>/dev/null
        sleep 2
    fi
}

# Function to check if port is free
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to wait for port to be available
wait_for_port() {
    local port=$1
    local timeout=30
    local count=0
    
    while [ $count -lt $timeout ]; do
        if check_port $port; then
            echo "✅ Port $port is available"
            return 0
        fi
        echo "⏳ Waiting for port $port to be available... ($count/$timeout)"
        sleep 1
        count=$((count + 1))
    done
    
    echo "❌ Timeout waiting for port $port"
    return 1
}

# Clean up existing processes
echo "🧹 Cleaning up existing processes..."
kill_port 4002
kill_port 4003

# Wait for ports to be available
wait_for_port 4002
wait_for_port 4003

# Navigate to project root
cd /Users/MBP/LINE

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run build 2>/dev/null || echo "⚠️  Build failed, continuing with existing build"

# Start backend in background
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend started successfully (PID: $BACKEND_PID)"
    
    # Test backend health
    for i in {1..10}; do
        if curl -s http://localhost:4002/health > /dev/null; then
            echo "✅ Backend health check passed"
            break
        else
            echo "⏳ Waiting for backend health check... ($i/10)"
            sleep 2
        fi
    done
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend

# Clear frontend cache
rm -rf node_modules/.vite dist 2>/dev/null

# Start frontend in background
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"
    
    # Test frontend
    for i in {1..10}; do
        if curl -s http://localhost:4003 > /dev/null; then
            echo "✅ Frontend health check passed"
            break
        else
            echo "⏳ Waiting for frontend health check... ($i/10)"
            sleep 2
        fi
    done
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 Salon Management System started successfully!"
echo ""
echo "📊 System Status:"
echo "  Backend:  http://localhost:4002 (PID: $BACKEND_PID)"
echo "  Frontend: http://localhost:4003 (PID: $FRONTEND_PID)"
echo "  Health:   http://localhost:4002/health"
echo ""
echo "🔧 Features Available:"
echo "  • 統合メッセージ管理 (Unified Inbox)"
echo "  • 予約リマインダー (Reservation Reminders)"
echo "  • 来店促進メッセージ (Follow-up Messages)"
echo "  • 自動メッセージスケジューラー (Auto Scheduler)"
echo ""
echo "📝 Logs:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop the system:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Save PIDs for easy cleanup
echo "$BACKEND_PID $FRONTEND_PID" > /tmp/salon_system_pids.txt

echo "✨ Ready to use! Open http://localhost:4003 in your browser"