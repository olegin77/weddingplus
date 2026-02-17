#!/bin/bash
# Weddinguz Production Setup Script for DigitalOcean
# This script sets up the production environment on a fresh Ubuntu server

set -e

echo "🚀 Weddinguz Production Setup"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

echo -e "${YELLOW}📦 Installing system dependencies...${NC}"
apt-get update
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

echo -e "${GREEN}✅ System dependencies installed${NC}"

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d '"' -f 4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo -e "${GREEN}✅ Firewall configured${NC}"

# Create application user
echo -e "${YELLOW}👤 Creating application user...${NC}"
if ! id -u weddinguz &>/dev/null; then
    useradd -m -s /bin/bash weddinguz
    usermod -aG docker weddinguz
    echo -e "${GREEN}✅ User 'weddinguz' created${NC}"
else
    echo -e "${GREEN}✅ User 'weddinguz' already exists${NC}"
fi

# Create application directories
echo -e "${YELLOW}📁 Creating application directories...${NC}"
mkdir -p /opt/weddinguz/{logs,backups,uploads}
chown -R weddinguz:weddinguz /opt/weddinguz
echo -e "${GREEN}✅ Directories created${NC}"

# Setup log rotation
echo -e "${YELLOW}📝 Setting up log rotation...${NC}"
cat > /etc/logrotate.d/weddinguz << EOF
/opt/weddinguz/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 weddinguz weddinguz
    sharedscripts
}
EOF
echo -e "${GREEN}✅ Log rotation configured${NC}"

# Setup automatic backups
echo -e "${YELLOW}💾 Setting up automatic backups...${NC}"
cat > /opt/weddinguz/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/weddinguz/backups
DATE=$(date +%Y%m%d_%H%M%S)
docker exec weddinguz-prod-db pg_dump -U weddinguz_admin weddinguz_prod > $BACKUP_DIR/db_backup_$DATE.sql
gzip $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
EOF
chmod +x /opt/weddinguz/backup.sh
chown weddinguz:weddinguz /opt/weddinguz/backup.sh

# Add cron job for daily backups at 2 AM
(crontab -u weddinguz -l 2>/dev/null; echo "0 2 * * * /opt/weddinguz/backup.sh") | crontab -u weddinguz -
echo -e "${GREEN}✅ Automatic backups configured${NC}"

# Install monitoring tools
echo -e "${YELLOW}📊 Installing monitoring tools...${NC}"
apt-get install -y htop iotop nethogs
echo -e "${GREEN}✅ Monitoring tools installed${NC}"

echo ""
echo -e "${GREEN}✅ Server setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/weddinguz"
echo "2. Create .env.production file with your configuration"
echo "3. Run: cd /opt/weddinguz && sudo -u weddinguz docker-compose -f docker-compose.production.yml up -d"
echo ""
