#!/bin/bash

# MGNREGA Report Card - Automated VM Setup Script
# This script sets up everything needed on a fresh GCP VM

set -e

echo "🚀 MGNREGA Report Card - Automated Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please don't run as root. Run as regular user.${NC}"
    exit 1
fi

# Step 1: Install Docker
echo -e "${BLUE}📦 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose git curl wget
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Step 2: Get VM External IP
echo -e "${BLUE}🌐 Getting VM external IP...${NC}"
EXTERNAL_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}✓ External IP: $EXTERNAL_IP${NC}"

# Step 3: Clone Repository (if not already cloned)
if [ ! -d "mgnrega-report-card" ]; then
    echo -e "${BLUE}📥 Cloning repository...${NC}"
    read -p "Enter your repository URL: " REPO_URL
    git clone $REPO_URL mgnrega-report-card
    cd mgnrega-report-card
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    echo -e "${GREEN}✓ Repository already exists${NC}"
    cd mgnrega-report-card
fi

# Step 4: Create .env file
echo -e "${BLUE}⚙️  Creating environment configuration...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Generate secure password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Update .env file
    sed -i "s/CHANGE_THIS_SECURE_PASSWORD/$DB_PASSWORD/" .env
    sed -i "s|http://YOUR_VM_IP:3001/api|http://$EXTERNAL_IP:3001/api|" .env
    
    echo -e "${GREEN}✓ Environment file created${NC}"
    echo -e "${YELLOW}⚠️  Database password: $DB_PASSWORD${NC}"
    echo -e "${YELLOW}⚠️  Save this password securely!${NC}"
else
    echo -e "${GREEN}✓ Environment file already exists${NC}"
fi

# Step 5: Make scripts executable
echo -e "${BLUE}🔧 Setting up scripts...${NC}"
chmod +x deploy.sh healthcheck.sh
echo -e "${GREEN}✓ Scripts ready${NC}"

# Step 6: Deploy application
echo -e "${BLUE}🚀 Deploying application...${NC}"
echo "This may take 5-10 minutes..."
./deploy.sh

# Step 7: Display firewall command
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Open firewall ports${NC}"
echo "Run this command on your LOCAL machine (not on VM):"
echo ""
echo -e "${BLUE}gcloud compute firewall-rules create allow-mgnrega \\"
echo "  --allow tcp:80,tcp:3001 \\"
echo "  --source-ranges 0.0.0.0/0 \\"
echo -e "  --description=\"Allow MGNREGA app traffic\"${NC}"
echo ""

# Step 8: Final instructions
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📍 Your application is running at:"
echo "   Frontend: http://$EXTERNAL_IP:80"
echo "   Backend:  http://$EXTERNAL_IP:3001"
echo ""
echo "📊 Useful commands:"
echo "   Check status:  ./healthcheck.sh"
echo "   View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "   Restart:       docker-compose -f docker-compose.prod.yml restart"
echo "   Stop:          docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🔐 Your database password is saved in .env file"
echo ""
echo "⚠️  Don't forget to open firewall ports (see command above)"
echo ""
echo "🎉 Happy deploying!"
