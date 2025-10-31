# Download Real Boundaries for Hexagonal Districts

## Problem
5 Chhattisgarh districts show as weird hexagons/octagons because they only have placeholder boundaries (9 points each):

1. **MANENDRAGARH CHIRMIRI BHARATPUR**
2. **SAKTI**
3. **MOHLA MANPUR AMBAGARH CHOWKI**
4. **KHAIRAGARH CHHUIKHADAN GANDAI**
5. **SARANGARH BILAIGARH**

These are NEW districts created in 2022, so they're not in older GeoJSON files.

---

## Solution: Download Real Boundaries

### Step 1: Install Python (if needed)

Check if you have Python:
```bash
python --version
```

If not installed: https://www.python.org/downloads/

### Step 2: Install Required Library

```bash
pip install requests
```

### Step 3: Create Boundaries Directory

```bash
mkdir frontend/public/boundaries
```

### Step 4: Run Download Script

```bash
python scripts/download-chhattisgarh-boundaries.py
```

**This will:**
- Query OpenStreetMap for each district
- Try multiple name variations
- Download detailed boundaries (100-500+ points)
- Save to `frontend/public/boundaries/`

**Expected output:**
```
============================================================
CHHATTISGARH DISTRICT BOUNDARY DOWNLOADER
============================================================

Attempting to download 5 districts...

============================================================
⏳ Downloading: Manendragarh Chirmiri Bharatpur
============================================================
  Querying Overpass API...
  ✅ SUCCESS - 342 points
  📁 Saved to: ../frontend/public/boundaries/manendragarh_chirmiri_bharatpur.geojson

... (continues for all 5 districts)
```

### Step 5: Integrate New Boundaries

```bash
node scripts/integrate-new-boundaries.js
```

**This will:**
- Remove the 5 hexagonal placeholders
- Add the new real boundaries
- Update `frontend/public/india-districts.geojson`
- Create a backup of the original

**Expected output:**
```
=== INTEGRATING NEW CHHATTISGARH BOUNDARIES ===

Loaded main GeoJSON: 774 districts

❌ Removing placeholder: MANENDRAGARH CHIRMIRI BHARATPUR
❌ Removing placeholder: SAKTI
❌ Removing placeholder: MOHLA MANPUR AMBAGARH CHOWKI
❌ Removing placeholder: KHAIRAGARH CHHUIKHADAN GANDAI
❌ Removing placeholder: SARANGARH BILAIGARH

Removed 5 placeholder districts

Found 5 new boundary files:

✅ Added: MANENDRAGARH CHIRMIRI BHARATPUR (342 points)
✅ Added: SAKTI (156 points)
✅ Added: MOHLA MANPUR AMBAGARH CHOWKI (289 points)
✅ Added: KHAIRAGARH CHHUIKHADAN GANDAI (234 points)
✅ Added: SARANGARH BILAIGARH (198 points)

📦 Backup created: frontend/public/india-districts.geojson.backup

✅ SUCCESS!
   Removed: 5 placeholder districts
   Added: 5 real boundaries
   Total districts: 774

📁 Updated: frontend/public/india-districts.geojson
```

### Step 6: Rebuild and Test

```bash
# Rebuild frontend
cd frontend
npm run build

# Or restart dev server
npm start
```

### Step 7: Clear Browser Cache

**Important!** Your browser caches the GeoJSON file.

**Chrome/Edge:**
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Select "Cached images and files"
- Click "Clear data"

**Or hard refresh:**
- `Ctrl+F5` (Windows)
- `Cmd+Shift+R` (Mac)

---

## If Download Fails

These districts are very new (2022), so they might not be in OpenStreetMap yet.

### Alternative 1: Try GADM Database

```bash
# Download India Level 3 (Districts) from GADM
# Visit: https://gadm.org/download_country.html
# Select: India → Level 3 → GeoJSON
```

### Alternative 2: Hide Placeholder Districts

If real boundaries aren't available, hide them temporarily:

**Edit `frontend/src/components/IndiaDistrictMap/MapView.jsx`:**

```javascript
// Add after loading GeoJSON
const PLACEHOLDER_DISTRICTS = [
  'khairagarh chhuikhadan gandai',
  'manendragarh chirmiri bharatpur',
  'mohla manpur ambagarh chowki',
  'sakti',
  'sarangarh bilaigarh'
];

// When adding fill layer
map.current.addLayer({
  id: 'districts-fill',
  type: 'fill',
  source: 'districts',
  paint: {
    'fill-color': ['case', ['!=', ['get', 'color'], null], ['get', 'color'], '#e0e0e0'],
    'fill-opacity': [
      'case',
      ['in', ['downcase', ['get', 'district']], ['literal', PLACEHOLDER_DISTRICTS]],
      0,  // Hide placeholders
      0.7
    ]
  }
});
```

### Alternative 3: Use Parent District Boundaries

These 5 districts were carved from existing districts:

| New District | Carved From |
|-------------|-------------|
| Sakti | Janjgir-Champa |
| Manendragarh-Chirmiri-Bharatpur | Koriya |
| Khairagarh-Chhuikhadan-Gandai | Rajnandgaon |
| Mohla-Manpur-Ambagarh Chowki | Rajnandgaon |
| Sarangarh-Bilaigarh | Raigarh |

You could temporarily use the parent district boundaries.

---

## Troubleshooting

### Error: "pip: command not found"
```bash
# Install pip
python -m ensurepip --upgrade
```

### Error: "requests module not found"
```bash
pip install requests
# or
python -m pip install requests
```

### Error: "Overpass API timeout"
The API is slow. Just wait and retry:
```bash
python scripts/download-chhattisgarh-boundaries.py
```

### Error: "No results found"
The district doesn't exist in OpenStreetMap yet. Use Alternative 1 or 2 above.

---

## Expected Results

**Before:**
- 5 districts show as dark hexagons/octagons
- Only 9 coordinate points each
- Look weird and overlapped

**After:**
- 5 districts show with real boundaries
- 100-500+ coordinate points each
- Look natural and match surrounding districts

---

## Files Created

```
frontend/public/boundaries/
├── manendragarh_chirmiri_bharatpur.geojson
├── sakti.geojson
├── mohla_manpur_ambagarh_chowki.geojson
├── khairagarh_chhuikhadan_gandai.geojson
└── sarangarh_bilaigarh.geojson

frontend/public/india-districts.geojson.backup  (backup of original)
frontend/public/india-districts.geojson         (updated with real boundaries)
```

---

## Quick Command Summary

```bash
# 1. Install dependencies
pip install requests

# 2. Create directory
mkdir frontend/public/boundaries

# 3. Download boundaries
python scripts/download-chhattisgarh-boundaries.py

# 4. Integrate into main GeoJSON
node scripts/integrate-new-boundaries.js

# 5. Rebuild frontend
cd frontend && npm start

# 6. Clear browser cache (Ctrl+Shift+Delete)
```

---

## Need Help?

If the download fails or you need assistance:

1. Check `AUTOMATED_SOLUTIONS_GUIDE.md` for more download options
2. See `FIX_HEXAGONAL_DISTRICTS.md` for hiding placeholders
3. Try GADM database as alternative source

The hexagonal districts will be fixed once real boundaries are obtained or hidden!
