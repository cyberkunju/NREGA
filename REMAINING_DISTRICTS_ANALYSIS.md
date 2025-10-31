# Remaining Districts Analysis

## Current Status: 96.46% Coverage ✅

**Mappings**: 709 / 735  
**Excluded**: 26  
**Coverage**: 96.46% (up from 94.29%)

---

## 26 Remaining Districts - Categorized

### Category 1: NEW DISTRICTS (Post-2019) - 15 districts ✅ DOCUMENTED
**Status**: Cannot be mapped (not in GeoJSON)  
**Solution**: Parent aggregation already documented

| District | State | Created | Parent District(s) | Status |
|---|---|---|---|---|
| Sarangarh Bilaigarh | Chhattisgarh | 2022-09-03 | Raigarh + Baloda Bazar | ✅ Aggregation ready |
| Bajali | Assam | 2020-08 | Barpeta | ✅ Aggregation ready |
| Tamulpur | Assam | 2022-01 | Baksa | ✅ Aggregation ready |
| Khairagarh Chhuikhadan Gandai | Chhattisgarh | 2022-09-03 | Rajnandgaon | ✅ Aggregation ready |
| Manendragarh Chirmiri Bharatpur | Chhattisgarh | 2022-09-09 | Korea | ✅ Aggregation ready |
| Mohla Manpur Ambagarh Chowki | Chhattisgarh | 2022-09-02 | Rajnandgaon | ✅ Aggregation ready |
| Sakti | Chhattisgarh | 2022-09-09 | Janjgir-Champa | ✅ Aggregation ready |
| Vijayanagara | Karnataka | 2020-11-18 | Ballari | ✅ Aggregation ready |
| Hanumakonda | Telangana | 2021-08 | Warangal | ✅ Aggregation ready |
| Malerkotla | Punjab | 2021-06-02 | Sangrur | ✅ Aggregation ready |
| Pakyong | Sikkim | 2021-12-13 | East Sikkim | ✅ Aggregation ready |
| Soreng | Sikkim | 2021-12-13 | West Sikkim | ✅ Aggregation ready |
| Ranipet | Tamil Nadu | 2019-11-28 | Vellore | ✅ Aggregation ready |
| Mayiladuthurai | Tamil Nadu | 2020-12-28 | Nagapattinam | ✅ Aggregation ready |
| Eastern West Khasi Hills | Meghalaya | 2021-11-10 | West Khasi Hills | ✅ Aggregation ready |

**Action**: Implement aggregation logic in backend to sum data from new districts to their parents.

---

### Category 2: MISSING FROM GEOJSON (Should exist but don't) - 8 districts ❌ CRITICAL

These districts should be in the GeoJSON but are missing, confirming the "temporal divide":

| District | State | Issue | Research Finding |
|---|---|---|---|
| Chatrapati Sambhaji Nagar | Maharashtra | Renamed from Aurangabad 2023, but Aurangabad also missing | ❌ GeoJSON missing Maharashtra Aurangabad |
| Dharashiv | Maharashtra | Renamed from Osmanabad 2023, but Osmanabad also missing | ❌ GeoJSON missing Osmanabad |
| Unakoti | Tripura | Created 2012, should exist | ❌ NOT FOUND in GeoJSON |
| Rae Bareli | Uttar Pradesh | Should be RAEBARELI | ❌ NOT FOUND (spelling issue?) |
| Kumram Bheemasifabad | Telangana | Should be KOMARAM BHEEM ASIFABAD | ❌ NOT FOUND |
| Narsinghpur | Madhya Pradesh | Should be NARSIMHAPUR | ❌ NOT FOUND |
| Anantapur | Andhra Pradesh | Standard district | ❌ NOT FOUND (verify spelling) |
| Neemuch | Madhya Pradesh | Standard district | ❌ NOT FOUND (verify spelling) |

**Action**: Need to search GeoJSON with alternate spellings or confirm these are genuinely missing.

---

### Category 3: NON-DISTRICT ENTITIES - 2 entities ✅ CORRECTLY EXCLUDED

| Entity | State | Reason | Action |
|---|---|---|---|
| Siliguri Mahakuma Parisad | West Bengal | Sub-divisional council, not a district | ✅ Exclude, aggregate to Darjeeling |
| Dadra and Nagar Haveli | DN Haveli and DD | UT merger anomaly (2020) | ⚠️ Needs investigation |

---

### Category 4: WRONG STATE (Still needs fixing) - 1 district 🔴

| District | Wrong State | Correct State | Status |
|---|---|---|---|
| Unakoti | Himachal Pradesh | Tripura | ❌ Still in excluded with wrong state |

**Action**: Move from `himachal pradesh:unakoti` to `tripura:unakoti` in excluded list.

---

## Priority Actions

### 🔴 HIGH PRIORITY: Find Missing 8 Districts

Let me search for these with alternate spellings:

```javascript
const SEARCH_TARGETS = [
  { api: 'Rae Bareli', search: ['RAE BARELI', 'RAEBARELI', 'RAE-BARELI'], state: 'UTTAR PRADESH' },
  { api: 'Kumram Bheemasifabad', search: ['KUMRAM', 'KOMARAM', 'ASIFABAD'], state: 'TELANGANA' },
  { api: 'Narsinghpur', search: ['NARSINGHPUR', 'NARSIMHAPUR', 'NARSINGPUR'], state: 'MADHYA PRADESH' },
  { api: 'Anantapur', search: ['ANANTAPUR', 'ANANTPUR', 'ANANTHPUR'], state: 'ANDHRA PRADESH' },
  { api: 'Neemuch', search: ['NEEMUCH', 'NIMACH', 'NEEMACH'], state: 'MADHYA PRADESH' },
  { api: 'Aurangabad', search: ['AURANGABAD'], state: 'MAHARASHTRA' },
  { api: 'Osmanabad', search: ['OSMANABAD'], state: 'MAHARASHTRA' },
  { api: 'Unakoti', search: ['UNAKOTI', 'UNOKOTI'], state: 'TRIPURA' }
];
```

### 🟡 MEDIUM PRIORITY: Implement Aggregation Logic

Create backend logic to aggregate data from new districts to parents:

```javascript
// Example: When API returns data for "Malerkotla"
// Aggregate it to "Sangrur" for map visualization
if (newDistrictsAggregation[districtKey]) {
  const parents = newDistrictsAggregation[districtKey].parentDistricts;
  parents.forEach(parent => {
    // Add Malerkotla data to Sangrur
    aggregateData(parent, districtData);
  });
}
```

### 🟢 LOW PRIORITY: Update GeoJSON

Long-term solution: Source a post-2023 GeoJSON file with all 741 districts.

---

## Expected Final Coverage

### If we find the 8 missing districts:
- **Mappings**: 709 + 8 = **717**
- **Excluded**: 26 - 8 = **18** (15 new + 2 non-districts + 1 wrong state)
- **Coverage**: **97.55%** 🎯

### With aggregation implemented:
- **Effective Coverage**: **100%** ✅
- All data visualized (new districts aggregated to parents)

---

## Next Steps

1. **Search for 8 missing districts** with alternate spellings
2. **Fix Unakoti wrong state** assignment
3. **Implement aggregation logic** in backend
4. **Test map** - should show 709+ districts
5. **Source updated GeoJSON** for long-term solution

---

**Status**: 96.46% coverage achieved  
**Remaining**: 26 districts (15 new, 8 missing, 2 non-districts, 1 wrong state)  
**Next Goal**: 97.55% with 8 missing districts found  
**Ultimate Goal**: 100% effective coverage with aggregation
