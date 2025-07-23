#!/bin/bash

echo "🚀 Vercel静的デプロイ準備中..."

# ビルドを確認
if [ ! -d "dist" ]; then
  echo "📦 ビルドを実行中..."
  npm run build
fi

echo "✅ ビルドが完了しました"
echo "📁 dist フォルダの内容:"
ls -la dist/

echo ""
echo "🔗 Vercelにデプロイするには以下の手順を実行してください:"
echo ""
echo "1. Vercelダッシュボードにアクセス: https://vercel.com/dashboard"
echo "2. 'Add New...' → 'Project' をクリック"
echo "3. 'Browse All Git Repositories' で https://github.com/Shiki0138/sms を選択"
echo "4. 'Import' をクリック"
echo "5. 以下の設定を入力:"
echo "   - Project Name: salon-management-frontend"
echo "   - Framework Preset: Vite"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm ci --legacy-peer-deps"
echo "   - Node.js Version: 20.x"
echo ""
echo "6. 環境変数を設定:"
echo "   VITE_API_URL=/api/v1"
echo "   VITE_ENABLE_LOGIN=true"
echo "   VITE_SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM"
echo "   VITE_DEMO_MODE=false"
echo ""
echo "7. 'Deploy' をクリック"
echo ""
echo "🎉 デプロイが完了したら、URLが表示されます！"