#!/bin/bash

# Salon Management System - Deployment Script
# This script handles production deployment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment setup
ENVIRONMENT=${1:-production}
PROJECT_NAME="salon-management-system"

echo -e "${BLUE}🚀 Starting deployment for ${PROJECT_NAME} - ${ENVIRONMENT}${NC}"

# Check if .env file exists
if [ ! -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${RED}❌ Environment file .env.${ENVIRONMENT} not found${NC}"
    echo -e "${YELLOW}Please create .env.${ENVIRONMENT} with required environment variables${NC}"
    exit 1
fi

# Load environment variables
source ".env.${ENVIRONMENT}"

# Verify required environment variables
required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable ${var} is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment validation passed${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml down

# Pull latest changes (if in production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    git pull origin main
fi

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml up -d --build

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check database
if docker-compose exec -T postgres pg_isready -U salon_user -d salon_management > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
else
    echo -e "${RED}❌ Database health check failed${NC}"
    exit 1
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis health check failed${NC}"
    exit 1
fi

# Check backend API
if curl -f http://localhost:4002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is healthy${NC}"
else
    echo -e "${RED}❌ Backend API health check failed${NC}"
    exit 1
fi

# Check frontend
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

# Run database migrations (if needed)
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker-compose exec -T backend npx prisma migrate deploy

# Show deployment summary
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Services running:${NC}"
echo -e "  • Frontend: http://localhost"
echo -e "  • Backend API: http://localhost:4002"
echo -e "  • Health Check: http://localhost:4002/health"

if [ "$ENVIRONMENT" = "development" ]; then
    echo -e "  • pgAdmin: http://localhost:8080 (admin@salon.com / admin)"
fi

echo -e "${BLUE}Docker containers status:${NC}"
docker-compose ps

echo -e "${GREEN}✨ Salon Management System is now running in ${ENVIRONMENT} mode!${NC}"