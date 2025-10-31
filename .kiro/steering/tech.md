---
inclusion: always
---

# Technology Stack

## Architecture

Three-tier microservices architecture with Docker Compose orchestration:
- **Frontend**: React SPA (port 3000)
- **Backend**: Express.js REST API (port 3001)
- **ETL**: Node.js data pipeline with cron scheduler
- **Database**: PostgreSQL 14 (port 5432)

## Frontend Stack

- **Framework**: React 18.2 with React Router 6
- **Mapping**: MapLibre GL 4.7 (open-source alternative to Mapbox)
- **Data Viz**: D3.js (scales, colors, interpolation)
- **Geospatial**: Turf.js, TopoJSON
- **Build**: Create React App (react-scripts 5.0)
- **Animation**: Framer Motion 12

## Backend Stack

- **Runtime**: Node.js with Express 4.18
- **Database**: PostgreSQL with pg driver 8.11
- **Middleware**: CORS, compression, express-rate-limit
- **Testing**: Jest 29

## ETL Pipeline

- **Scheduler**: node-cron for automated data fetching
- **HTTP Client**: Axios for API calls
- **Database**: PostgreSQL connection pooling

## Development Tools

- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose v3.8
- **Environment**: dotenv for configuration
- **Dev Server**: nodemon for hot reload

## Common Commands

### Development
```bash
# Start all services
docker-compose up

# Start individual services
cd frontend && npm start
cd backend && npm run dev
cd etl && npm start

# Run tests
npm test                    # Frontend tests
cd backend && npm test      # Backend tests
```

### Database
```bash
# Connect to PostgreSQL
docker exec -it mgnrega-db psql -U postgres -d mgnrega

# Run migrations
docker exec -it mgnrega-db psql -U postgres -d mgnrega -f /docker-entrypoint-initdb.d/init.sql
```

### ETL Operations
```bash
# Manual data fetch
cd etl && node index.js

# Update district mappings
node etl/update-district-states.js

# Cleanup duplicates
node etl/cleanup-duplicates-v2.js
```

### Build & Deploy
```bash
# Production build
cd frontend && npm run build

# Analyze bundle size
cd frontend && npm run build:analyze

# Docker production build
docker-compose -f docker-compose.yml up --build
```

## Environment Variables

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API endpoint

### Backend (.env)
- `PORT`: Server port (default: 3001)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: PostgreSQL config
- `CORS_ORIGIN`: Allowed CORS origins

### ETL (.env)
- `GOV_API_ENDPOINT`: Government API URL
- `GOV_API_KEY`: API authentication key
- `CRON_MODE`: Enable/disable scheduled runs
- Database connection variables (same as backend)

## Performance Considerations

- **Rate Limiting**: 100 requests/minute per IP on backend
- **Compression**: Gzip enabled for responses >1KB
- **Caching**: 24-hour cache recommended for API data
- **Bundle Size**: Code splitting with React.lazy for large components
- **Map Performance**: Feature-state for hover effects, generateId for efficient updates
