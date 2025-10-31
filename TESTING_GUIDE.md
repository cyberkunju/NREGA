# District Mapping Fix - Testing Guide

## Quick Test Steps

### 1. Start the Application

If not already running:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

The frontend should open at `http://localhost:3000`

### 2. Critical Test Cases

#### Test Case 1: Kolkata (The Original Bug)
**Before**: Showed Soreng, Sikkim data  
**After**: Should show Kolkata, West Bengal data

1. Navigate to the map
2. Search for "Kolkata" or click on Kolkata district
3. Verify the tooltip/details show:
   - District: Kolkata
   - State: West Bengal
   - Correct payment percentage for Kolkata

#### Test Case 2: Sikkim Districts (Direction Names)
**Before**: All Sikkim districts showed gray (no data)  
**After**: Should show correct data for each direction

Test these districts:
- **Gangtok District** → Should map to EAST Sikkim
- **Soreng** → Should map to WEST Sikkim
- **Namchi District** → Should map to SOUTH Sikkim
- **Mangan District** → Should map to NORTH Sikkim
- **Pakyong** → Should map to EAST Sikkim
- **Gyalshing District** → Should map to WEST Sikkim

#### Test Case 3: West Bengal 24 Parganas
**Before**: May have shown incorrect data  
**After**: Should show correct data for each

Test these districts:
- **24 Parganas (North)** → Should map to NORTH TWENTY-FOUR PARGANAS
- **24 Parganas South** → Should map to SOUTH TWENTY-FOUR PARGANAS
- **Howrah** → Should map to HAORA
- **Hooghly** → Should map to HUGLI
- **Coochbehar** → Should map to KOCH BIHAR

#### Test Case 4: Bangalore Variants
**Before**: May have had inconsistent mapping  
**After**: Should map correctly

Test these:
- **Bengaluru** → Should map to BENGALURU URBAN
- **Bengaluru Urban** → Should map to BENGALURU URBAN
- **Bengaluru Rural** → Should map to BENGALURU RURAL
- **Bengaluru South** → Should map to BENGALURU URBAN

### 3. Console Verification

Open browser DevTools (F12) and check the Console tab for these messages:

```
✅ Expected Messages:
📊 Perfect mapping: 731 geoIds mapped
🎯 Match statistics: Perfect=XXX, Fallback=YYY, None=ZZZ
📊 Enriched XXX/759 features with data (95.7% coverage)
✅ Districts WITH data: [list of districts]
```

```
❌ Should NOT see:
- "Unmatched API districts" with Kolkata, Soreng, or other major cities
- Match statistics showing high "None" count
- Coverage below 90%
```

### 4. Visual Verification

#### Map Display:
- [ ] Districts have appropriate colors (not all gray)
- [ ] Hover tooltips show correct district names
- [ ] Hover tooltips show correct state names
- [ ] Hover tooltips show correct metrics (payment %, households, etc.)

#### Search Functionality:
- [ ] Search for "Kolkata" finds Kolkata, West Bengal
- [ ] Search for "Soreng" finds Soreng, Sikkim
- [ ] Search for "Bengaluru" finds Bengaluru Urban, Karnataka

#### Click Navigation:
- [ ] Clicking on a district navigates to correct district detail page
- [ ] District detail page shows correct data for that district

### 5. Performance Check

- [ ] Map loads within 3-5 seconds
- [ ] No console errors or warnings
- [ ] Smooth hover interactions
- [ ] Search is responsive

### 6. Edge Cases

Test these potentially problematic districts:

1. **Delhi Districts** (all should work):
   - New Delhi, North Delhi, South Delhi, East Delhi, West Delhi
   - Central Delhi, North East Delhi, North West Delhi
   - South West Delhi, South East Delhi, Shahdara

2. **Telangana** (recently split districts):
   - Warangal → WARANGAL (URBAN)
   - Hanumakonda → WARANGAL (RURAL)
   - Medchal → MEDCHAL-MALKAJGIRI

3. **Renamed Districts**:
   - Chatrapati Sambhaji Nagar (formerly Aurangabad)
   - Dharashiv (formerly Osmanabad)
   - Ahilyanagar (formerly Ahmednagar)

## Debugging

### If a district shows wrong data:

1. **Check Console Logs**:
   ```javascript
   // Look for the district in the enrichment logs
   // Check which match type was used: perfect, fallback, or fuzzy
   ```

2. **Verify Perfect Mapping**:
   ```bash
   # Check if district is in the mapping file
   cd frontend/src/data
   # Search for the district name in perfect-district-mapping.json
   ```

3. **Check API Data**:
   ```bash
   # Verify the district exists in API
   curl http://localhost:5000/api/performance/heatmap-data | jq '.[] | select(.districtName | contains("Kolkata"))'
   ```

4. **Check GeoJSON**:
   ```bash
   # Verify the district exists in GeoJSON
   cd frontend/public
   # Search for the district in india-districts.geojson
   ```

### If coverage is low:

1. Check the console for "Match statistics"
2. Look at "Districts WITHOUT data" list
3. Compare with `analysis-output/unmatched-api.json`
4. Add missing mappings to `scripts/generate-perfect-mapping.js`
5. Regenerate mapping: `node generate-perfect-mapping.js`

## Success Criteria

✅ **PASS** if:
- Kolkata shows Kolkata data (not Soreng)
- All 6 Sikkim districts show data
- West Bengal districts show correct data
- Bangalore variants map correctly
- Coverage is 95%+ (720+ districts matched)
- No console errors
- Map loads smoothly

❌ **FAIL** if:
- Kolkata still shows Soreng data
- Sikkim districts are gray
- Coverage is below 90%
- Console shows errors
- Map doesn't load

## Reporting Issues

If you find issues, please report:

1. **District Name** (as shown in UI)
2. **State Name** (as shown in UI)
3. **Expected Data** (what should be shown)
4. **Actual Data** (what is being shown)
5. **Console Logs** (copy relevant logs)
6. **Screenshot** (if visual issue)

## Next Steps After Testing

1. If all tests pass → **Deploy to production**
2. If some tests fail → **Review and fix specific mappings**
3. If coverage is low → **Add more manual fixes**
4. If performance is slow → **Optimize mapping lookup**

---

**Happy Testing!** 🎉
