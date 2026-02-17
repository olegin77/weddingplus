#!/bin/bash
# SSL Certificate Setup Script using Let's Encrypt
# Run this after deploying the application

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔒 SSL Certificate Setup"
echo "========================"

# Check if domain name is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Please provide domain name${NC}"
    echo "Usage: ./ssl-setup.sh yourdomain.com your@email.com"
    exit 1
fi

if [ -z "$2" ]; then
    echo -e "${RED}❌ Please provide email address${NC}"
    echo "Usage: ./ssl-setup.sh yourdomain.com your@email.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo -e "${YELLOW}📧 Setting up SSL for: $DOMAIN${NC}"
echo -e "${YELLOW}📧 Email: $EMAIL${NC}"

# Stop nginx to free port 80
echo -e "${YELLOW}🔄 Stopping nginx...${NC}"
docker-compose -f docker-compose.production.yml stop nginx

# Obtain certificate
echo -e "${YELLOW}📜 Obtaining SSL certificate...${NC}"
docker-compose -f docker-compose.production.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Update nginx configuration with domain name
echo -e "${YELLOW}⚙️  Updating nginx configuration...${NC}"
sed -i "s/\${DOMAIN_NAME}/$DOMAIN/g" nginx/nginx.conf

# Start nginx
echo -e "${YELLOW}🚀 Starting nginx...${NC}"
docker-compose -f docker-compose.production.yml up -d nginx

echo ""
echo -e "${GREEN}✅ SSL certificate setup complete!${NC}"
echo ""
echo "Your site should now be accessible at: https://$DOMAIN"
echo "Certificates will auto-renew every 12 hours"
