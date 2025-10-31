
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

```python
import geopandas as gpd
import requests

# Download GADM data
url = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_3.json"
gdf = gpd.read_file(url)

# Filter for specific district
district = gdf[gdf['NAME_3'] == 'Malerkotla']

# Export
district.to_file('malerkotla.geojson', driver='GeoJSON')
```

## What I Need

For each district, provide a GeoJSON file with:
- 100-500 coordinate points
- Actual administrative boundary (not rectangle)
- Proper format as specified in the task document
