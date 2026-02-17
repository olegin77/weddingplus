#!/bin/bash
# Weddinguz Deployment Script
# Deploys the application to production server

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/weddinguz"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"

echo "🚀 Weddinguz Deployment"
echo "======================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo "Please create .env.production with your production configuration"
    exit 1
fi

echo -e "${YELLOW}📦 Pulling latest changes...${NC}"
git pull origin main

echo -e "${YELLOW}🔑 Generating JWT secret if needed...${NC}"
if ! grep -q "JWT_SECRET=" .env.production; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "JWT_SECRET=$JWT_SECRET" >> .env.production
    echo -e "${GREEN}✅ JWT secret generated${NC}"
fi

echo -e "${YELLOW}🔑 Generating API keys if needed...${NC}"
if ! grep -q "ANON_KEY=" .env.production; then
    # Generate anon key (you should generate proper JWT tokens)
    ANON_KEY=$(openssl rand -hex 32)
    echo "ANON_KEY=$ANON_KEY" >> .env.production
    echo -e "${GREEN}✅ Anon key generated${NC}"
fi

if ! grep -q "SERVICE_ROLE_KEY=" .env.production; then
    # Generate service role key
    SERVICE_ROLE_KEY=$(openssl rand -hex 32)
    echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY" >> .env.production
    echo -e "${GREEN}✅ Service role key generated${NC}"
fi

echo -e "${YELLOW}📥 Pulling Docker images...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE pull

echo -e "${YELLOW}🏗️  Building application...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache frontend

echo -e "${YELLOW}🔄 Stopping old containers...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE down

echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE up -d

echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check if services are running
if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"

    echo ""
    echo "Services status:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps

    echo ""
    echo "Logs command:"
    echo "  docker-compose -f $DOCKER_COMPOSE_FILE logs -f"

else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Check logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs"
    exit 1
fi

# Cleanup old images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
