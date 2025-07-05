# 🔧 Salon Management System - Troubleshooting Guide

## 🚀 Quick Start (Recommended)

### Automated Startup
```bash
cd /Users/MBP/LINE
./start-system.sh
```

### Automated Stop
```bash
cd /Users/MBP/LINE
./stop-system.sh
```

## 🐛 Common Issues & Solutions

### 1. Port Already in Use Error
**Problem:** `EADDRINUSE: address already in use :::4002` or `:::4003`

**Solution:**
```bash
# Kill processes on specific ports
lsof -ti:4002 | xargs kill -9
lsof -ti:4003 | xargs kill -9

# Or use the stop script
./stop-system.sh
```

### 2. Frontend Shows "このサイトにアクセスできません" (Cannot Access Site)
**Problem:** Frontend server not running or crashed

**Solutions:**
```bash
# Method 1: Use startup script
./start-system.sh

# Method 2: Manual restart
cd frontend
rm -rf node_modules/.vite dist
npm run dev
```

### 3. Backend Connection Refused
**Problem:** Backend server not responding

**Solutions:**
```bash
# Check backend status
curl http://localhost:4002/health

# Restart backend
cd backend
npm run build
npm start
```

### 4. Database Schema Issues
**Problem:** Database schema out of sync

**Solutions:**
```bash
cd backend
npx prisma db push
npx ts-node scripts/migrate-auto-messages.ts
```

### 5. TypeScript Compilation Errors
**Problem:** TypeScript build failures

**Solutions:**
```bash
cd backend
npm run build

# If errors persist, install dependencies
npm install
```

## 📊 System Health Checks

### Check Running Services
```bash
# Check all processes
ps aux | grep -E "(vite|node)" | grep -v grep

# Check specific ports
lsof -i :4002  # Backend
lsof -i :4003  # Frontend
```

### Test Endpoints
```bash
# Backend health
curl http://localhost:4002/health

# Frontend access
curl http://localhost:4003

# API endpoints
curl http://localhost:4002/api/v1/customers
curl http://localhost:4002/api/v1/auto-messages/templates
```

## 🔄 Complete System Reset

If all else fails, perform a complete reset:

```bash
# 1. Stop everything
./stop-system.sh

# 2. Clean up processes (nuclear option)
pkill -f node
pkill -f vite
pkill -f npm

# 3. Clear caches
cd backend
rm -rf node_modules/.cache dist
cd ../frontend  
rm -rf node_modules/.vite dist

# 4. Restart
./start-system.sh
```

## 📝 Log Files

### Check Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs  
tail -f /tmp/frontend.log

# System logs (if using startup script)
cat /tmp/salon_system_pids.txt
```

### Manual Log Monitoring
```bash
# Backend manual start with logs
cd backend
npm start 2>&1 | tee /tmp/backend-manual.log

# Frontend manual start with logs
cd frontend
npm run dev 2>&1 | tee /tmp/frontend-manual.log
```

## 🛠️ Development Environment

### Required Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Environment Variables
Create `.env` in backend directory:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=4002
API_VERSION=v1
```

## 🎯 Auto-Message System Specific

### Test Auto-Message Features
```bash
# Check templates
curl http://localhost:4002/api/v1/auto-messages/templates

# Check settings
curl http://localhost:4002/api/v1/auto-messages/settings

# Manual trigger (requires auth token)
curl -X POST http://localhost:4002/api/v1/auto-messages/trigger
```

### Database Schema Check
```bash
cd backend
npx prisma studio  # Visual database explorer
npx prisma db push  # Sync schema
```

## 🔑 Authentication Issues

If API calls fail with 401/403:
```bash
# The demo system uses simplified auth
# Check routes in backend/src/routes/simple.ts for non-auth endpoints
```

## 🚨 Emergency Procedures

### Complete System Wipe & Reinstall
```bash
# 1. Stop all processes
./stop-system.sh

# 2. Backup important data (if any)
cp backend/dev.db backup-$(date +%Y%m%d).db

# 3. Clean install
cd backend
rm -rf node_modules
npm install
npx prisma db push

cd ../frontend
rm -rf node_modules
npm install

# 4. Restart
./start-system.sh
```

## 📞 Support Information

### System Architecture
- **Backend:** Node.js + Express + Prisma + SQLite
- **Frontend:** React + Vite + Tailwind CSS  
- **Database:** SQLite (file: backend/dev.db)
- **Scheduler:** node-cron for automated messages

### Key Endpoints
- Frontend: http://localhost:4003
- Backend API: http://localhost:4002/api/v1
- Health Check: http://localhost:4002/health
- Database: backend/dev.db

### Feature Status
✅ Unified Inbox (Message Management)
✅ Auto Reminders (1 week + 3 days before)
✅ Follow-up Messages (after visit date + 1 week)
✅ Template Management
✅ Settings (ON/OFF toggles)
✅ Channel Priority (LINE → Instagram → Email)
✅ Automated Scheduler (hourly processing)
✅ Message Logging & Audit Trail