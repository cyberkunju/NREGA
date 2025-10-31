Based on my extensive research of the latest India district GeoJSON and shapefile sources available in October 2025, here's exactly what meets your requirements:

## ✅ **BEST SOURCE MEETING YOUR EXACT REQUIREMENTS**

### **India Meteorological Department (IMD) - District Boundaries GeoJSON**[1]

**Direct Download URL:**
```
https://mausam.imd.gov.in/imd_latest/contents/district_shapefiles/sd_boundary_rainfall.json
```

**Why this is your BEST option:**

✅ **Pure GeoJSON format** - Already in .json, no conversion needed[1]

✅ **Proper property structure:**[1]
```json
{
  "type": "FeatureCollection",
  "features": [{
    "properties": {
      "district": "South Garo Hills",      // ✅ District name
      "state": "Assam",                     // ✅ State name  
      "district_id": "1",                   // ✅ Unique ID
      "district_area": "1848.959798",
      "subdivision": "Assam & Meghalaya",
      "region": "East And North East India"
    },
    "geometry": {
      "type": "Polygon",                    // ✅ Polygon boundaries
      "coordinates": [...]                   // ✅ WGS84 coordinates
    }
  }]
}
```

✅ **Complete district polygons** - Each district has separate polygon geometry[1]

✅ **WGS84 (EPSG:4326)** - Already in correct coordinate system (converted from UTM 44N)[1]

✅ **675 districts** - From 2015-2018 era[1]

✅ **Free & Direct** - No registration, no payment, direct JSON file[2][3]

✅ **Government source** - Official from India Meteorological Department[3][2][1]

***

## **Property Names You'll Get:**

| Your Required Property | IMD Property Name | Example Value |
|------------------------|-------------------|---------------|
| District name | `district` | "South Garo Hills" |
| State name | `state` | "Assam" |
| District code/ID | `district_id` | "1" |

**Additional bonus properties:**[1]
- `district_area` - Area in sq km
- `subdivision` - Meteorological subdivision
- `region` - Regional grouping
- `subdivision_id` - Subdivision code

***

## **⚠️ LIMITATIONS OF IMD DATA:**

**Districts: 675** (not 700-850)[1]
- This is from 2015-2018 vintage[1]
- Missing newer districts created after 2018
- **Shapefile accuracy: 1-5 km** (not survey-grade)[1]

**Delhi issue:** Need to verify if it has all 11 districts separately or consolidated. Based on the vintage (2015-2018), it likely has fewer than 11.

---

## **ALTERNATIVE SOURCES IF YOU NEED MORE DISTRICTS:**

### **2. GitHub: maneetgoyal - Indian Districts GeoJSON (2024)**[4][5]

**Source:** Adopted from IMD data, simplified via Mapshaper[4]

**Two versions:**
1. **Full version:** `https://gist.github.com/maneetgoyal/38229f221e54b0864437ff00ccea39aa` (indian-districts.json)
2. **Simplified version:** `https://gist.github.com/maneetgoyal/c64e9a177a993a8081d8943d0948fa16` (indian-districts-simplified.json)[4]

**Raw download links:**
```
https://gist.githubusercontent.com/maneetgoyal/38229f221e54b0864437ff00ccea39aa/raw/indian-districts.json

https://gist.githubusercontent.com/maneetgoyal/c64e9a177a993a8081d8943d0948fa16/raw/indian-districts-simplified.json
```

**Advantages:**
- Updated March 2024[5][4]
- Based on IMD official data[4]
- Simplified for better web performance[4]
- Already in GeoJSON format

***

### **3. GitHub: udit-001/india-maps-data (2024)**[6]

**CDN-ready GeoJSON with district-level boundaries**

**All India with districts:**
```
https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@latest/india.geojson
```

**Individual states with districts:**
```
https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@latest/states/delhi.geojson
```

**Advantages:**
- CDN delivery (fast)[6]
- Interactive preview: https://indiamaps.netlify.app[6]
- Last updated March 2024[6]
- Both GeoJSON and TopoJSON formats[6]

**Check Delhi specifically:**
```
https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@latest/states/delhi.geojson
```

***

### **4. Survey of India (2025) - MOST AUTHORITATIVE BUT SHAPEFILE**[7][8]

**778 districts** (2025 latest)[7]

**Download:** https://onlinemaps.surveyofindia.gov.in

**Format:** Shapefile (.shp) - Needs conversion to GeoJSON

**Conversion command:**
```bash
ogr2ogr -f GeoJSON districts.geojson india_districts.shp
```

Or use online tool: https://mapshaper.org

***

## **MY RECOMMENDATION FOR YOUR HACKATHON:**

Given your requirements for **high-performance district-level maps with heatmap capabilities** and government API integration:

**Option 1 (Quick Start):** Use **IMD GeoJSON** directly[1]
- Instant download, no conversion
- Proper structure matching your requirements
- 675 districts should cover most use cases
- Government source for credibility

**Option 2 (More Districts):** Use **maneetgoyal's 2024 simplified version**[4]
- More recent data (March 2024)
- Optimized for web performance
- Based on IMD official source

**Option 3 (Most Current & Official):** Download **Survey of India 2025 shapefile**[7]
- Convert to GeoJSON using ogr2ogr
- 778 districts (most complete)
- Official government data (best for government API integration)
- Will be frozen Dec 31, 2025 for Census 2027[9]

**For Delhi 11 districts:** Check the udit-001 Delhi GeoJSON or Survey of India 2025 data.[10][11][12][7][6]

**Quick verification script:**
```javascript
// Load and check district count
fetch('https://mausam.imd.gov.in/imd_latest/contents/district_shapefiles/sd_boundary_rainfall.json')
  .then(r => r.json())
  .then(data => {
    console.log('Total districts:', data.features.length);
    console.log('Properties:', Object.keys(data.features[0].properties));
    // Check Delhi districts
    const delhiDistricts = data.features.filter(f => f.properties.state === 'Delhi');
    console.log('Delhi districts:', delhiDistricts.length);
  });
```

All sources provide **WGS84 (EPSG:4326)** coordinates and **Polygon/MultiPolygon geometries** as required for your heatmap implementation.

[1](https://gist.github.com/planemad/d347ad7485344fb0ba4b470721825427)
[2](https://mausam.imd.gov.in/responsive/rainfallinformation_swd.php)
[3](https://mausam.imd.gov.in/responsive/rainfallinformation.php)
[4](https://gist.github.com/maneetgoyal/c64e9a177a993a8081d8943d0948fa16)
[5](https://gist.github.com/maneetgoyal)
[6](https://github.com/udit-001/india-maps-data)
[7](https://www.surveyofindia.gov.in/UserFiles/files/Vector%20Data%20Catalog%202025(1).pdf)
[8](http://www.surveyofindia.gov.in/UserFiles/files/GOA(1).pdf)
[9](https://economictimes.com/news/india/boundaries-of-administrative-units-to-be-frozen-on-dec-31-2025-for-census/articleshow/122141843.cms)
[10](https://www.arcgis.com/home/item.html?id=5723d3b7bab1450ea0527527960907f5)
[11](https://www.mapsofindia.com/districts-india/)
[12](https://www.kaggle.com/datasets/anandgangadharan/delhi-district-boundaries)
[13](https://projects.datameet.org/indian_village_boundaries/)
[14](https://github.com/AnujTiwari/India-State-and-Country-Shapefile-Updated-Jan-2020)
[15](https://docs.devdatalab.org/SHRUG-Construction-Details/shrug-open-source-polygons/)
[16](https://www.igismap.com/download-india-administrative-boundary-shapefiles-states-districts-sub-districts-pincodes-constituencies/)
[17](https://github.com/Subhash9325/GeoJson-Data-of-Indian-States)
[18](https://www.kaggle.com/datasets/rajkumarpandey02/delhi-assembly-boundary)
[19](https://github.com/datta07/INDIAN-SHAPEFILES)
[20](https://developers.google.com/maps/documentation/javascript/dds-boundaries/coverage)
[21](https://data.opencity.in/dataset/district-maps-for-states-of-india/resource/delhi-districts-map)
[22](https://cran.r-project.org/web/packages/mapindia/mapindia.pdf)
[23](https://stackoverflow.com/questions/67847391/from-where-to-get-the-official-indian-governmental-map-of-india-in-r)
[24](https://groups.google.com/g/datameet/c/4kuQecxfEv8)
[25](http://projects.datameet.org/maps/)
[26](https://github.com/guneetnarula/indian-district-boundaries)
[27](https://gist.github.com/4ed2aafb493f3af53e554b9384ef07c7)
[28](https://www.kaggle.com/datasets/arvanshul/india-geojson)
[29](https://github.com/abhatia08/india_shp_2020)
[30](https://projecttech4dev.org/building-a-india-and-district-metric-map-on-the-superset-dashboard/)
[31](https://github.com/covid19india/covid19india-react/issues/413)
[32](https://stevage.github.io/geojson-spec/)
[33](https://github.com/guneetnarula/choropleth-india-districts)
[34](https://projects.datameet.org/maps/districts/)
[35](https://datameet.org/category/gis/)
[36](https://github.com/guneetnarula/indian-district-boundaries/pulls)
[37](https://gist.github.com/shubhamjain/35ed77154f577295707a)
[38](https://datameet.org/category/mapping/)
[39](https://datameet.org/2016/08/12/guide-on-digitizing-static-maps/)
[40](https://www.kaggle.com/datasets/krutarthhd/india-geojson-file)
[41](https://groups.google.com/g/datameet/c/dZ96g7ngWAg)
[42](https://www.kaggle.com/datasets/adityaradha007/indian-districts-geojson)
[43](https://gramener.com/gramex/guide/mapviewer/)
[44](https://stackoverflow.com/questions/79762507/plotly-chloropleth-of-india-not-showing-states-properly-too-small)
[45](https://bharatnetprogress.nic.in/nicclouddb/rest/services/NCR/NCR_Geo_Portal_26_Nov/MapServer/layers)
[46](https://github.com/datameet/Municipal_Spatial_Data)
[47](https://waterhubdata.com/layers/geonode:NDMC_Area)
[48](https://github.com/datameet/maps)
[49](https://gist.github.com/Keshava11/aace79cf260e7955ac1768d3ad6e24bd)
[50](http://projects.datameet.org/Municipal_Spatial_Data/bhopal/)
[51](https://datameet.org/tag/mapping/)
[52](https://www.kaggle.com/datasets/adityaradha007/indian-districts-geojson/data)
[53](https://groups.google.com/g/datameet/c/Pn7OhvyBuWQ)
[54](https://bharatnetprogress.nic.in/nicclouddb/rest/services/NCR/NCR_Geo_Portal22Nov/MapServer)
[55](https://www.arcgis.com/home/item.html?id=1d11575d353445439b7c282722761c1b)
[56](https://mapgis.in/shapefile-of-india-state-district-administrative-boundaries-2024/)
[57](https://gist.github.com/nateshmbhat/7e1a28eba37364be1456f9c4688bd2a7)
[58](https://github.com/shijithpk/2024_maps_supplement)
[59](https://www.geopostcodes.com/country/india/shapefile/)
[60](https://gist.github.com/devdattaT)
[61](https://github.com/orgs/datameet/repositories)
[62](https://simplemaps.com/gis/country/in)
[63](https://github.com/covid19india/covid19india-react/issues/13)
[64](https://geo2day.com/asia/india.html)
[65](https://mausam.imd.gov.in/imd_latest/contents/statewisedistricts.php)
[66](https://mausamgram.imd.gov.in)
[67](https://mausam.imd.gov.in)
[68](https://mausam.imd.gov.in/responsive/5d_statewisedistricts_rf_forecast.php)
[69](https://mausam.imd.gov.in/imd_latest/contents/satellite.php)
[70](https://www.data.gov.in/catalog/all-india-pincode-boundary-geo-json)
[71](https://mausam.imd.gov.in/bengaluru/)
[72](https://data.humdata.org/dataset/geoboundaries-admin-boundaries-for-india)