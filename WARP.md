# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) Report Card system that tracks rural employment data across Indian districts. The system consists of three main services: a React frontend for data visualization, a Node.js/Express API backend, and an ETL service that fetches data from the government's data.gov.in API.

## Architecture

### Multi-Service Docker Architecture
- **Frontend**: React 18 with React Router, Leaflet maps, and Tailwind CSS (port 3000)
- **Backend**: Node.js/Express API with PostgreSQL connection pooling (port 3001) 
- **Database**: PostgreSQL 14 with structured schema for districts and performance data (port 5432)
- **ETL Service**: Node.js service for data ingestion from data.gov.in API (runs on-demand)

All services are containerized and orchestrated via Docker Compose with health checks and dependency management.

### Database Schema
- `districts` table: Stores district metadata with SERIAL primary keys
- `monthly_performance` table: Stores MGNREGA performance metrics with composite unique constraints
- Separate database users: `api_user` (read-only) and `etl_user` (read-write)

### API Architecture
- REST endpoints with comprehensive error handling and rate limiting (100 req/min)
- In-memory caching for district lists (24-hour TTL)
- PostgreSQL connection pooling with automatic retry logic
- CORS and compression middleware for production readiness

## Development Commands

### Docker Environment
```bash
# Start all services
docker-compose up -d

# Start services with ETL 
docker-compose --profile etl up -d

# Run ETL service once
docker-compose --profile etl run --rm etl

# View logs
docker-compose logs -f [service-name]

# Rebuild services
docker-compose build [service-name]
```

### Backend (Node.js/Express)
```bash
# Development
cd backend
npm run dev

# Production
npm start

# Run tests
npm test

# Test database connection
npm start  # Server tests DB connection on startup
```

### Frontend (React)
```bash
# Development server
cd frontend
npm start

# Build for production
npm run build

# Run tests (non-watch mode)
npm test

# Bundle analysis
npm run build:analyze
```

### ETL Service
```bash
# Run data pipeline
cd etl
npm start

# Test only
npm test
```

## Environment Configuration

The system requires these environment variables:

**Backend (.env)**:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `NODE_ENV`, `PORT`, `CORS_ORIGIN`
- Optional: `DB_POOL_MAX`, `DB_IDLE_TIMEOUT`, `DB_CONNECTION_TIMEOUT`

**ETL (.env)**:
- `GOV_API_ENDPOINT`, `GOV_API_KEY` (data.gov.in credentials)
- Database connection variables (same as backend)
- Optional: `STATE_FILTER`, `API_TIMEOUT`, `API_MAX_RETRIES`

**Frontend**:
- `REACT_APP_API_URL` (defaults to http://localhost:3001/api in docker-compose)

## Testing

### Backend Testing
- Jest configuration for Node.js environment
- Test files in `__tests__` directories or `*.test.js`/`*.spec.js` patterns
- Coverage collection excludes node_modules and jest config

### Frontend Testing
- React Testing Library with Jest DOM matchers
- Integration tests for components and pages
- Visual testing capabilities for UI components
- Test files follow React testing conventions

## Key Development Patterns

### Error Handling
- Comprehensive error handling with typed error responses
- Database connection retry logic with exponential backoff
- Global error handlers in Express with environment-aware error details
- Rate limiting with structured error responses

### Data Flow
1. **ETL Process**: Fetches from data.gov.in → Transforms/validates → Loads to PostgreSQL
2. **API Layer**: Express routes with caching → PostgreSQL queries → JSON responses  
3. **Frontend**: React context for state → API calls via Axios → Leaflet map visualization

### Performance Optimizations
- Connection pooling for PostgreSQL with configurable limits
- Response compression and CORS optimization
- Client and server-side caching strategies
- Database indexing on frequently queried columns

## Code Quality and Standards

The codebase follows modern JavaScript/React patterns:
- ES6+ syntax with proper error handling
- React Hooks and Context API for state management
- Express middleware pattern with proper separation of concerns
- Comprehensive logging with timestamps and structured output
- Docker best practices with multi-stage builds and health checks