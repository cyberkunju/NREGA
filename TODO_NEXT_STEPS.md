# TODO: Next Steps

## ✅ COMPLETED
- [x] Implemented researcher's findings
- [x] Added 19 districts (16 + 3)
- [x] Fixed 3 wrong state errors
- [x] Achieved 96.87% coverage (712/735 districts)
- [x] Documented 15 new districts with parent aggregation
- [x] Restarted Docker services

---

## 🔴 IMMEDIATE PRIORITY

### 1. Test the Map
**Action**: Open http://localhost:3000 and verify:
- Map loads correctly
- 712 districts are colored (not white)
- Hover tooltips show correct data
- Search works for newly added districts

**Test Districts**:
- Narmadapuram (Madhya Pradesh) - should show data
- Beed (Maharashtra) - should show data
- Unakoti (Tripura) - should show data
- Neemuch (Madhya Pradesh) - should show data

---

## 🟡 SHORT-TERM (This Week)

### 2. Implement Aggregation Logic for New Districts

**File**: `backend/routes/performance.js`

**What to do**: Add logic to aggregate data from 15 new districts to their parents

**Example**:
```javascript
// Load aggregation mapping
const newDistrictsAggregation = {
  'punjab:malerkotla': { parentDistricts: ['sangrur'] },
  'tamil nadu:ranipet': { parentDistricts: ['vellore'] },
  // ... etc (15 total)
};

// In your data processing function
function processDistrictData(apiData) {
  const aggregated = {};
  
  apiData.forEach(record => {
    const key = `${record.state}:${record.district}`.toLowerCase();
    
    // Check if this is a new district
    if (newDistrictsAggregation[key]) {
      // Aggregate to parent(s)
      const parents = newDistrictsAggregation[key].parentDistricts;
      parents.forEach(parent => {
        const parentKey = `${record.state}:${parent}`.toLowerCase();
        // Add this district's data to parent
        if (!aggregated[parentKey]) {
          aggregated[parentKey] = initializeDistrict(record.state, parent);
        }
        aggregated[parentKey].totalEmployment += record.totalEmployment;
        aggregated[parentKey].totalWages += record.totalWages;
        // ... sum all metrics
      });
    } else {
      // Regular district - use as-is
      aggregated[key] = record;
    }
  });
  
  return Object.values(aggregated);
}
```

**Expected Result**: 
- New districts' data will be visible on map (aggregated to parents)
- Effective coverage: 98.91% (727/735 districts)

---

## 🟢 MEDIUM-TERM (This Month)

### 3. Handle the 5 Missing Districts

**Districts**:
1. Chatrapati Sambhaji Nagar (Maharashtra)
2. Dharashiv (Maharashtra)
3. Rae Bareli (Uttar Pradesh)
4. Narsinghpur (Madhya Pradesh)
5. Anantapur (Andhra Pradesh)

**Options**:

**Option A: Find Approximate Locations**
- Manually create polygon coordinates for these 5 districts
- Add them to a custom GeoJSON overlay
- Requires geographic knowledge

**Option B: Aggregate to Nearby Districts**
- Research which districts these were carved from
- Aggregate their data to parent/nearby districts
- Document the aggregation

**Option C: Wait for Updated GeoJSON**
- Source a post-2023 GeoJSON file
- Replace the entire file
- **RECOMMENDED** long-term solution

---

## 🔵 LONG-TERM (Next Quarter)

### 4. Source Updated GeoJSON File

**Requirements**:
- Must include all 741 districts as of 2025
- Must include post-2019 districts (Malerkotla, Vijayanagara, etc.)
- Must include renamed districts (Chatrapati Sambhaji Nagar, Dharashiv)
- Should be from official government source

**Potential Sources**:
1. **Survey of India** - Official mapping authority
2. **DataMeet** - Open data community (datameet.org)
3. **GADM** - Global administrative areas database
4. **OpenStreetMap** - Community-maintained boundaries
5. **Government GIS Portals** - State/national GIS systems

**Action**: Research and evaluate these sources for accuracy and completeness

---

## 📊 Current Status Summary

| Metric | Value | Notes |
|---|---|---|
| **Mapped Districts** | 712 | Can be visualized now |
| **New Districts** | 15 | Need aggregation logic |
| **Missing from GeoJSON** | 5 | Need updated GeoJSON |
| **Non-Districts** | 3 | Correctly excluded |
| **Current Coverage** | 96.87% | Immediate |
| **With Aggregation** | 98.91% | After step 2 |
| **With Updated GeoJSON** | 99.59% | After step 4 |

---

## 🎯 Success Criteria

### Phase 1 (Immediate) ✅
- [x] 96.87% coverage achieved
- [ ] Map displays 712 districts correctly
- [ ] All newly added districts show data

### Phase 2 (Short-term)
- [ ] Aggregation logic implemented
- [ ] 98.91% effective coverage
- [ ] All 15 new districts' data visible (via parents)

### Phase 3 (Long-term)
- [ ] Updated GeoJSON sourced
- [ ] 99.59% coverage (730/735 districts)
- [ ] Only 2 non-districts excluded

---

## 📝 Notes

### What the Researcher Taught Us:
1. **Temporal Divide**: Data sources from different time periods cause mismatches
2. **Three Categories**: Mappable (aliases), New (aggregate), Exclude (non-districts)
3. **Root Cause**: Obsolete GeoJSON file is the fundamental problem
4. **Sustainable Solution**: Must update GeoJSON, not just patch mappings

### Key Insight:
> "This is not a mapping problem. This is a data source problem."

The researcher was 100% correct. We've patched what we can, but the real solution is updating the GeoJSON file.

---

## 🚀 Quick Start

1. **Test Now**: Open http://localhost:3000
2. **Next Task**: Implement aggregation logic (see step 2 above)
3. **Long-term**: Source updated GeoJSON (see step 4 above)

---

**Last Updated**: October 31, 2025  
**Status**: 96.87% coverage achieved, aggregation logic pending  
**Next Milestone**: 98.91% with aggregation
