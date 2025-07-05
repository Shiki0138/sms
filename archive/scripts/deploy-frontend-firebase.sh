#!/bin/bash

# Firebase Hostingへのフロントエンドデプロイスクリプト
# コスト: 無料枠内で運用可能（10GB/月のホスティング、10GB/月の転送量）

set -e

echo "🚀 Firebase Hostingへのフロントエンドデプロイを開始します..."

# 変数設定
PROJECT_ID="salon-management-prod"
SITE_NAME="salon-frontend"

# Firebase CLIのインストール確認
if ! command -v firebase &> /dev/null; then
    echo "📦 Firebase CLIをインストールしています..."
    npm install -g firebase-tools
fi

# Firebase設定ファイルを作成
cat > firebase.json << EOF
{
  "hosting": {
    "site": "$SITE_NAME",
    "public": "frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ]
  }
}
EOF

# .firebaserc設定ファイルを作成
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

# フロントエンドのビルド確認
if [ ! -d "frontend/dist" ]; then
    echo "📦 フロントエンドをビルドしています..."
    cd frontend
    npm run build
    cd ..
fi

# Firebaseプロジェクトの設定
echo "🔧 Firebaseプロジェクトを設定しています..."
firebase use $PROJECT_ID

# Firebase Hostingサイトの作成（既に存在する場合はスキップ）
echo "🌐 Hostingサイトを作成しています..."
firebase hosting:sites:create $SITE_NAME 2>/dev/null || echo "サイトは既に存在します"

# デプロイ
echo "🚀 デプロイを実行しています..."
firebase deploy --only hosting:$SITE_NAME

# デプロイ後の情報を表示
echo "
✅ デプロイが完了しました！

🌐 フロントエンドURL:
   https://$SITE_NAME.web.app
   https://$SITE_NAME.firebaseapp.com

📊 コスト見積もり（月額）:
   - ホスティング: 無料（10GB/月まで）
   - 転送量: 無料（10GB/月まで）
   - 予想コスト: $0/月

🔧 次のステップ:
   1. バックエンドのCORS設定を更新
   2. 環境変数でバックエンドURLを設定
"

# 環境変数ファイルを更新
echo "📝 環境変数を更新しています..."
cat > frontend/.env.production << EOF
VITE_API_URL=https://salon-backend-29707400517.asia-northeast1.run.app
VITE_APP_NAME=美容室統合管理システム
EOF

echo "🎉 Firebase Hostingへのデプロイが完了しました！"