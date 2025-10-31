/**
 * Download Accurate District Boundaries
 * 
 * Try multiple sources to get accurate GeoJSON boundaries
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('═'.repeat(80));
console.log('SEARCHING FOR ACCURATE DISTRICT BOUNDARIES');
console.log('═'.repeat(80));
console.log('');

const districts = [
  { name: 'Malerkotla', state: 'Punjab', osmId: null },
  { name: 'Vijayanagara', state: 'Karnataka', osmId: null },
  { name: 'Ranipet', state: 'Tamil Nadu', osmId: null },
  { name: 'Bajali', state: 'Assam', osmId: null },
  { name: 'Tamulpur', state: 'Assam', osmId: null },
  { name: 'Hanumakonda', state: 'Telangana', osmId: null },
  { name: 'Pakyong', state: 'Sikkim', osmId: null },
  { name: 'Soreng', state: 'Sikkim', osmId: null },
  { name: 'Mayiladuthurai', state: 'Tamil Nadu', osmId: null },
  { name: 'Rae Bareli', state: 'Uttar Pradesh', osmId: null }
];

console.log('🔍 STRATEGY 1: Check DataMeet GitHub Repository');
console.log('   URL: https://github.com/datameet/maps');
console.log('   Status: Manual check required');
console.log('   Action: Visit the repo and download state GeoJSON files');
console.log('');

console.log('🔍 STRATEGY 2: OpenStreetMap Overpass API');
console.log('   Can query for administrative boundaries');
console.log('   Requires relation IDs for each district');
console.log('');

console.log('🔍 STRATEGY 3: GADM Database');
console.log('   URL: https://gadm.org/download_country.html');
console.log('   Has India administrative boundaries');
console.log('   May not have newest districts (post-2019)');
console.log('');

console.log('🔍 STRATEGY 4: Natural Earth Data');
console.log('   URL: https://www.naturalearthdata.com/');
console.log('   Has administrative boundaries');
console.log('   May be outdated for new districts');
console.log('');

console.log('═'.repeat(80));
console.log('RECOMMENDED APPROACH');
console.log('═'.repeat(80));
console.log('');

console.log('📋 STEP 1: DataMeet (Best Source)');
console.log('   1. Visit: https://github.com/datameet/maps');
console.log('   2. Look for: india-districts.geojson or state-wise files');
console.log('   3. Download the latest version');
console.log('   4. Check if it has post-2019 districts');
console.log('');

console.log('📋 STEP 2: If DataMeet doesn\'t have new districts:');
console.log('   Use OpenStreetMap Overpass API');
console.log('   Example query for a district:');
console.log('   https://overpass-api.de/api/interpreter?data=[out:json];');
console.log('   relation["name"="Malerkotla"]["admin_level"="5"];out geom;');
console.log('');

console.log('📋 STEP 3: Automated Download Script');
console.log('   I can create a script to:');
console.log('   - Query OpenStreetMap for each district');
console.log('   - Download GeoJSON boundaries');
console.log('   - Convert to our format');
console.log('   - Validate coordinates');
console.log('');

console.log('═'.repeat(80));
console.log('NEXT STEPS');
console.log('═'.repeat(80));
console.log('');

console.log('Option A: Manual Download (Fastest if DataMeet has data)');
console.log('   1. Check DataMeet repository');
console.log('   2. Download india-districts.geojson');
console.log('   3. Extract the 16 districts we need');
console.log('   Time: 30 minutes');
console.log('');

console.log('Option B: OpenStreetMap API (Automated)');
console.log('   1. Find OSM relation IDs for each district');
console.log('   2. Query Overpass API');
console.log('   3. Download and convert GeoJSON');
console.log('   Time: 2-3 hours (need to find relation IDs)');
console.log('');

console.log('Option C: Use Python with GeoPandas (Most Reliable)');
console.log('   1. Install: pip install geopandas');
console.log('   2. Download GADM data');
console.log('   3. Filter and export districts');
console.log('   Time: 1 hour (if Python available)');
console.log('');

console.log('🎯 RECOMMENDATION:');
console.log('   Let me check DataMeet first - it\'s the best source');
console.log('   If that doesn\'t work, I\'ll try OpenStreetMap API');
console.log('');

// Create a guide for manual steps
const guide = `
# How to Get Accurate Boundaries

## Method 1: DataMeet (Recommended)

1. Visit: https://github.com/datameet/maps
2. Look for files like:
   - india-districts.geojson
   - punjab-districts.geojson
   - karnataka-districts.geojson
   etc.

3. Download the files
4. Open in text editor
5. Search for district names (e.g., "Malerkotla")
6. Copy the feature object
7. Save as individual files

## Method 2: OpenStreetMap

For each district:

1. Go to: https://www.openstreetmap.org/
2. Search: "{District Name} district, {State}"
3. Click on the boundary (purple line)
4. Note the relation ID (e.g., "relation/12345")
5. Use Overpass API:
   https://overpass-api.de/api/interpreter?data=[out:json];relation(12345);out geom;
6. Convert to GeoJSON format

## Method 3: Use QGIS (Desktop GIS Software)

1. Download QGIS: https://qgis.org/
2. Install GADM plugin or download GADM data
3. Load India administrative boundaries
4. Filter for districts
5. Export as GeoJSON

## Method 4: Python Script

\`\`\`python
import geopandas as gpd
import requests

# Download GADM data
url = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_3.json"
gdf = gpd.read_file(url)

# Filter for specific district
district = gdf[gdf['NAME_3'] == 'Malerkotla']

# Export
district.to_file('malerkotla.geojson', driver='GeoJSON')
\`\`\`

## What I Need

For each district, provide a GeoJSON file with:
- 100-500 coordinate points
- Actual administrative boundary (not rectangle)
- Proper format as specified in the task document
`;

fs.writeFileSync(
  path.join(__dirname, '..', 'HOW_TO_GET_ACCURATE_BOUNDARIES.md'),
  guide
);

console.log('💾 Created guide: HOW_TO_GET_ACCURATE_BOUNDARIES.md');
console.log('');
console.log('🚀 Ready to proceed with automated download?');
console.log('   I can try to fetch from OpenStreetMap API if you want.');
console.log('');
