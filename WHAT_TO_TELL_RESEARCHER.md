# 💬 What to Tell Your Researcher

## Simple Explanation

"Hey! We're building a map that shows MGNREGA data for all districts in India. We have 735 districts from the government API, but we're not 100% sure about 50 of them. 

Some districts might be in the wrong state, some have spelling variations, and some are new districts that might not be in our map file.

I need you to research these 50 districts and tell me the correct information so we can map them accurately."

## Files to Send

### Essential Files (Must Send):
1. ✅ **RESEARCH_PACKAGE_README.md** - Overview of the package
2. ✅ **RESEARCH_INSTRUCTIONS.md** - Detailed instructions
3. ✅ **DISTRICTS_NEEDING_RESEARCH.md** - Main work file (50 districts to research)
4. ✅ **all-districts-statewise.txt** - Reference list of API districts
5. ✅ **geojson-districts.json** - Reference list of map districts

### Optional Files (Nice to Have):
6. ⭐ **frontend/public/india-districts.geojson** - Full map file (only if they need geoIds)

## What to Say

### Email Template:

```
Subject: District Mapping Research - Need Your Help

Hi [Name],

I need your help with a research task for our MGNREGA district mapping project.

WHAT WE NEED:
We have 50 districts where we're not 100% sure about the correct mapping. 
I need you to research each one and verify:
- Is the state correct? (Many are in the wrong state!)
- What's the correct district name in our map?
- What's the geoId (unique ID number)?

TIME REQUIRED:
- HIGH PRIORITY (8 districts): 30-45 minutes
- MEDIUM PRIORITY (34 districts): 1.5-2 hours
- TOTAL: 2-3 hours

PRIORITY:
Please start with districts 1-8 (HIGH PRIORITY) - these might be showing 
wrong data on our map right now!

FILES ATTACHED:
1. RESEARCH_PACKAGE_README.md - Start here for overview
2. RESEARCH_INSTRUCTIONS.md - Detailed instructions
3. DISTRICTS_NEEDING_RESEARCH.md - Main work file
4. all-districts-statewise.txt - Reference
5. geojson-districts.json - Reference

HOW TO DO IT:
1. Read RESEARCH_INSTRUCTIONS.md first
2. Open DISTRICTS_NEEDING_RESEARCH.md
3. For each district, Google it and verify the information
4. Fill in the checkboxes with correct information
5. Send back the completed file

COMMON ISSUES:
- Many districts are in the WRONG STATE (e.g., "Narmadapuram" listed as 
  Gujarat but it's actually in Madhya Pradesh)
- Some districts have been renamed (e.g., Kawardha → Kabirdham)
- Some are spelling variations (e.g., Beed vs Bid)

GOAL:
100% accuracy - every district must map to the correct location!

Let me know if you have any questions!

Thanks,
[Your Name]
```

## What They'll Do

1. **Read instructions** (5 minutes)
2. **Research each district** (2-3 hours)
   - Google the district name
   - Verify the state
   - Find correct name in geojson-districts.json
   - Fill in checkboxes
3. **Submit completed file**

## What You'll Get Back

A completed `DISTRICTS_NEEDING_RESEARCH.md` file with:
- ✅ Checkboxes filled in
- ✅ Correct GeoJSON district names
- ✅ Correct geoIds
- ✅ Notes about each district

## What We'll Do Next

Once you get the research back:
1. I'll update the perfect mapping file
2. Add verified districts
3. Exclude districts not in GeoJSON
4. Restart Docker and test
5. Achieve 100% accuracy! 🎯

## If They Have Questions

### Q: "How do I find the geoId?"
**A:** Search for the district name in `geojson-districts.json`. The geoId is the "id" field. If you can't find it, just put the correct district name and we'll find the geoId later.

### Q: "The district isn't in geojson-districts.json"
**A:** Mark it as "NEW DISTRICT - NOT IN GEOJSON" and move on. These are districts created after 2018 that aren't in our map file yet.

### Q: "I'm not sure about a district"
**A:** Mark it as "UNCERTAIN" with notes about what you found. Better to be honest than to guess!

### Q: "This is taking too long"
**A:** Focus on HIGH PRIORITY (districts 1-8) first. Those are the most critical. The rest can wait.

## Expected Results

After research:
- **~40 districts** will be verified and added to mapping
- **~10 districts** will be marked as "NEW DISTRICT - NOT IN GEOJSON"
- **Result:** 100% accuracy with maximum possible coverage!

---

**Bottom Line:** Send them the 5 essential files and the email template above. They should be able to complete the research in 2-3 hours.
