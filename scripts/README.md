# District Mapping Analysis Scripts

## Purpose

These scripts analyze and fix the district name mismatch between:
- **Government API** (data.gov.in) - 737 districts
- **GeoJSON file** (india-districts.geojson) - 759 districts

## Scripts

### 1. `analyze-district-mapping.js`
**Analyzes all districts and finds mismatches**

**What it does:**
- Fetches ALL districts directly from government API
- Loads ALL districts from GeoJSON
- Compares using multiple matching strategies
- Generates comprehensive reports

**Output:** 8 JSON files in `../analysis-output/`

### 2. `generate-perfect-mapping.js`
**Creates production-ready mapping file**

**What it does:**
- Takes analysis results
- Applies manual fixes for special cases
- Generates perfect mapping file
- Validates coverage

**Output:** `../frontend/src/data/perfect-district-mapping.json`

## Usage

```bash
# Install dependencies
cd scripts
npm install

# Step 1: Run analysis
node analyze-district-mapping.js

# Step 2: Review output files in ../analysis-output/

# Step 3: Generate perfect mapping
node generate-perfect-mapping.js

# Step 4: Check the generated mapping file
cat ../frontend/src/data/perfect-district-mapping.json
```

## Output Files

### Analysis Output (`../analysis-output/`)
1. `api-districts.json` - All API districts
2. `geojson-districts.json` - All GeoJSON districts
3. `perfect-mapping.json` - Exact matches
4. `fuzzy-mapping.json` - Close matches
5. `unmatched-api.json` - API districts with no match
6. `unmatched-geojson.json` - GeoJSON districts with no match
7. `state-statistics.json` - Match rate per state
8. `complete-mapping.json` - Combined mapping

### Final Output
- `../frontend/src/data/perfect-district-mapping.json` - Production mapping

## Expected Results

- **Coverage**: 95%+ of API districts mapped
- **Special Cases**: Sikkim, duplicate names handled
- **Confidence**: Every mapping verified

## Time Required

- Analysis: ~5-10 minutes (API fetching)
- Review: ~30 minutes (manual)
- Generation: ~1 minute
- **Total: ~40 minutes**
