# Fix for Hexagonal/Octagonal Placeholder Districts

## Problem Identified

The darker, weird-looking hexagonal/octagonal districts visible in Chhattisgarh are **placeholder geometries**, not real boundaries. They have only 9 coordinate points forming geometric shapes.

### Affected Districts:
1. **KHAIRAGARH CHHUIKHADAN GANDAI** - 9 points
2. **MANENDRAGARH CHIRMIRI BHARATPUR** - 9 points  
3. **MOHLA MANPUR AMBAGARH CHOWKI** - 9 points
4. **SAKTI** - 9 points
5. **SARANGARH BILAIGARH** - 9 points

These are NEW districts created in 2022 when Chhattisgarh was reorganized. Real boundary data is not available in standard GeoJSON sources.

## Solution Options

### Option 1: Hide Placeholder Districts (QUICK - 5 minutes)

Add filter to MapView.jsx to hide these districts:

```javascript
// In MapView.jsx, after loading GeoJSON

const PLACEHOLDER_DISTRICTS = [
  'khairagarh chhuikhadan gandai',
  'manendragarh chirmiri bharatpur',
  'mohla manpur ambagarh chowki',
  'sakti',
  'sarangarh bilaigarh'
];

// When adding the fill layer
map.current.addLayer({
  id: 'districts-fill',
  type: 'fill',
  source: 'districts',
  paint: {
    'fill-color': [
      'case',
      ['!=', ['get', 'color'], null],
      ['get', 'color'],
      '#e0e0e0'
    ],
    'fill-opacity': [
      'case',
      // Hide placeholder districts
      ['in', ['downcase', ['get', 'district']], ['literal', PLACEHOLDER_DISTRICTS]],
      0,  // Completely transparent
      0.7  // Normal opacity
    ]
  }
});

// Also hide their borders
map.current.addLayer({
  id: 'districts-border',
  type: 'line',
  source: 'districts',
  paint: {
    'line-color': '#ffffff',
    'line-width': 1,
    'line-opacity': [
      'case',
      ['in', ['downcase', ['get', 'district']], ['literal', PLACEHOLDER_DISTRICTS]],
      0,  // Hide border
      0.8  // Normal border
    ]
  }
});
```

### Option 2: Show with Low Opacity + Disclaimer (MEDIUM - 15 minutes)

Show them but make them very faint with a visual indicator:

```javascript
// Show placeholders with 10% opacity
'fill-opacity': [
  'case',
  ['in', ['downcase', ['get', 'district']], ['literal', PLACEHOLDER_DISTRICTS]],
  0.1,  // Very faint
  0.7   // Normal
]

// Add dashed border to indicate placeholder
map.current.addLayer({
  id: 'placeholder-indicator',
  type: 'line',
  source: 'districts',
  paint: {
    'line-color': '#ff6b6b',
    'line-width': 2,
    'line-dasharray': [2, 2],
    'line-opacity': 0.5
  },
  filter: ['in', ['downcase', ['get', 'district']], ['literal', PLACEHOLDER_DISTRICTS]]
});
```

Add tooltip note:
```javascript
// In Tooltip.jsx
{isPlaceholder && (
  <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '4px' }}>
    ⚠️ Approximate boundary
  </div>
)}
```

### Option 3: Download Real Boundaries (BEST - 1-2 hours)

Sources for real boundaries:

1. **GADM (Global Administrative Areas)**
   - URL: https://gadm.org/download_country.html
   - Select India → Level 3 (Districts)
   - Format: GeoJSON
   - Quality: High, but may not have 2022 districts

2. **DataMeet India Maps**
   - GitHub: https://github.com/datameet/maps
   - Community-maintained
   - May have newer districts

3. **Survey of India**
   - Official source
   - Requires manual processing

4. **OpenStreetMap Overpass API**
   ```javascript
   // Query for specific district
   const query = `
     [out:json];
     area["name"="Chhattisgarh"]["admin_level"="4"];
     relation(area)["admin_level"="5"]["name"="Sakti"];
     out geom;
   `;
   ```

### Option 4: Use Parent District Boundaries (TEMPORARY)

These 5 new districts were carved out from existing districts. Use the old district boundaries temporarily:

- **Sakti** → carved from Janjgir-Champa
- **Manendragarh-Chirmiri-Bharatpur** → carved from Koriya
- **Khairagarh-Chhuikhadan-Gandai** → carved from Rajnandgaon
- **Mohla-Manpur-Ambagarh Chowki** → carved from Rajnandgaon
- **Sarangarh-Bilaigarh** → carved from Raigarh

## Recommended Approach

**Immediate (Today):** Use Option 1 - Hide these 5 districts completely

**Short-term (This week):** Try Option 3 - Download from GADM or DataMeet

**Long-term:** Contact Survey of India or use official Chhattisgarh government GIS data

## Implementation Steps

1. Create `frontend/src/data/placeholder-districts.json` ✓ (Done)

2. Update `MapView.jsx`:
   ```javascript
   import placeholderConfig from '../../data/placeholder-districts.json';
   
   // Use placeholderConfig.placeholderDistricts in filter
   ```

3. Test the map - placeholders should be invisible

4. Add a note in the UI:
   ```javascript
   <div className="map-disclaimer">
     Note: 5 new Chhattisgarh districts (2022) are hidden due to unavailable boundary data
   </div>
   ```

## Files to Modify

- `frontend/src/components/IndiaDistrictMap/MapView.jsx` - Add filter logic
- `frontend/src/components/IndiaDistrictMap/MapView.css` - Add disclaimer styles
- `frontend/src/data/placeholder-districts.json` - ✓ Already created

## Testing

After implementing:
1. Zoom to Chhattisgarh region
2. Verify the 5 hexagonal districts are no longer visible
3. Check that surrounding districts (Raigarh, Bilaspur, etc.) still show correctly
4. Verify tooltips don't show for hidden districts

## Why This Happened

These districts were created in 2022 as part of Chhattisgarh's administrative reorganization. The original GeoJSON file didn't have them, so placeholder hexagons were added manually to maintain the district count. Real boundary data hasn't been published yet by official sources.
