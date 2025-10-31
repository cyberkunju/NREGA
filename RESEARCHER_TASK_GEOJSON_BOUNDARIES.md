# Research Task: Find GeoJSON Boundaries for 16 Districts

**Task Type**: Geographic Boundary Data Collection  


## What You Need to Deliver

For each of the 16 districts listed below, provide **GeoJSON boundary data** in the exact format specified.

---

## Required Format

For EACH district, provide a JSON file named `{district-name}.geojson` with this EXACT structure:

```json
{
  "type": "Feature",
  "properties": {
    "District": "DISTRICT_NAME_IN_CAPS",
    "STATE": "STATE_NAME_IN_CAPS",
    "id": 800,
    "FULL_NAME": "District Name, State Name"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [longitude, latitude],
        [longitude, latitude],
        [longitude, latitude]
      ]
    ]
  }
}
```

### Important Format Rules:

1. **District name**: ALL CAPS (e.g., "MALERKOTLA" not "Malerkotla")
2. **State name**: ALL CAPS (e.g., "PUNJAB" not "Punjab")
3. **ID**: Use 800, 801, 802... (sequential, starting from 800)
4. **Coordinates**: Must be `[longitude, latitude]` (longitude first!)
5. **Polygon must close**: First and last coordinate pair must be identical
6. **Minimum points**: At least 20 coordinate pairs
7. **Maximum points**: No more than 1000 coordinate pairs (for performance)

---

## The 16 Districts to Research

### Priority 1: New Districts (15 districts)

These districts were created between 2019-2022 and don't exist in our current map.

| # | District Name | State | Created | Parent District |
|---|---------------|-------|---------|-----------------|
| 1 | Sarangarh Bilaigarh | Chhattisgarh | Sept 2022 | Raigarh + Baloda Bazar |
| 2 | Bajali | Assam | Aug 2020 | Barpeta |
| 3 | Tamulpur | Assam | Jan 2022 | Baksa |
| 4 | Khairagarh Chhuikhadan Gandai | Chhattisgarh | Sept 2022 | Rajnandgaon |
| 5 | Manendragarh Chirmiri Bharatpur | Chhattisgarh | Sept 2022 | Korea |
| 6 | Mohla Manpur Ambagarh Chowki | Chhattisgarh | Sept 2022 | Rajnandgaon |
| 7 | Sakti | Chhattisgarh | Sept 2022 | Janjgir-Champa |
| 8 | Vijayanagara | Karnataka | Nov 2020 | Ballari |
| 9 | Hanumakonda | Telangana | Aug 2021 | Warangal |
| 10 | Malerkotla | Punjab | June 2021 | Sangrur |
| 11 | Pakyong | Sikkim | Dec 2021 | East Sikkim |
| 12 | Soreng | Sikkim | Dec 2021 | West Sikkim |
| 13 | Ranipet | Tamil Nadu | Nov 2019 | Vellore |
| 14 | Mayiladuthurai | Tamil Nadu | Dec 2020 | Nagapattinam |
| 15 | Eastern West Khasi Hills | Meghalaya | Nov 2021 | West Khasi Hills |

### Priority 2: Missing District (1 district)

| # | District Name | State | Issue |
|---|---------------|-------|-------|
| 16 | Rae Bareli | Uttar Pradesh | Missing from current map |

---

## Where to Find the Data

### Source 1: DataMeet (BEST - Try First) ⭐⭐⭐

**Website**: https://github.com/datameet/maps

**What to do:**
1. Go to the repository
2. Look for state-wise GeoJSON files (e.g., `punjab-districts.geojson`)
3. Download the file
4. Check if your district is included
5. Extract the district's GeoJSON data

**Example**: For Malerkotla (Punjab):
- Download: `punjab-districts.geojson`
- Search for: "Malerkotla" or "MALERKOTLA"
- Copy the feature object for that district

### Source 2: OpenStreetMap (GOOD) ⭐⭐

**Website**: https://www.openstreetmap.org/

**What to do:**
1. Search for: "{District Name} district, {State}"
2. Click on the district boundary (purple line)
3. Click "Export" button
4. Select "GeoJSON" format
5. Download the file

**Example**: Search "Malerkotla district, Punjab"

### Source 3: Government GIS Portals ⭐⭐

**Websites**:
- ISRO Bhuvan: https://bhuvan.nrsc.gov.in/
- Survey of India: https://surveyofindia.gov.in/
- State government GIS portals

**What to do:**
1. Search for district maps
2. Look for download options
3. Download in GeoJSON, KML, or Shapefile format
4. Convert to GeoJSON if needed

### Source 4: GADM (Backup) ⭐

**Website**: https://gadm.org/download_country.html

**What to do:**
1. Select "India"
2. Download administrative boundaries
3. Extract district-level data
4. May not have newest districts

---

## Conversion Tools (If Needed)

If you find data in other formats, convert using these tools:

### KML to GeoJSON:
- **Online**: https://mygeodata.cloud/converter/kml-to-geojson
- **Tool**: QGIS (free software)

### Shapefile to GeoJSON:
- **Online**: https://mapshaper.org/
- **Tool**: QGIS (free software)

### Simplify Coordinates (if too many points):
- **Online**: https://mapshaper.org/ (use "Simplify" feature)
- **Target**: 100-500 coordinate pairs per district

---

## Quality Requirements

### Must Have:
1. ✅ Accurate district boundaries (match official maps)
2. ✅ Proper GeoJSON format (validate at https://geojson.io/)
3. ✅ Coordinates in [longitude, latitude] order
4. ✅ Polygon closes (first = last coordinate)
5. ✅ District and state names in ALL CAPS
6. ✅ Source citation (where you found the data)

### Should Have:
1. ✅ 100-500 coordinate pairs (not too few, not too many)
2. ✅ Verified against multiple sources
3. ✅ No overlaps with neighboring districts
4. ✅ Matches parent district boundaries (for new districts)

---

## Deliverable Format

### File Structure:

```
geojson-boundaries/
├── README.md (list of sources used)
├── sarangarh-bilaigarh.geojson
├── bajali.geojson
├── tamulpur.geojson
├── khairagarh-chhuikhadan-gandai.geojson
├── manendragarh-chirmiri-bharatpur.geojson
├── mohla-manpur-ambagarh-chowki.geojson
├── sakti.geojson
├── vijayanagara.geojson
├── hanumakonda.geojson
├── malerkotla.geojson
├── pakyong.geojson
├── soreng.geojson
├── ranipet.geojson
├── mayiladuthurai.geojson
├── eastern-west-khasi-hills.geojson
└── rae-bareli.geojson
```

### README.md Format:

```markdown
# GeoJSON Boundaries - Sources

## Sarangarh Bilaigarh
- Source: DataMeet / OpenStreetMap / Government Portal
- URL: [exact URL]
- Date accessed: [date]
- Verification: [how you verified accuracy]

## Bajali
- Source: [source name]
- URL: [exact URL]
- Date accessed: [date]
- Verification: [verification method]

[... repeat for all 16 districts]
```

---

## Example: Complete GeoJSON File

**File**: `malerkotla.geojson`

```json
{
  "type": "Feature",
  "properties": {
    "District": "MALERKOTLA",
    "STATE": "PUNJAB",
    "id": 800,
    "FULL_NAME": "Malerkotla, Punjab"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [75.8756, 30.5321],
        [75.8823, 30.5289],
        [75.8901, 30.5345],
        [75.8967, 30.5412],
        [75.9034, 30.5478],
        [75.9089, 30.5534],
        [75.9123, 30.5589],
        [75.9145, 30.5645],
        [75.9156, 30.5701],
        [75.9145, 30.5756],
        [75.9123, 30.5812],
        [75.9089, 30.5867],
        [75.9034, 30.5923],
        [75.8967, 30.5989],
        [75.8901, 30.6056],
        [75.8823, 30.6112],
        [75.8756, 30.6080],
        [75.8756, 30.5321]
      ]
    ]
  }
}
```

**Note**: This is a simplified example. Real boundaries will have 100-500+ coordinate pairs.

---

## Validation Checklist

Before submitting, verify EACH file:

### Format Validation:
- [ ] Valid JSON syntax (use https://jsonlint.com/)
- [ ] Valid GeoJSON (use https://geojson.io/)
- [ ] District name in ALL CAPS
- [ ] State name in ALL CAPS
- [ ] Unique ID (800-815)
- [ ] Coordinates in [longitude, latitude] order
- [ ] Polygon closes (first = last point)

### Content Validation:
- [ ] Boundaries match official maps
- [ ] No overlaps with neighboring districts
- [ ] Reasonable size (not too small/large)
- [ ] Located in correct state
- [ ] Source documented in README

### Technical Validation:
- [ ] 20-1000 coordinate pairs
- [ ] File size < 500KB per district
- [ ] Coordinates within India bounds (lat: 8-37, lon: 68-97)

---

## Testing Your Data

You can test if your GeoJSON is correct:

1. **Visual Test**: 
   - Go to https://geojson.io/
   - Paste your GeoJSON
   - Check if the shape looks correct on the map

2. **Format Test**:
   - Go to https://jsonlint.com/
   - Paste your JSON
   - Verify no syntax errors

3. **Coordinate Test**:
   - First coordinate should be [longitude, latitude]
   - Longitude: 68-97 (for India)
   - Latitude: 8-37 (for India)

---

## Common Mistakes to Avoid

### ❌ Wrong coordinate order:
```json
"coordinates": [[[30.5, 75.8]]]  // WRONG (latitude first)
```

### ✅ Correct coordinate order:
```json
"coordinates": [[[75.8, 30.5]]]  // CORRECT (longitude first)
```

### ❌ Polygon doesn't close:
```json
"coordinates": [[[75.8, 30.5], [75.9, 30.6], [76.0, 30.7]]]  // WRONG
```

### ✅ Polygon closes:
```json
"coordinates": [[[75.8, 30.5], [75.9, 30.6], [76.0, 30.7], [75.8, 30.5]]]  // CORRECT
```

### ❌ Wrong case:
```json
"District": "Malerkotla"  // WRONG
```

### ✅ Correct case:
```json
"District": "MALERKOTLA"  // CORRECT
```

---

## Submission


**Include**:
1. All 16 GeoJSON files (or as many as found)
2. README.md with sources
3. Brief note on any difficulties encountered

---

## Questions?

If you encounter issues:

1. **Can't find a district**: Document which sources you tried
2. **Multiple versions**: Choose the most recent/official
3. **Format confusion**: Use the example as template
4. **Coordinate issues**: Longitude first, latitude second
5. **Too many points**: Use https://mapshaper.org/ to simplify

---

