#!/bin/bash

echo "Starting manual deployment process..."

# Build the project
echo "Building project..."
npm run build

# Create deployment information
echo "Deployment ready. Please follow these steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your Git repository: https://github.com/Shiki0138/sms"
echo "3. Select the 'frontend' directory as the root directory"
echo "4. Use these build settings:"
echo "   - Framework Preset: Vite"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm ci --legacy-peer-deps"
echo "   - Node.js Version: 20.x"
echo ""
echo "5. Add these environment variables:"
echo "   - VITE_API_URL=/api/v1"
echo "   - VITE_ENABLE_LOGIN=true"
echo "   - VITE_SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co"
echo "   - VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM"
echo "   - VITE_DEMO_MODE=false"
echo ""
echo "Build completed successfully!"