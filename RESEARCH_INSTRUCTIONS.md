# 📋 District Mapping Research - Instructions

## What You Need to Do

We're building a district mapping system for India's MGNREGA data. We have **50 districts** where we're not 100% sure about the correct mapping. Your job is to research each one and tell us the correct information.

## Files You Have

1. **DISTRICTS_NEEDING_RESEARCH.md** - Main file with all 50 districts to research
2. **all-districts-statewise.txt** - Complete list of districts from government API
3. **geojson-districts.json** - List of districts in our map file
4. **frontend/public/india-districts.geojson** - Full map file (if you need to search for geoIds)

## What to Research for Each District

For each district in `DISTRICTS_NEEDING_RESEARCH.md`, fill in:

1. **Is the state correct?** (Many districts are listed under wrong states!)
2. **What's the correct GeoJSON district name?** (Check geojson-districts.json)
3. **What's the geoId?** (The unique ID number for that district in the map)
4. **Any notes?** (Renamed, new district, spelling variation, etc.)

## How to Research

### Step 1: Verify the State
- Google: "[District Name] India district"
- Check Wikipedia
- **IMPORTANT:** Many districts in our data are in the WRONG STATE!

Example:
- API says: "Narmadapuram, Gujarat"
- Reality: Narmadapuram is in Madhya Pradesh, not Gujarat!

### Step 2: Find the GeoJSON Name
- Open `geojson-districts.json`
- Search for the district name (Ctrl+F)
- Try variations: "Beed" might be "BID", "Neemuch" might be "NIMACH"

### Step 3: Find the geoId
- Once you find the district in `geojson-districts.json`, note its position
- Or search in `frontend/public/india-districts.geojson` for the exact geoId

### Step 4: Fill in the Checkboxes
In `DISTRICTS_NEEDING_RESEARCH.md`, fill in:
```
- [x] Is this correct? (Yes/No): No
- [x] If No, correct GeoJSON district: NARMADAPURAM
- [x] Correct geoId: 245
- [x] Notes: API has wrong state - should be Madhya Pradesh, not Gujarat
```

## Priority Order

### HIGH PRIORITY (Do First) ⚠️
**Districts 1-8** - These might be showing WRONG data on the map RIGHT NOW!
- Sarangarh Bilaigarh, Bihar
- Narmadapuram, Gujarat
- Unakoti, Himachal Pradesh
- Chatrapati Sambhaji Nagar, Jharkhand
- Dharashiv, Madhya Pradesh
- Jayashanker Bhopalapally, Madhya Pradesh
- Siddharth Nagar, Madhya Pradesh
- Eastern West Khasi Hills, Meghalaya

### MEDIUM PRIORITY
**Districts 9-42** - These are not showing on the map, but could be added

### LOW PRIORITY
**Mystery 12 districts** - We need to identify these first

## Common Issues to Watch For

### 1. Wrong State in API ⚠️
Many districts are listed under the wrong state in the API data!

**Examples:**
- Narmadapuram listed as Gujarat (should be Madhya Pradesh)
- Unakoti listed as Himachal Pradesh (should be Tripura)
- Chatrapati Sambhaji Nagar listed as Jharkhand (should be Maharashtra)

### 2. Renamed Districts
Some districts have been renamed recently:

**Examples:**
- Kawardha → Kabirdham (Chhattisgarh)
- Pondicherry → Puducherry
- Aurangabad → Chatrapati Sambhaji Nagar (Maharashtra)

### 3. Spelling Variations
Same district, different spelling:

**Examples:**
- Beed / Bid (Maharashtra)
- Neemuch / Nimach (Madhya Pradesh)
- Dohad / Dahod (Gujarat)
- Mukatsar / Sri Muktsar Sahib (Punjab)

### 4. New Districts (Created 2019-2021)
These might not be in the GeoJSON map:

**Examples:**
- Bajali, Assam (created 2020)
- Tamulpur, Assam (created 2020)
- Pakyong, Sikkim (created 2019)
- Soreng, Sikkim (created 2019)
- Vijayanagara, Karnataka (created 2021)

### 5. Alternative Names
Some districts have multiple official names:

**Examples:**
- Khandwa = East Nimar (Madhya Pradesh)
- Khargone = West Nimar (Madhya Pradesh)
- Sonepur = Subarnapur (Odisha)
- Thoothukkudi = Tuticorin (Tamil Nadu)

## Research Resources

### Online Resources
1. **Wikipedia:** Search "[District Name] district India"
2. **Census of India:** https://censusindia.gov.in/
3. **District Codes:** https://lgdirectory.gov.in/
4. **Google Maps:** Verify district location and state

### Files Provided
1. **geojson-districts.json** - Quick reference list of all districts in map
2. **all-districts-statewise.txt** - All districts from government API
3. **india-districts.geojson** - Full map file with geoIds

## How to Submit Your Research

### Option 1: Fill in the Markdown File
Edit `DISTRICTS_NEEDING_RESEARCH.md` directly and fill in all checkboxes.

### Option 2: Create a Spreadsheet
Create an Excel/Google Sheet with columns:
- API District Name
- API State
- Correct State (if different)
- GeoJSON District Name
- GeoId
- Notes
- Action (ADD_TO_MAPPING / EXCLUDE / ALREADY_MAPPED)

### Option 3: Simple Text File
Create a text file with format:
```
1. Sarangarh Bilaigarh, Bihar
   Correct: SARAN, BIHAR
   GeoId: 392
   Notes: Partial name match, verify if correct
   Action: ADD_TO_MAPPING

2. Narmadapuram, Gujarat
   Correct: HOSHANGABAD, MADHYA PRADESH
   GeoId: 245
   Notes: API has wrong state - should be MP not Gujarat
   Action: ADD_TO_MAPPING
```

## Example: Complete Research Entry

### Before (Uncertain):
```
### 2. Narmadapuram, Gujarat

**API Data:**
- District Name: `Narmadapuram`
- State: `Gujarat` ⚠️
- Normalized Key: `gujarat:narmadapuram`

**Potential GeoJSON Match:**
- District: `NARMADA`
- State: `GUJARAT`
- GeoId: `683`

**Confidence:** ⚠️ UNCERTAIN

**Your Research:**
- [ ] Is Narmadapuram actually in Gujarat or Madhya Pradesh?: ___________
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________
```

### After (Researched):
```
### 2. Narmadapuram, Gujarat

**API Data:**
- District Name: `Narmadapuram`
- State: `Gujarat` ⚠️
- Normalized Key: `gujarat:narmadapuram`

**Potential GeoJSON Match:**
- District: `NARMADA`
- State: `GUJARAT`
- GeoId: `683`

**Confidence:** ⚠️ UNCERTAIN

**Your Research:**
- [x] Is Narmadapuram actually in Gujarat or Madhya Pradesh?: MADHYA PRADESH
- [x] Correct GeoJSON district: HOSHANGABAD
- [x] Correct geoId: 245
- [x] Notes: Narmadapuram is the new name for Hoshangabad district in Madhya Pradesh. API has wrong state (Gujarat). Should map to HOSHANGABAD, MADHYA PRADESH with geoId 245.
```

## Questions?

If you're stuck on any district:
1. Mark it as "NEEDS MORE RESEARCH"
2. Add notes about what you found
3. Move to the next one
4. We'll review together later

## Goal

**100% accuracy** - Every district must map to the correct location on the map!

Better to mark something as "UNCERTAIN" than to guess wrong.

---

**Estimated Time:** 2-3 hours for all 50 districts
**Priority:** Focus on districts 1-8 first (HIGH PRIORITY)
**Deadline:** [Add your deadline here]

Good luck! 🎯
