# 🐳 美容室統合管理システム - 本番用Dockerfile (Finalized)

# ===== Stage 1: Base image =====
FROM node:18-alpine AS base
LABEL maintainer="Team C - QA & Deploy <qa@salon-system.com>"
LABEL description="美容室統合管理システム - 本番環境用"

RUN addgroup -g 1001 -S salon && \
    adduser -S salon -u 1001 -G salon

WORKDIR /app

RUN apk add --no-cache \
    dumb-init \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

ENV TZ=Asia/Tokyo

# ===== Stage 2: Backend builder =====
FROM base AS backend-builder

COPY backend/ ./backend/

RUN cd backend && \
    npm ci && \
    npm run build && \
    npx prisma generate && \
    rm -rf node_modules && \
    npm ci --omit=dev --silent

# ===== Stage 3: Frontend builder =====
FROM base AS frontend-builder

COPY frontend/ ./frontend/

RUN cd frontend && \
    npm ci && \
    npm run build && \
    npm cache clean --force

# ===== Stage 4: Production runtime =====
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S salon && \
    adduser -S salon -u 1001 -G salon

RUN apk add --no-cache \
    dumb-init \
    tzdata \
    curl \
    nginx \
    supervisor \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Backend
COPY --from=backend-builder --chown=salon:salon /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=salon:salon /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=salon:salon /app/backend/prisma ./backend/prisma
COPY --from=backend-builder --chown=salon:salon /app/backend/package.json ./backend/

# Frontend
COPY --from=frontend-builder --chown=salon:salon /app/frontend/dist ./frontend/dist

# Nginx & Supervisor
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Healthcheck
COPY docker/healthcheck.js /app/healthcheck.js
RUN chmod +x /app/healthcheck.js

ENV NODE_ENV=production
ENV PORT=4002
ENV FRONTEND_PORT=80

EXPOSE 80 4002

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node /app/healthcheck.js

RUN chown -R salon:salon /app
USER salon

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

LABEL version="1.0.0"
LABEL release="production"
LABEL org.opencontainers.image.title="美容室統合管理システム"
LABEL org.opencontainers.image.description="AI搭載の次世代美容室管理システム"
LABEL org.opencontainers.image.vendor="Salon System Team"
LABEL org.opencontainers.image.licenses="MIT"
