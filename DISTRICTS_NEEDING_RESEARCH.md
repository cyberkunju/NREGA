# 🔍 Districts Needing Manual Research

**Purpose:** This document lists ALL districts where we're uncertain about the mapping (even 1%). Please research each one and provide the correct GeoJSON district name and geoId.

**Total Districts Needing Research: 50**

---

## Category 1: Uncertain Fallback Matches (8 districts)

These districts have potential matches in GeoJSON but we're not 100% sure they're correct.

### 1. Sarangarh Bilaigarh, Bihar

**API Data:**
- District Name: `Sarangarh Bilaigarh`
- State: `Bihar`
- Normalized Key: `bihar:sarangarh bilaigarh`

**Potential GeoJSON Match:**
- District: `SARAN`
- State: `BIHAR`
- GeoId: `392`

**Confidence:** ⚠️ UNCERTAIN - Partial name match

**Your Research:**
- [ ] Is this correct? (Yes/No): ___________
- [ ] If No, correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 2. Narmadapuram, Gujarat

**API Data:**
- District Name: `Narmadapuram`
- State: `Gujarat` ⚠️ (This looks like a data quality issue - should be Madhya Pradesh!)
- Normalized Key: `gujarat:narmadapuram`

**Potential GeoJSON Match:**
- District: `NARMADA`
- State: `GUJARAT`
- GeoId: `683`

**Confidence:** ⚠️ UNCERTAIN - Partial name match + Wrong state issue

**Your Research:**
- [ ] Is Narmadapuram actually in Gujarat or Madhya Pradesh?: ___________
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 3. Unakoti, Himachal Pradesh

**API Data:**
- District Name: `Unakoti`
- State: `Himachal Pradesh` ⚠️ (Unakoti is actually in Tripura!)
- Normalized Key: `himachal pradesh:unakoti`

**Potential GeoJSON Match:**
- District: `UNA`
- State: `HIMACHAL PRADESH`
- GeoId: `560`

**Confidence:** ⚠️ UNCERTAIN - Partial name match + Wrong state issue

**Your Research:**
- [ ] Is Unakoti in Himachal Pradesh or Tripura?: ___________
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 4. Chatrapati Sambhaji Nagar, Jharkhand

**API Data:**
- District Name: `Chatrapati Sambhaji Nagar`
- State: `Jharkhand` ⚠️ (This is actually in Maharashtra!)
- Normalized Key: `jharkhand:chatrapati sambhaji nagar`

**Potential GeoJSON Match:**
- District: `CHATRA`
- State: `JHARKHAND`
- GeoId: `302`

**Confidence:** ❌ LIKELY WRONG - Different names + Wrong state

**Your Research:**
- [ ] Is Chatrapati Sambhaji Nagar in Jharkhand or Maharashtra?: ___________
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 5. Dharashiv, Madhya Pradesh

**API Data:**
- District Name: `Dharashiv`
- State: `Madhya Pradesh` ⚠️ (Dharashiv is actually in Maharashtra!)
- Normalized Key: `madhya pradesh:dharashiv`

**Potential GeoJSON Match:**
- District: `DHAR`
- State: `MADHYA PRADESH`
- GeoId: `253`

**Confidence:** ❌ LIKELY WRONG - Different names + Wrong state

**Your Research:**
- [ ] Is Dharashiv in Madhya Pradesh or Maharashtra?: ___________
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 6. Jayashanker Bhopalapally, Madhya Pradesh

**API Data:**
- District Name: `Jayashanker Bhopalapally`
- State: `Madhya Pradesh` ⚠️ (This is actually in Telangana!)
- Normalized Key: `madhya pradesh:jayashanker bhopalapally`

**Potential GeoJSON Match:**
- District: `BHOPAL`
- State: `MADHYA PRADESH`
- GeoId: `280`

**Confidence:** ❌ LIKELY WRONG - Different names + Wrong state

**Your Research:**
- [ ] Is Jayashanker Bhopalapally in Madhya Pradesh or Telangana?: ___________
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 7. Siddharth Nagar, Madhya Pradesh

**API Data:**
- District Name: `Siddharth Nagar`
- State: `Madhya Pradesh` ⚠️ (Siddharth Nagar is actually in Uttar Pradesh!)
- Normalized Key: `madhya pradesh:siddharth nagar`

**Potential GeoJSON Match:**
- District: `DHAR`
- State: `MADHYA PRADESH`
- GeoId: `253`

**Confidence:** ❌ LIKELY WRONG - Different names + Wrong state

**Your Research:**
- [ ] Is Siddharth Nagar in Madhya Pradesh or Uttar Pradesh?: ___________
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 8. Eastern West Khasi Hills, Meghalaya

**API Data:**
- District Name: `Eastern West Khasi Hills`
- State: `Meghalaya`
- Normalized Key: `meghalaya:eastern west khasi hills`

**Potential GeoJSON Matches (Multiple!):**
1. EAST GARO HILLS (geoId: 6)
2. EAST KHASI HILLS (geoId: 2)
3. EAST JAINTIA HILLS (geoId: 3)
4. SOUTH GARO HILLS (geoId: 1)
5. WEST GARO HILLS (geoId: 5)
6. WEST KHASI HILLS (geoId: 4)
7. SOUTH WEST KHASI HILLS (geoId: 672)
8. SOUTH WEST GARO HILLS (geoId: 673)
9. NORTH GARO HILLS (geoId: 674)
10. WEST JAINTIA HILLS (geoId: 575)

**Confidence:** ❌ LIKELY WRONG - Too many potential matches

**Your Research:**
- [ ] Correct GeoJSON district: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

## Category 2: New Districts Not in GeoJSON (34 districts)

These districts exist in the API but NOT in the GeoJSON map file. They cannot be displayed unless we get an updated GeoJSON with their boundaries.

### 9. North And Middle Andaman, Andaman And Nicobar
**Status:** New district, not in GeoJSON
**Action:** Mark as excluded OR find if it's a renamed district
**Your Research:**
- [ ] Is this a new district or renamed?: ___________
- [ ] If renamed, old name: ___________
- [ ] If in GeoJSON, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 10. Anantapur, Andhra Pradesh
**Status:** Not in GeoJSON (but should be - it's a major district!)
**Action:** Find the correct GeoJSON name
**Your Research:**
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________
- [ ] Notes: ___________

---

### 11. Bajali, Assam
**Status:** New district (created 2020)
**Action:** Confirm it's not in GeoJSON
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 12. Tamulpur, Assam
**Status:** New district (created 2020)
**Action:** Confirm it's not in GeoJSON
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 13. Kawardha, Chhattisgarh
**Status:** Renamed to Kabirdham
**Action:** Check if GeoJSON has Kabirdham
**Your Research:**
- [ ] Is "Kabirdham" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 14. Khairagarh Chhuikhadan Gandai, Chhattisgarh
**Status:** New district (created 2021)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 15. Manendragarh Chirmiri Bharatpur, Chhattisgarh
**Status:** New district (created 2021)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 16. Mohla Manpur Ambagarh Chowki, Chhattisgarh
**Status:** New district (created 2021)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 17. Sakti, Chhattisgarh
**Status:** New district (created 2021)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 18. Dadra And Nagar Haveli, Dn Haveli And Dd
**Status:** Should be in GeoJSON
**Your Research:**
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 19. Dohad, Gujarat
**Status:** Spelling variation of Dahod
**Your Research:**
- [ ] Is "Dahod" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 20. Poonch, Jammu And Kashmir
**Status:** Spelling variation of Punch
**Your Research:**
- [ ] Is "Punch" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 21. Vijayanagara, Karnataka
**Status:** New district (created 2021)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 22. Khandwa, Madhya Pradesh
**Status:** Also known as East Nimar
**Your Research:**
- [ ] Is "East Nimar" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 23. Khargone, Madhya Pradesh
**Status:** Also known as West Nimar
**Your Research:**
- [ ] Is "West Nimar" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 24. Narsinghpur, Madhya Pradesh
**Status:** Spelling variation
**Your Research:**
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 25. Neemuch, Madhya Pradesh
**Status:** Spelling variation of Nimach
**Your Research:**
- [ ] Is "Nimach" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 26. Beed, Maharashtra
**Status:** Spelling variation of Bid
**Your Research:**
- [ ] Is "Bid" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 27. Boudh, Odisha
**Status:** Spelling variation of Baudh
**Your Research:**
- [ ] Is "Baudh" or "Bauda" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 28. Sonepur, Odisha
**Status:** Also known as Subarnapur
**Your Research:**
- [ ] Is "Subarnapur" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 29. Pondicherry, Puducherry
**Status:** Renamed to Puducherry
**Your Research:**
- [ ] Is "Puducherry" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 30. Malerkotla, Punjab
**Status:** New district (created 2021)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 31. Mukatsar, Punjab
**Status:** Spelling variation of Sri Muktsar Sahib
**Your Research:**
- [ ] Is "Sri Muktsar Sahib" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 32. Nawanshahr, Punjab
**Status:** Also known as Shahid Bhagat Singh Nagar
**Your Research:**
- [ ] Is "Shahid Bhagat Singh Nagar" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 33. Ropar, Punjab
**Status:** Also known as Rupnagar
**Your Research:**
- [ ] Is "Rupnagar" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 34. Pakyong, Sikkim
**Status:** New district (created 2019)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 35. Soreng, Sikkim
**Status:** New district (created 2019)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 36. Mayiladuthurai, Tamil Nadu
**Status:** New district (created 2020)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 37. Ranipet, Tamil Nadu
**Status:** New district (created 2019)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 38. Thoothukkudi, Tamil Nadu
**Status:** Also known as Tuticorin
**Your Research:**
- [ ] Is "Tuticorin" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 39. Hanumakonda, Telangana
**Status:** New district (created 2019)
**Your Research:**
- [ ] Is this in GeoJSON?: ___________
- [ ] If yes, correct district name: ___________
- [ ] Correct geoId: ___________

---

### 40. Kumram Bheem(Asifabad), Telangana
**Status:** Spelling variation
**Your Research:**
- [ ] Is "Kumuram Bheem" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 41. Rae Bareli, Uttar Pradesh
**Status:** Spelling variation of Raibeareli
**Your Research:**
- [ ] Is "Raibeareli" or "Raebareli" in GeoJSON?: ___________
- [ ] Correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

### 42. Siliguri Mahakuma Parisad, West Bengal
**Status:** Administrative division, not a district
**Your Research:**
- [ ] Is this actually a district?: ___________
- [ ] If yes, correct GeoJSON district name: ___________
- [ ] Correct geoId: ___________

---

## Category 3: Mystery Districts (12 districts)

These are showing on the map (part of the 713) but we don't know which ones they are. They're being matched by fuzzy fallback and might be WRONG.

**We need to identify these 12 districts by checking the map!**

Expected: 693 (perfect) + 8 (uncertain) = 701
Actual: 713
Mystery: 713 - 701 = 12

**Action Required:**
1. Check the browser console for which districts are using "Fallback" match
2. List them here
3. Verify if they're showing correct data

---

## How to Research

### For Each District:

1. **Google Search:** "[District Name] [State Name] India"
2. **Check Wikipedia:** Look for official district information
3. **Census of India:** https://censusindia.gov.in/
4. **Check GeoJSON:** Search in `frontend/public/india-districts.geojson`
5. **Verify State:** Make sure the district is in the correct state!

### Common Issues to Watch For:

- ⚠️ **Wrong State:** API might have district in wrong state (e.g., Narmadapuram in Gujarat instead of MP)
- ⚠️ **Renamed Districts:** Old name in GeoJSON, new name in API
- ⚠️ **Spelling Variations:** Beed/Bid, Neemuch/Nimach, etc.
- ⚠️ **New Districts:** Created after 2018 might not be in GeoJSON
- ⚠️ **Merged Districts:** Some districts were merged or split

### How to Find geoId:

```bash
# Search in GeoJSON file
grep -i "district_name" frontend/public/india-districts.geojson
```

Or open the file and search for the district name, then find the "id" property.

---

## Submission Format

Once you've researched all districts, please provide:

```
District: [API Name], [API State]
Correct GeoJSON: [GeoJSON Name]
GeoId: [number]
Notes: [Any additional information]
Action: [ADD_TO_MAPPING / EXCLUDE / ALREADY_MAPPED]
```

---

## Summary

**Total Districts Needing Research: 50**
- 8 Uncertain fallback matches
- 34 New districts (might be in GeoJSON with different names)
- 8 Already identified as wrong state

**Priority:**
1. HIGH: Districts 1-8 (uncertain fallback - might be showing wrong data NOW)
2. MEDIUM: Districts 9-42 (new districts - not showing, but could be added)
3. LOW: Mystery 12 districts (need to identify first)

**Goal:** 100% accuracy with maximum coverage!

---

**Last Updated:** ${new Date().toISOString()}
**Status:** AWAITING YOUR RESEARCH
