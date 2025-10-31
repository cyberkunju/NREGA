---
inclusion: always
---

# Project Structure

## Root Organization

```
/
├── backend/          # Express.js REST API
├── frontend/         # React SPA
├── etl/             # Data pipeline service
├── scripts/         # Utility scripts for data processing
├── Enhancement/     # Feature documentation (Phase 1-5)
└── docker-compose.yml
```

## Backend (`/backend`)

```
backend/
├── db/
│   ├── connection.js      # PostgreSQL connection pool
│   └── init.sql          # Database schema
├── routes/
│   ├── districts.js      # GET /api/districts
│   ├── performance.js    # GET /api/performance/*
│   └── health.js         # GET /api/health
├── utils/               # Helper functions
├── server.js           # Express app entry point
└── package.json
```

**Key Patterns**:
- Route handlers in `/routes` directory
- Database connection pooling with graceful shutdown
- Middleware: CORS, compression, rate limiting, error handling
- Health check endpoint for monitoring

## Frontend (`/frontend`)

```
frontend/
├── public/
│   └── india-districts.geojson  # GeoJSON boundary data
├── src/
│   ├── components/
│   │   ├── IndiaDistrictMap/
│   │   │   ├── MapView.jsx          # Main map component
│   │   │   ├── MetricSelector.jsx   # Metric switcher UI
│   │   │   ├── Legend.jsx           # Color scale legend
│   │   │   ├── Tooltip.jsx          # Hover tooltip
│   │   │   ├── SearchBar.jsx        # District search
│   │   │   └── LoadingOverlay.jsx
│   │   └── DistrictDetail/          # Detail page components
│   ├── data/
│   │   └── perfect-district-mapping-v2.json  # District name mappings
│   ├── services/
│   │   └── api.js                   # API client (axios)
│   ├── utils/
│   │   ├── districtNameMapping.js   # Name normalization logic
│   │   └── districtMapping.js       # Legacy mapping utilities
│   ├── App.js                       # Router setup
│   └── index.js                     # React entry point
└── package.json
```

**Key Patterns**:
- Component-based architecture with feature folders
- MapLibre GL for map rendering (not Mapbox)
- District name normalization for API-GeoJSON matching
- React Router for navigation
- Axios for API calls with error handling

## ETL (`/etl`)

```
etl/
├── data-fetcher.js              # Fetch from government API
├── data-transformer.js          # Transform API data
├── data-loader.js              # Load into PostgreSQL
├── district-name-normalizer.js # Name standardization
├── district-state-mapping.js   # State-district relationships
├── cleanup-*.js                # Data cleanup utilities
├── index.js                    # Main ETL orchestrator
└── package.json
```

**Key Patterns**:
- Modular ETL pipeline: fetch → transform → load
- Cron-based scheduling for automated updates
- District name normalization to handle variations
- Duplicate detection and cleanup

## Scripts (`/scripts`)

```
scripts/
├── phase1-ground-truth.js       # Extract canonical district names
├── phase2-intelligent-matching.js # Match API to GeoJSON districts
├── phase3-auto-finalize.js      # Generate final mapping
├── analyze-district-mapping.js  # Mapping quality analysis
├── deep-check-districts.js      # Validation utilities
└── README.md
```

**Purpose**: One-time data processing and mapping generation scripts. Not part of runtime application.

## Data Files

- `district-state-mapping.json`: State-district relationships
- `geojson-districts.json`: District boundary geometries
- `perfect-district-mapping-v2.json`: Canonical API↔GeoJSON mappings (94.29% coverage)
- `all-districts-statewise.txt`: Reference list of all districts

## Documentation

- `API_DOCUMENTATION.md`: Complete government API reference
- `DEPLOYMENT_READY.md`: Production deployment guide
- `Enhancement/Phase*.md`: Feature development phases
- `TESTING_GUIDE.md`: Testing procedures
- `QUICK_REFERENCE.md`: Developer quick start

## Naming Conventions

- **Components**: PascalCase (e.g., `MapView.jsx`)
- **Utilities**: camelCase (e.g., `districtNameMapping.js`)
- **Routes**: kebab-case URLs (e.g., `/api/districts`)
- **Database**: snake_case (e.g., `district_name`)
- **API fields**: camelCase in responses (e.g., `paymentPercentage`)

## Critical Files

- `frontend/src/data/perfect-district-mapping-v2.json`: **DO NOT MODIFY** without regenerating via scripts
- `backend/db/init.sql`: Database schema - changes require migration
- `docker-compose.yml`: Service orchestration - affects all environments
- `.env` files: **NEVER COMMIT** - contain secrets

## Testing Structure

- Frontend: `*.test.js` alongside components
- Backend: `*.test.js` in `/backend` root
- ETL: `data-loader.test.js` for pipeline validation
- Use Jest for all testing
