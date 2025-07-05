#!/bin/bash

# Salon Management System Stop Script
echo "🛑 Stopping Salon Management System..."

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🔪 Killing processes on port $port..."
        kill -9 $pids 2>/dev/null
        sleep 1
    else
        echo "✅ No processes found on port $port"
    fi
}

# Kill processes by PID if available
if [ -f /tmp/salon_system_pids.txt ]; then
    echo "📋 Reading saved PIDs..."
    PIDS=$(cat /tmp/salon_system_pids.txt)
    for pid in $PIDS; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "🔪 Killing process $pid..."
            kill -9 $pid 2>/dev/null
        fi
    done
    rm -f /tmp/salon_system_pids.txt
fi

# Kill by port as backup
echo "🧹 Cleaning up ports..."
kill_port 4002
kill_port 4003

# Clean up log files
echo "🗑️  Cleaning up logs..."
rm -f /tmp/backend.log /tmp/frontend.log

# Kill any remaining node/vite processes related to our project
echo "🧼 Final cleanup..."
pkill -f "salon-management" 2>/dev/null || true
pkill -f "vite.*4003" 2>/dev/null || true

echo "✅ Salon Management System stopped successfully!"
echo ""
echo "🚀 To start again, run: ./start-system.sh"