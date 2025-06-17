# 📁 Frontend Dockerfile (Finalized)

# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

# ワーキングディレクトリ設定
WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# ===== Stage 2: Production (nginx) =====
FROM nginx:alpine AS production

# ビルド結果を nginx 配置先にコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx設定ファイルのコピー
COPY nginx.conf /etc/nginx/nginx.conf

# ポート開放
EXPOSE 80

# Healthcheck 設定
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# nginx 起動
CMD ["nginx", "-g", "daemon off;"]