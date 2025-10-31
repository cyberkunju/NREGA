# MGNREGA District Matching Fix Plan

## 🔴 CRITICAL ISSUES IDENTIFIED

### Issue 1: Missing Composite Key (District + State)
**Current Behavior:**
- Frontend creates key: `kolkata` (district name only)
- Backend returns data keyed by district name only
- Result: Districts with same name in different states get mixed up

**Example:**
- Clicking "Kolkata" (West Bengal) shows data for "Soreng" (Sikkim)
- Both somehow map to the same key

### Issue 2: Sikkim GeoJSON Uses Direction Names
**GeoJSON Properties:**
- District: "EAST", "WEST", "NORTH", "SOUTH"
- STATE: "SIKKIM"

**API/Database Names:**
- "Gangtok District" → Should map to "EAST"
- "Soreng" → Should map to "WEST"
- "Pakyong" → Should map to "EAST"
- "Namchi District" → Should map to "SOUTH"
- "Gyalshing District" → Should map to "WEST"
- "Mangan District" → Should map to "NORTH"

### Issue 3: Case Sensitivity & Normalization
- GeoJSON: "KOLKATA" (uppercase)
- API: "Kolkata" (title case)
- Database: Mixed case
- Keys must be normalized consistently

---

## ✅ SOLUTION - 3-STEP FIX

### STEP 1: Fix Backend API to Return Composite Keys

**File:** `backend/routes/performance.js`

**Change `/api/performance/all` endpoint:**

```javascript
// BEFORE (Line ~180):
const districts = cappedRecords.map(row => {
  return {
    district: row.district_name,
    state: row.state || 'India',
    paymentPercentage: currentPayment,
    // ...
  };
});

// AFTER:
const districts = cappedRecords.map(row => {
  const districtKey = `${row.district_name.toLowerCase()}|${(row.state || 'India').toLowerCase()}`;
  
  return {
    districtKey: districtKey, // ADD THIS - composite key for frontend matching
    district: row.district_name,
    state: row.state || 'India',
    paymentPercentage: currentPayment,
    // ...
  };
});
```

**Change `/api/performance/heatmap-data` endpoint:**

```javascript
// BEFORE (Line ~320):
return {
  districtId: row.district_id || `${row.district_name}_${...}`,
  districtName: row.district_name,
  stateName: row.state_name || 'India',
  // ...
};

// AFTER:
const districtKey = `${row.district_name.toLowerCase()}|${(row.state_name || 'India').toLowerCase()}`;

return {
  districtKey: districtKey, // ADD THIS - composite key
  districtId: row.district_id || `${row.district_name}_${...}`,
  districtName: row.district_name,
  stateName: row.state_name || 'India',
  // ...
};
```

---

### STEP 2: Fix Frontend District Mapping

**File:** `frontend/src/utils/districtMapping.js`

**Update `createPerformanceKey` function:**

```javascript
// BEFORE (Line ~20):
export const createPerformanceKey = (name) => {
  return (name || '').toString().trim().toLowerCase();
};

// AFTER:
export const createPerformanceKey = (districtName, stateName) => {
  const district = (districtName || '').toString().trim().toLowerCase();
  const state = (stateName || '').toString().trim().toLowerCase();
  return `${district}|${state}`;
};
```

**Update `enrichGeoJSONWithPerformance` function:**

```javascript
// BEFORE (Line ~60):
const key = createPerformanceKey(districtName);
const performance = performanceData[key];

// AFTER:
const key = createPerformanceKey(districtName, stateName);
const performance = performanceData[key];
```

---

### STEP 3: Fix Sikkim District Mapping

**File:** `frontend/src/utils/districtNameMapping.js`

**Update Sikkim mappings (Line ~216):**

```javascript
// CURRENT (WRONG):
'gangtok district': 'east',
'gyalshing district': 'west',
'mangan district': 'north',
'namchi district': 'south',
'pakyong': 'east',
'soreng': 'west',

// CORRECT (with state context):
// These should be in DISTRICT_NAME_MAPPINGS
'sikkim:gangtok district': 'east',
'sikkim:gyalshing district': 'west',
'sikkim:mangan district': 'north',
'sikkim:namchi district': 'south',
'sikkim:pakyong': 'east',
'sikkim:soreng': 'west',
```

**Add new function for state-aware mapping:**

```javascript
/**
 * Map API district name to GeoJSON district name with state context
 * @param {string} apiName - District name from API
 * @param {string} stateName - State name for context
 * @returns {string} Mapped district name for GeoJSON lookup
 */
export const mapDistrictNameWithState = (apiName, stateName = '') => {
  if (!apiName) return '';

  const normalized = normalizeDistrictName(apiName);
  const stateNormalized = normalizeDistrictName(stateName);

  // Check state-specific mapping first (for Sikkim, etc.)
  const stateKey = `${stateNormalized}:${normalized}`;
  if (DISTRICT_NAME_MAPPINGS[stateKey]) {
    return DISTRICT_NAME_MAPPINGS[stateKey];
  }

  // Check direct mapping
  if (DISTRICT_NAME_MAPPINGS[normalized]) {
    return DISTRICT_NAME_MAPPINGS[normalized];
  }

  return normalized;
};
```

---

### STEP 4: Update Frontend API Service

**File:** `frontend/src/services/api.js`

**Transform API response to use composite keys:**

```javascript
// When fetching /api/performance/all
export const fetchAllDistrictPerformance = async () => {
  const response = await axios.get(`${API_BASE_URL}/performance/all`);
  
  // Transform array to keyed object using composite key
  const keyedData = {};
  response.data.districts.forEach(district => {
    const key = `${district.district.toLowerCase()}|${district.state.toLowerCase()}`;
    keyedData[key] = district;
  });
  
  return keyedData;
};
```

---

## 🧪 TESTING PLAN

### Test Case 1: Kolkata (West Bengal)
- Click on Kolkata district
- Should show: "KOLKATA, WEST BENGAL"
- Should NOT show: Soreng data

### Test Case 2: Sikkim Districts
- Click on "WEST" district in Sikkim
- Should show: "Soreng" or "Gyalshing District" data
- Should show: "SIKKIM" as state

### Test Case 3: Duplicate District Names
- Test districts with same name in different states:
  - Pratapgarh (Uttar Pradesh vs Rajasthan)
  - Balrampur (Chhattisgarh vs Uttar Pradesh)
  - Hamirpur (Himachal Pradesh vs Uttar Pradesh)
  - Bilaspur (Chhattisgarh vs Himachal Pradesh)

### Test Case 4: Gray Districts (No Data)
- Verify districts without data show gray
- Verify tooltip shows "No data available"

---

## 📊 EXPECTED RESULTS

### Before Fix:
- ❌ 759 GeoJSON districts
- ❌ ~200-300 matched (40%)
- ❌ Wrong data shown for many districts
- ❌ Kolkata shows Soreng data

### After Fix:
- ✅ 759 GeoJSON districts
- ✅ ~700+ matched (95%+)
- ✅ Correct data for each district
- ✅ Kolkata shows Kolkata data
- ✅ Sikkim districts properly mapped

---

## 🚀 IMPLEMENTATION ORDER

1. **Backend Fix** (30 min)
   - Update `/api/performance/all`
   - Update `/api/performance/heatmap-data`
   - Test endpoints with Postman

2. **Frontend Mapping Fix** (20 min)
   - Update `districtMapping.js`
   - Update `districtNameMapping.js`
   - Add composite key support

3. **API Service Fix** (10 min)
   - Update `api.js` to transform response

4. **Testing** (30 min)
   - Test all 4 test cases
   - Verify map shows correct data
   - Check console for matching statistics

**Total Time: ~90 minutes**

---

## 📝 VERIFICATION CHECKLIST

- [ ] Backend returns `districtKey` field
- [ ] Frontend creates composite keys (district|state)
- [ ] Sikkim districts map correctly
- [ ] Kolkata shows correct data
- [ ] No duplicate district issues
- [ ] Console shows 95%+ match rate
- [ ] Gray districts are truly missing data
- [ ] Tooltips show correct district names
- [ ] Click navigation works correctly

---

## 🔍 DEBUG COMMANDS

```javascript
// In browser console after map loads:
console.log('Performance data keys:', Object.keys(window.performanceData).slice(0, 20));
console.log('GeoJSON features:', window.geoJsonData.features.slice(0, 5).map(f => ({
  district: f.properties.District,
  state: f.properties.STATE,
  hasData: f.properties.hasData
})));
```

---

## 📚 RELATED FILES TO MODIFY

1. `backend/routes/performance.js` - Add composite keys
2. `frontend/src/utils/districtMapping.js` - Update key creation
3. `frontend/src/utils/districtNameMapping.js` - Fix Sikkim mappings
4. `frontend/src/services/api.js` - Transform API response
5. `frontend/src/components/IndiaDistrictMap/IndiaDistrictMap.jsx` - Verify key usage

---

## ⚠️ POTENTIAL ISSUES

1. **Performance Impact**: Composite keys are slightly longer
   - Solution: Minimal impact, keys are still small strings

2. **Backward Compatibility**: Existing code may break
   - Solution: Update all key creation points simultaneously

3. **State Name Variations**: "West Bengal" vs "WEST BENGAL"
   - Solution: Always normalize to lowercase

4. **Missing State Data**: Some districts may not have state
   - Solution: Default to "india" if state is null

---

## 🎯 SUCCESS CRITERIA

✅ **Primary Goal**: Clicking Kolkata shows Kolkata data (not Soreng)
✅ **Secondary Goal**: 95%+ district match rate
✅ **Tertiary Goal**: All Sikkim districts show correct data
