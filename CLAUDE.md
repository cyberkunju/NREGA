# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **NREGA** - a full-stack web application for visualizing and analyzing MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) data across Indian districts. It's a data visualization platform with interactive maps, district-wise filtering, and automated data pipelines.

**Architecture**: 3-tier microservices with ETL pipeline
- **Frontend**: React.js web application (port 3000)
- **Backend**: Express.js REST API (port 3001)
- **ETL Service**: Scheduled data pipeline
- **Database**: PostgreSQL (port 5432)

All services are containerized and can be run via Docker Compose.

## Common Commands

### Development

```bash
# Start all services with Docker
docker-compose up

# Start individual services (development mode)
cd frontend && npm start              # React app on port 3000
cd backend && npm run dev              # Express API on port 3001 (with nodemon)
cd etl && npm start                    # Run ETL pipeline

# Run all services in background
docker-compose up -d
```

### Building

```bash
# Frontend production build
cd frontend && npm run build

# Analyze bundle size
cd frontend && npm run build:analyze
```

### Testing

```bash
# Run all tests (from project root)
cd frontend && npm test                # React Testing Library
cd backend && npm test                 # Jest
cd etl && npm test                     # Jest

# Watch mode (development)
cd frontend && npm test -- --watchAll=true
```

### Database

```bash
# Connect to PostgreSQL (Docker)
docker-compose exec postgres psql -U postgres -d nrega

# View database logs
docker-compose logs postgres
```

### ETL Pipeline

```bash
# Run ETL manually
cd etl && npm start

# View ETL logs
docker-compose logs etl
```

## Code Architecture

### Frontend (React)

**Location**: `/frontend/src/`

**Key Structure**:
- `components/` - Reusable UI components
  - `DistrictSelector/` - District dropdown selection
  - `IndiaDistrictMap/` - Interactive map using MapLibre GL
  - `Layout/` - App layout wrapper
  - `ReportCard/` - Data display cards
- `pages/` - Route pages (DistrictSelector, NotFound)
- `context/` - React context providers
- `services/` - API service layer (Axios HTTP client)
- `utils/` - Helper functions
- `data/` - Static data files

**Technology Stack**:
- React 18 with Create React App
- MapLibre GL & Mapbox GL for map visualization
- D3.js for data visualization (scales, colors, interpolation)
- TopoJSON Client for geographic data
- Turf.js for geospatial analysis
- Framer Motion for animations
- React Router DOM for routing

**Important Notes**:
- Uses OpenStreetMap tiles (free, no API key required)
- Map visualization with MapLibre GL (no vendor lock-in)
- District-based filtering and time-series data display

### Backend (Express.js API)

**Location**: `/backend/`

**Key Structure**:
- `routes/` - API endpoint handlers
  - `districts.js` - District data endpoints
  - `performance.js` - Performance metrics endpoints
  - `health.js` - Health check endpoints
- `db/connection.js` - PostgreSQL connection pool
- `utils/dataCleaner.js` - Data cleaning utilities
- `server.js` - Express server entry point

**API Endpoints**:
- `GET /api/districts` - List all districts
- `GET /api/performance/:district` - Get performance data for a district
- `GET /api/health` - Health check

**Database Schema**:
```sql
districts:
  - id, name, state, created_at

monthly_performance:
  - id, district_name, month, fin_year
  - total_households_worked, avg_days_employment_per_hh
  - payment_percentage_15_days, last_updated
```

**Security Features**:
- CORS enabled
- Rate limiting
- Compression middleware
- Environment-based configuration

### ETL Service

**Location**: `/etl/`

**Key Files**:
- `data-fetcher.js` - Government API client with retry logic
- `data-transformer.js` - Data transformation logic
- `data-loader.js` - PostgreSQL loader with upserts
- `district-name-normalizer.js` - Name standardization
- `district-state-mapping.js` - District-state relationships
- `index.js` - Main ETL orchestrator

**Data Source**:
- Government API: `https://api.data.gov.in/resource/ee03643a-ee4c-48ac30-9f2ff26ab722`
- Dataset: District-wise MGNREGA Data at a Glance
- Records: 339,280+ records across 36 fields
- Scheduled with Node-cron for automatic updates

**Key Features**:
- Retry logic for API failures
- Data cleaning and normalization
- District name standardization
- PostgreSQL upserts to prevent duplicates
- Comprehensive logging

### Database

**Technology**: PostgreSQL 14 (Alpine)

**Access**:
- Host: localhost (when using Docker)
- Port: 5432
- Database: nrega
- Users: api_user (read-only), etl_user (read-write)

## Configuration

### Environment Variables

Required in `.env` files for each service:

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql://user:password@postgres:5432/nrega
PORT=3001
```

**ETL** (`etl/.env`):
```
DATABASE_URL=postgresql://etl_user:password@postgres:5432/nrega
API_KEY=your_data_gov_in_api_key
```

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:3001
```

### Docker Configuration

**docker-compose.yml** defines 4 services:
1. `postgres:14-alpine` - Database on port 5432
2. `backend` - API server on port 3001
3. `frontend` - React app on port 3000
4. `etl` - Scheduled data pipeline

## Testing

**Testing Stack**:
- **Frontend**: Jest + React Testing Library + jest-dom + user-event
- **Backend**: Jest with Node test environment
- **ETL**: Jest

**Test Files**:
- `backend/utils/dataCleaner.test.js`
- `etl/data-loader.test.js`

**Configuration**:
- Coverage thresholds configured
- Ignores `node_modules` and `coverage` directories
- Test patterns: `**/__tests__/**/*.js`, `**/?(*.)+(spec|test).js`

## Linting

**Frontend**: ESLint with Create React App defaults (`extends: ["react-app"]`)
**Backend**: No explicit ESLint configuration (uses Node defaults)

**No Prettier configuration** - code formatting is not strictly enforced.

## Documentation

The project includes extensive documentation in `/Enhancement/` directory with:
- API documentation (complete field reference)
- Bug reports and fixes
- Enhancement phases (5 phases documented)
- Testing guides
- Implementation status

## Development Workflow

1. **Start services**: Use `docker-compose up` for full stack
2. **Frontend development**: `cd frontend && npm start` (hot reload enabled)
3. **Backend development**: `cd backend && npm run dev` (nodemon for auto-restart)
4. **Test changes**: Run `npm test` in each service directory
5. **Production build**: `cd frontend && npm run build`

## Key Technologies

- **Frontend**: React 18, MapLibre GL, D3.js, Turf.js, Framer Motion
- **Backend**: Express.js, PostgreSQL, Node-cron
- **ETL**: Axios, PostgreSQL, cron scheduling
- **Infrastructure**: Docker, Docker Compose
- **Database**: PostgreSQL 14
- **Testing**: Jest, React Testing Library
- **Maps**: MapLibre GL + OpenStreetMap (no API key required)

## Important Implementation Details

1. **Map Visualization**: Uses MapLibre GL with OpenStreetMap tiles (free alternative to Mapbox)
2. **Data Updates**: Automated ETL runs on schedule to fetch latest government data
3. **District Normalization**: ETL includes logic to handle inconsistent district names across data sources
4. **Performance Optimization**: Frontend uses React best practices with D3.js for efficient data visualization
5. **Database Access**: Split users (api_user for reads, etl_user for writes) for security
6. **No TypeScript**: Project uses plain JavaScript throughout
7. **No Prettier**: Code formatting relies on developer discretion and ESLint rules