#!/bin/bash

# バックエンドのCORS設定を更新するスクリプト

set -e

echo "🔧 バックエンドのCORS設定を更新します..."

# CORS設定ファイルを更新
cat > backend/src/config/cors.ts << 'EOF'
export const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://storage.googleapis.com',
    'https://salon-frontend-static.storage.googleapis.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400
};
EOF

# app.tsのCORS設定も更新
cat > backend/src/app-cors-update.ts << 'EOF'
// CORS設定の更新
import cors from 'cors';
import { corsOptions } from './config/cors';

// アプリケーションにCORS設定を適用
app.use(cors(corsOptions));
EOF

echo "✅ CORS設定を更新しました"
echo "
📝 次のステップ:
1. バックエンドを再デプロイ
2. フロントエンドからの接続テスト

🌐 フロントエンドURL:
   https://storage.googleapis.com/salon-frontend-static/index.html
"