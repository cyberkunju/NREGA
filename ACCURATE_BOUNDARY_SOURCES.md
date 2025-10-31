# Accurate Boundary Data Sources - Research Results

## Summary: Where to Get Accurate Data

After researching, here are the **BEST sources** for accurate district boundaries:

---

## 🏆 Source 1: DataMeet (BEST - Community Maintained)

**URL**: https://github.com/datameet/maps  
**Quality**: ⭐⭐⭐⭐⭐ Excellent  
**Coverage**: Most Indian districts  
**Format**: GeoJSON (ready to use)  
**Updated**: Community maintained, fairly current

### What to Download:

**Option A: Full India File**
- File: `india-composite.geojson` or `india-districts.geojson`
- Contains: All districts in one file
- Size: Large (~50-100MB)
- Link: Check the repository for latest version

**Option B: State-wise Files**
- Files: `punjab.geojson`, `karnataka.geojson`, etc.
- Contains: Districts per state
- Size: Smaller, easier to work with
- Example: `punjab.geojson` will have Malerkotla if updated

### How to Use:
1. Download the file
2. Open in text editor
3. Search for district name
4. Copy the feature object
5. Save as individual file

**Likelihood of having new districts**: 70-80%  
(DataMeet is community-maintained, may have 2020-2021 districts)

---

## 🥈 Source 2: OpenStreetMap (GOOD - Most Complete)

**URL**: https://www.openstreetmap.org/  
**Quality**: ⭐⭐⭐⭐ Very Good  
**Coverage**: Almost all districts (including new ones)  
**Format**: Can export as GeoJSON  
**Updated**: Real-time, community edited

### How to Get Data:

**Method A: Manual Export (Easy)**
1. Go to https://www.openstreetmap.org/
2. Search: "Malerkotla district, Punjab"
3. Click on the boundary (purple line)
4. Click "Export" → "GeoJSON"
5. Download

**Method B: Overpass API (Automated)**
```
https://overpass-api.de/api/interpreter?data=[out:json];
relation["name"="Malerkotla"]["admin_level"="5"]["boundary"="administrative"];
out geom;
```

**Method C: Overpass Turbo (Interactive)**
1. Go to: https://overpass-turbo.eu/
2. Paste query:
```
[out:json];
relation["name"="Malerkotla"]["admin_level"="5"];
out geom;
```
3. Click "Run"
4. Export as GeoJSON

**Likelihood of having new districts**: 95%+  
(OSM is real-time, usually has new districts within months)

---

## 🥉 Source 3: GADM (GOOD - Official Data)

**URL**: https://gadm.org/download_country.html  
**Quality**: ⭐⭐⭐⭐ Very Good  
**Coverage**: All official districts  
**Format**: Multiple formats (GeoJSON, Shapefile, etc.)  
**Updated**: Periodic (may lag 1-2 years)

### How to Download:

1. Go to: https://gadm.org/download_country.html
2. Select: India
3. Choose format: GeoJSON
4. Download: Level 3 (Districts)
5. File: `gadm41_IND_3.json` (~100MB)

### Extract Districts:
```javascript
// Load the file
const data = require('./gadm41_IND_3.json');

// Find district
const malerkotla = data.features.find(f => 
  f.properties.NAME_3 === 'Malerkotla'
);
```

**Likelihood of having new districts**: 50-60%  
(GADM updates periodically, may not have 2021-2022 districts)

---

## 🔧 Source 4: Python + GeoPandas (AUTOMATED)

**Quality**: ⭐⭐⭐⭐⭐ Excellent  
**Requires**: Python, GeoPandas library  
**Best for**: Batch processing multiple districts

### Setup:
```bash
pip install geopandas requests
```

### Script:
```python
import geopandas as gpd
import json

# Download GADM data
url = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_3.json"
gdf = gpd.read_file(url)

# List of districts to extract
districts = ['Malerkotla', 'Vijayanagara', 'Ranipet', ...]

for district_name in districts:
    # Filter
    district = gdf[gdf['NAME_3'] == district_name]
    
    if not district.empty:
        # Export
        district.to_file(f'{district_name.lower()}.geojson', driver='GeoJSON')
        print(f'✅ Exported: {district_name}')
    else:
        print(f'❌ Not found: {district_name}')
```

---

## 📊 Comparison Table

| Source | Quality | Coverage | New Districts | Ease | Format |
|--------|---------|----------|---------------|------|--------|
| **DataMeet** | ⭐⭐⭐⭐⭐ | High | 70% | Easy | GeoJSON |
| **OpenStreetMap** | ⭐⭐⭐⭐ | Very High | 95% | Medium | GeoJSON |
| **GADM** | ⭐⭐⭐⭐ | High | 50% | Easy | Multiple |
| **Python/GeoPandas** | ⭐⭐⭐⭐⭐ | High | 50% | Hard | GeoJSON |

---

## 🎯 My Recommendation

### For You (No Programming):

**Step 1**: Try DataMeet
- Visit: https://github.com/datameet/maps
- Download state files or full India file
- Check if it has the 16 districts
- **Time**: 30 minutes

**Step 2**: If DataMeet doesn't have them, use OpenStreetMap
- Go to https://overpass-turbo.eu/
- Use the query template below
- Export each district
- **Time**: 2-3 hours for 16 districts

**Step 3**: If neither works, download GADM
- Download from https://gadm.org/
- Extract districts manually
- **Time**: 1-2 hours

### For Someone with Python:

**Best approach**: Use the Python script above
- Downloads GADM data automatically
- Extracts all 16 districts
- Converts to GeoJSON
- **Time**: 30 minutes

---

## 🔍 OpenStreetMap Query Template

For each district, use this query in Overpass Turbo:

```
[out:json][timeout:25];
// Search for the district
(
  relation["name"="DISTRICT_NAME"]["admin_level"="5"]["boundary"="administrative"];
);
out geom;
```

**Replace DISTRICT_NAME with**:
- Malerkotla
- Vijayanagara  
- Ranipet
- etc.

---

## 📋 Checklist for Each District

When you get the data, verify:

- [ ] Has 100+ coordinate points (not 9)
- [ ] Polygon closes (first = last point)
- [ ] Coordinates in [longitude, latitude] order
- [ ] Within India bounds (lon: 68-97, lat: 8-37)
- [ ] Looks like actual district shape (not rectangle)
- [ ] File size > 10KB (simplified files are usually < 5KB)

---

## 🚀 Quick Start Guide

### Fastest Path (30 minutes):

1. **Check DataMeet**:
   ```
   https://github.com/datameet/maps
   → Download india-districts.geojson or state files
   → Search for your 16 districts
   → Extract and save
   ```

2. **If not in DataMeet, use Overpass Turbo**:
   ```
   https://overpass-turbo.eu/
   → Paste query for each district
   → Run → Export GeoJSON
   → Repeat for all 16
   ```

3. **Validate**:
   ```
   node scripts/validate-researcher-geojson.js
   → Check point count (should be 100+)
   → Verify boundaries look correct
   ```

---

## 💡 Pro Tips

1. **DataMeet is fastest** if it has the districts
2. **OpenStreetMap is most complete** but requires manual work per district
3. **GADM is reliable** but may not have newest districts
4. **Python script is best** if you have Python installed

---

## ❓ What If Districts Aren't Found?

If a district isn't in any source:
1. It's very new (2022) and not yet mapped
2. Use aggregation instead (show data on parent district)
3. Wait for sources to update (6-12 months)

**For now**: Implement aggregation for districts you can't find accurate boundaries for.

---

## 📞 Need Help?

If you try these sources and still can't find accurate boundaries:
1. Let me know which districts you found
2. I'll help with the ones that are missing
3. We can implement aggregation for the rest

**Bottom line**: DataMeet or OpenStreetMap should have most of these districts with accurate boundaries.
