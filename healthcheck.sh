#!/bin/bash

# Health Check Script for MGNREGA Report Card
# Usage: ./healthcheck.sh

echo "🏥 MGNREGA Report Card - Health Check"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if containers are running
echo "📦 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "💾 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "🔍 Service Health Checks:"

# Check PostgreSQL
if docker exec mgnrega-db pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL: Healthy${NC}"
else
    echo -e "${RED}✗ PostgreSQL: Unhealthy${NC}"
fi

# Check Backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API: Healthy${NC}"
else
    echo -e "${RED}✗ Backend API: Unhealthy${NC}"
fi

# Check Frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend: Healthy${NC}"
else
    echo -e "${RED}✗ Frontend: Unhealthy${NC}"
fi

# Check ETL
if docker ps | grep mgnrega-etl | grep -q "Up"; then
    echo -e "${GREEN}✓ ETL Service: Running${NC}"
else
    echo -e "${RED}✗ ETL Service: Not Running${NC}"
fi

echo ""
echo "📊 Database Status:"
docker exec mgnrega-db psql -U postgres -d mgnrega -c "SELECT COUNT(*) as total_records FROM mgnrega_data;" 2>/dev/null || echo "Unable to query database"

echo ""
echo "📝 Recent Errors (last 50 lines):"
docker-compose -f docker-compose.prod.yml logs --tail=50 | grep -i error || echo "No errors found"

echo ""
echo "✅ Health check complete!"
