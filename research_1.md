

# **MGNREGA District Mapping: Data Integrity and Geospatial Resolution Report**

## **Executive Summary: Key Findings and Strategic Recommendations**

This report presents a comprehensive analysis of the 50+ district-level discrepancies identified in the MGNREGA data mapping project. The primary source of error is a fundamental **temporal misalignment** between the project's data sources.

The government API list (all-districts-statewise.txt) is highly contemporary, dated October 2025, and includes newly created districts (post-2019) and recent official name changes.1 Conversely, the project's geospatial map file (geojson-districts.json) is obsolete, appearing to predate 2019\. This file lacks these new geographies and references only older district nomenclature.

Furthermore, the "Wrong State" errors (e.g., Narmadapuram, Gujarat) provided in the research instructions indicate the project is referencing *at least two* conflicting API lists.1 The provided all-districts-statewise.txt file is significantly more accurate (it correctly places NARMADAPURAM in MADHYA PRADESH 1), but it is also flawed, containing non-district entities (e.g., Siliguri Mahakuma Parishad) and data contradictions.

All 50+ district-level problems fall into two distinct categories:

1. **Mappable (Requires Aliasing):** These are districts that exist in the current map file but are referenced under an *old name* (e.g., the API lists Dharashiv, while the map file contains Osmanabad) or a *spelling variation* (e.g., API lists Beed, map file uses BID).  
2. **Not Mappable (New Districts):** These are new administrative units created after 2019 (e.g., Sarangarh Bilaigarh, Malerkotla, Vijayanagara). These districts *do not exist* in the obsolete GeoJSON file and cannot be mapped.

**Strategic Recommendations:**

1. **Immediate Action (Mapping):** Implement the **Master Alias Table** provided in this report (see Appendix). This will create a dictionary to normalize all "Mappable" district names, linking modern API names to their obsolete counterparts in the GeoJSON file.  
2. **Immediate Action (Data Visualization):** For all "Not Mappable" new districts, the MGNREGA data *must* be programmatically aggregated to their respective **parent district** to be visualized (e.g., Malerkotla data must be added to Sangrur). This prevents data loss on the map.  
3. **Long-Term Solution:** The project *must* source an updated, post-2023 GeoJSON file that includes the polygons for all 741 districts. Relying on an obsolete map file is unsustainable and guarantees future data-mapping failures.

---

## **Part 1: Resolution of High-Priority Districts**

This section provides a case-by-case analysis and resolution for the 8 high-priority districts identified in the project's research file.1 The "API State" listed here reflects the *erroneous* state provided in the problem file, which is the primary issue to be corrected.

### **1.1. District: Sarangarh Bilaigarh**

* **API State (Erroneous):** Bihar.1  
* **API Error Analysis:** The district is incorrectly assigned to Bihar.  
* **Verification:**  
  * **Correct State:** Chhattisgarh.1  
  * **Nature of District:** This is a **new district**. It was officially created on September 3, 2022 2, having been carved from the existing districts of Raigarh and Baloda Bazar.3  
* **Mapping Resolution:**  
  * **Status:** NOT MAPPABLE.  
  * **Reason:** As a new district created in late 2022, it will not exist in the pre-2019 GeoJSON map file. Reference searches in the GeoJSON snippets confirm its absence.1  
  * **Recommendation:**  
    1. Correct the state from Bihar to Chhattisgarh.  
    2. To visualize its MGNREGA data, this data must be aggregated with its parent districts: Raigarh and Baloda Bazar.

### **1.2. District: Narmadapuram**

* **API State (Erroneous):** Gujarat.1  
* **API Error Analysis:** The district is incorrectly assigned to Gujarat. This is likely a confusion with the Narmada district, which is in Gujarat.  
* **Verification:**  
  * **Correct State:** Madhya Pradesh.1  
  * **Nature of District:** This is a **renamed district**. Its former and widely known name is Hoshangabad.8 The official name change to Narmadapuram was finalized on February 7, 2022\.8  
* **Mapping Resolution:**  
  * **Status:** MAPPABLE (WITH ALIAS).  
  * **Reason:** The API uses the new name (Narmadapuram), while the obsolete map file will *only* contain the old name (Hoshangabad). Reference searches confirm Narmadapuram is missing from the GeoJSON snippets.1  
  * **Recommendation:**  
    1. Correct the state from Gujarat to Madhya Pradesh.  
    2. Add an alias to the mapping logic: **Map API Narmadapuram to GeoJSON Hoshangabad**.

### **1.3. District: Unakoti**

* **API State (Erroneous):** Himachal Pradesh.1  
* **API Error Analysis:** The district is incorrectly assigned to Himachal Pradesh.  
* **Verification:**  
  * **Correct State:** Tripura.1  
  * **Nature of District:** This is an established district, created on January 21, 2012 11, by bifurcating the North Tripura district.  
* **Mapping Resolution:**  
  * **Status:** LIKELY MAPPABLE.  
  * **Reason:** As a 2012 creation, it is not a recent change and should be in most map files. The provided GeoJSON snippets are incomplete and contain no Tripura data.1  
  * **Recommendation:**  
    1. Correct the state from Himachal Pradesh to Tripura.  
    2. Search the geojson-districts.json file for Unakoti to find its geoId. If it is missing, the map file is severely outdated, and data should be aggregated to its parent, North Tripura.

### **1.4. District: Chatrapati Sambhaji Nagar**

* **API State (Erroneous):** Jharkhand.1  
* **API Error Analysis:** The district is incorrectly assigned to Jharkhand.  
* **Verification:**  
  * **Correct State:** Maharashtra.1  
  * **Nature of District:** This is a **renamed district**. Its former name is Aurangabad.15 The name change was officially finalized in September 2023\.18  
* **Mapping Resolution:**  
  * **Status:** MAPPABLE (WITH ALIAS).  
  * **Reason:** The API uses the new name. The map file will *only* contain the old name, Aurangabad.  
  * **Recommendation:**  
    1. Correct the state from Jharkhand to Maharashtra.  
    2. Add an alias to the mapping logic: **Map API Chatrapati Sambhaji Nagar to GeoJSON Aurangabad**.

### **1.5. District: Dharashiv**

* **API State (Erroneous):** Madhya Pradesh.1  
* **API Error Analysis:** The district is incorrectly assigned to Madhya Pradesh.  
* **Verification:**  
  * **Correct State:** Maharashtra.1  
  * **Nature of District:** This is a **renamed district**. Its former name is Osmanabad.21 The name change was officially finalized in February 2023 24 and ratified in September 2023\.25  
* **Mapping Resolution:**  
  * **Status:** MAPPABLE (WITH ALIAS).  
  * **Reason:** The API uses the new name. The map file will *only* contain the old name, Osmanabad.  
  * **Recommendation:**  
    1. Correct the state from Madhya Pradesh to Maharashtra.  
    2. Add an alias to the mapping logic: **Map API Dharashiv to GeoJSON Osmanabad**.

### **1.6. District: Jayashanker Bhopalapally**

* **API State (Erroneous):** Madhya Pradesh.1  
* **API Error Analysis:** The district is incorrectly assigned to Madhya Pradesh.  
* **Verification:**  
  * **Correct State:** Telangana.1  
  * **Nature of District:** This is an established district, created on October 11, 2016 27, from the parent Warangal district. The API list also has a spelling variation (Jayashanker Bhopalapally) 1, while official sources use Jayashankar Bhupalpally.27  
* **Mapping Resolution:**  
  * **Status:** LIKELY MAPPABLE.  
  * **Reason:** As a 2016 district, it should be in the map file.  
  * **Recommendation:**  
    1. Correct the state from Madhya Pradesh to Telangana.  
    2. Add an alias for spelling: **Map API Jayashanker Bhopalapally to GeoJSON Jayashankar Bhupalpally**.

### **1.7. District: Siddharth Nagar**

* **API State (Erroneous):** Madhya Pradesh.1  
* **API Error Analysis:** The district is incorrectly assigned to Madhya Pradesh.  
* **Verification:**  
  * **Correct State:** Uttar Pradesh.1  
  * **Nature of District:** This is an established district in Uttar Pradesh. No such district exists in Madhya Pradesh.30  
* **Mapping Resolution:**  
  * **Status:** MAPPABLE.  
  * **Reason:** This is a straightforward "Wrong State" data entry error.  
  * **Recommendation:**  
    1. Correct the state from Madhya Pradesh to Uttar Pradesh.  
    2. Search the geojson-districts.json file for Siddharth Nagar (or Siddharthnagar) 1 to find its geoId.

### **1.8. District: Eastern West Khasi Hills**

* **API State (Erroneous):** Meghalaya.1  
* **API Error Analysis:** The state is correct. This is a "New District" problem, not a "Wrong State" problem.  
* **Verification:**  
  * **Correct State:** Meghalaya.33  
  * **Nature of District:** This is a **new district** created on November 10, 2021\.35 It was bifurcated from its parent district, West Khasi Hills.35  
* **Mapping Resolution:**  
  * **Status:** NOT MAPPABLE.  
  * **Reason:** As a new district created in late 2021, it will not exist in the pre-2019 GeoJSON file. Reference searches confirm its absence.1  
  * **Recommendation:**  
    1. To visualize its MGNREGA data, this data must be aggregated with its parent district: West Khasi Hills.

---

## **Part 2: Resolution of Medium-Priority and Other Problematic Districts**

This section provides a comprehensive verification log for the 34+ medium-priority districts and other problematic entries identified from the all-districts-statewise.txt API list.1 The issues are grouped by error category to facilitate systemic resolution.

### **2.1. Category 1: Renamed Districts (Mappable with Alias)**

These districts are listed in the API 1 under their new official names (or, in some cases, old names). The map file (geojson-districts.json) will likely contain the inverse. An alias is required to bridge this temporal gap.

* **Ahilyanagar (Maharashtra):** This is the new name for Ahmednagar, finalized in 2023-2024. The API list 1 erroneously lists *both* Ahilyanagar and Ahmednagar, which is a data-source contradiction.  
  * **Recommendation:** Map both Ahilyanagar and Ahmednagar to the single GeoJSON entry for **Ahmednagar**.  
* **Kawardha (Chhattisgarh):** The API 1 lists the old name. The district was officially renamed Kabirdham in 2003\.37  
  * **Recommendation:** Map API Kawardha to GeoJSON **Kabirdham**.  
* **Pondicherry (Puducherry):** The API 1 uses the old name. The territory officially changed its name to Puducherry in 2006\.39  
  * **Recommendation:** Map API Pondicherry to GeoJSON **Puducherry**.  
* **Nawanshahr (Punjab):** The API 1 uses the old name. The district was officially renamed Shahid Bhagat Singh Nagar in 2008\.42  
  * **Recommendation:** Map API Nawanshahr to GeoJSON **Shahid Bhagat Singh Nagar**.  
* **Ropar (Punjab):** The API 1 uses the old, common name. The official name is Rupnagar.44  
  * **Recommendation:** Map API Ropar to GeoJSON **Rupnagar**.

### **2.2. Category 2: Spelling & Convention Variants (Mappable with Alias)**

These districts are functionally identical, but the API name and GeoJSON name may differ due to phonetic spelling, anglicization, or official naming conventions.

* **Beed (Maharashtra):** Bid is a common variant.47  
  * **Recommendation:** Map API Beed to GeoJSON **Bid**.  
* **Boudh (Odisha):** Baudh is an official alternate spelling.49  
  * **Recommendation:** Map API Boudh to GeoJSON **Baudh**.  
* **Mukatsar (Punjab):** The official name is Sri Muktsar Sahib (changed in 2012).51 Mukatsar is the common/old name.53  
  * **Recommendation:** Map API Mukatsar to GeoJSON **Sri Muktsar Sahib**.  
* **Rae Bareli (Uttar Pradesh):** A common "space vs. no-space" issue. Official sites use Raebareli.54  
  * **Recommendation:** Map API Rae Bareli to GeoJSON **Raebareli**.  
* **Thoothukkudi (Tamil Nadu):** Tuticorin is the former, anglicized name.57 The map file likely uses this.  
  * **Recommendation:** Map API Thoothukkudi to GeoJSON **Tuticorin**.  
* **Kumram Bheem(Asifabad) (Telangana):** The API 1 uses a garbled format. The official name is Komaram Bheem Asifabad.60  
  * **Recommendation:** Map API Kumram Bheem(Asifabad) to GeoJSON **Komaram Bheem Asifabad**.  
* **Narsinghpur (Madhya Pradesh):** Narsimhapur is a common official alternate spelling.62  
  * **Recommendation:** Map API Narsinghpur to GeoJSON **Narsimhapur**.  
* **Poonch (Jammu and Kashmir):** Punch is a common alternate spelling.65  
  * **Recommendation:** Map API Poonch to GeoJSON **Punch**.  
* **Dohad (Gujarat):** The API 1 lists DOHAD. Official sites confirm Dahod is the primary spelling and Dohad is an official alternate.67  
  * **Recommendation:** Map API Dohad to GeoJSON **Dahod**.  
* **Khandwa (Madhya Pradesh):** This district was officially known as East Nimar.69  
  * **Recommendation:** Search GeoJSON for Khandwa first, then **East Nimar**.  
* **Khargone (Madhya Pradesh):** This district was officially known as West Nimar.72  
  * **Recommendation:** Search GeoJSON for Khargone first, then **West Nimar**.  
* **Sonepur (Odisha):** The API 1 uses Sonepur. The official district name is Subarnapur.75  
  * **Recommendation:** Map API Sonepur to GeoJSON **Subarnapur**.

### **2.3. Category 3: New Districts (Not Mappable)**

These districts are correctly listed in the API 1 but were created after 2019\. They will not be in the pre-2019 GeoJSON file. **Data for these districts must be aggregated to their parent district(s) for visualization.**

| API District Name | API State | Status | Parent District(s) for Aggregation | Verification (Creation Date & Source) |
| :---- | :---- | :---- | :---- | :---- |
| Bajali | Assam | NEW DISTRICT | Barpeta | Created **Aug 2020**.\[78, 79\] |
| Tamulpur | Assam | NEW DISTRICT | Baksa | Formally declared **Jan 2022**.\[78, 80\] |
| Khairagarh Chhuikhadan Gandai | Chhattisgarh | NEW DISTRICT | Rajnandgaon | Inaugurated **Sep 3, 2022**.\[4, 5, 81\] |
| Manendragarh Chirmiri Bharatpur | Chhattisgarh | NEW DISTRICT | Korea | Inaugurated **Sep 9, 2022**.\[5, 81, 82\] |
| Mohla Manpur Ambagarh Chowki | Chhattisgarh | NEW DISTRICT | Rajnandgaon | Inaugurated **Sep 2, 2022**.\[4, 5, 81\] |
| Sakti | Chhattisgarh | NEW DISTRICT | Janjgir-Champa | Inaugurated **Sep 9, 2022**.\[5, 81, 82\] |
| Vijayanagara | Karnataka | NEW DISTRICT | Ballari | Formally approved **Nov 18, 2020**.\[83, 84, 85\] |
| Hanumakonda | Telangana | NEW DISTRICT | Warangal | Warangal Urban district was renamed Hanumakonda in **Aug 2021**.\[86\] |
| Malerkotla | Punjab | NEW DISTRICT | Sangrur | Created **June 2, 2021**.\[87, 88, 89\] |
| Pakyong | Sikkim | NEW DISTRICT | East Sikkim | Created **Dec 13, 2021**.\[90, 91, 92\] |
| Soreng | Sikkim | NEW DISTRICT | West Sikkim | Created **Dec 13, 2021**.\[90, 91, 93\] |
| Ranipet | Tamil Nadu | NEW DISTRICT | Vellore | Created **Nov 28, 2019**.\[94, 95\] |
| Mayiladuthurai | Tamil Nadu | NEW DISTRICT | Nagapattinam | Created **Dec 28, 2020**.\[95, 96, 97\] |
| Tirupathur | Tamil Nadu | NEW DISTRICT | Vellore | Created **Nov 28, 2019**.\[95\] |
| Kallakurichi | Tamil Nadu | NEW DISTRICT | Villupuram | Created **Jan 2019**.\[95\] |
| Chengalpattu | Tamil Nadu | NEW DISTRICT | Kanchipuram | Created **July 2019**.\[95, 98\] |
| Tenkasi | Tamil Nadu | NEW DISTRICT | Tirunelveli | Created **July 2019**.\[95\] |

### **2.4. Category 4: Ambiguous & Non-District Entities**

These entries in the API list 1 are not standard, mappable districts and will break the map. They must be handled specifically.

* **NA (State: NA):** This is a null/junk data entry.  
  * **Recommendation:** **EXCLUDE** this entry from all processing.  
* **Siliguri Mahakuma Parishad (State: West Bengal):** This is *not a district*. It is a sub-divisional rural council *within* the Darjeeling district.99  
  * **Recommendation:** **EXCLUDE** this entity. Its data should be aggregated to the **Darjeeling** district.  
* **DADRA AND NAGAR HAVELI (State: DN HAVELI AND DD):** This reflects an administrative anomaly. On **January 26, 2020**, the two separate Union Territories of Dadra and Nagar Haveli and Daman and Diu were merged into a *single UT*.102 This new UT has *three* districts: Dadra, Nagar Haveli, and Daman and Diu.105 The API 1 is treating the new UT as a "State" and the old UT as a "District", which is incorrect.  
  * **Recommendation:** **INVESTIGATE & AGGREGATE**. The map file likely has separate polygons for Dadra and Nagar Haveli and Daman and Diu. The API data should be mapped accordingly.  
* **NORTH AND MIDDLE ANDAMAN (State: ANDAMAN AND NICOBAR):** This is correct. North and Middle Andaman is a single administrative district.106  
  * **Recommendation:** **MAP AS-IS**. This is not an error.

---

## **Part 3: Analysis of Discrepancy Patterns & Strategic Recommendations**

Resolving the 50+ individual districts is a short-term fix. The underlying data pipeline is fragile. The following analysis explains the root causes and provides a long-term, systemic solution to achieve and maintain 100% mapping accuracy.

### **3.1. The "Temporal Divide" & Obsolete Geospatial Data**

The core problem is the "temporal divide" between the data sources. The geojson-districts.json file is obsolete, while the all-districts-statewise.txt API list is current. This is the sole reason for the 17+ "New District" (Category 3\) errors. The current system is attempting to map data for districts like Vijayanagara 83 and Sakti 82 for which no polygon exists in the map file.

This is not a static problem. Administrative boundaries in India are fluid; new districts are announced regularly, and existing ones can be merged (as seen in Assam 78). A "one-time fix" is insufficient.

**Recommendations:**

1. **Short-Term (Data Aggregation):** Implement the parent-child relationships defined in the table in Part 2.3. All MGNREGA data for new, unmappable districts (e.g., Malerkotla) *must* be programmatically aggregated and assigned to their parent district (e.g., Sangrur 88) for visualization. This ensures the *data* is not lost, even if the *granularity* is.  
2. **Long-Term (Source New GeoJSON):** The project must acquire an updated geojson-districts.json file. This file must be sourced from an authority that tracks administrative boundary changes post-2023. This is the only sustainable solution.

### **3.2. The "Nomenclature-Alias" Problem & Renaming**

The second major issue is the conflict between modern/official names and old/common names. This accounts for all Category 1 (Renamed) and Category 2 (Spelling) errors. This is a permanent feature of Indian administrative data, driven by official renaming (Aurangabad \-\> Chatrapati Sambhaji Nagar 15; Osmanabad \-\> Dharashiv 21) and common-use-versus-official-use (Thoothukkudi vs. Tuticorin 57; Ropar vs. Rupnagar 44).

**Recommendation:**

Create a permanent **"Alias Dictionary"** (a JSON object or map) in the application's data-processing layer. This dictionary will normalize all incoming API district names *before* they are sent to the mapping component. This makes the system resilient to these predictable variations. An initial dictionary is provided in the Appendix.

### **3.3. The "Data-Source Integrity" Problem**

The analysis reveals that the project is suffering from conflicting "sources of truth."

1. The list from the research instructions 1 contains critical "Wrong State" errors (e.g., Narmadapuram, Gujarat).  
2. The all-districts-statewise.txt file 1 *fixes* these errors but contains its *own* flaws, such as non-district entities (Siliguri Mahakuma Parishad 99) and data contradictions (listing both Ahmednagar and Ahilyanagar 1).  
3. The geojson-districts.json file is temporally obsolete.

No single source can be blindly trusted. A validation and cleaning layer is required.

**Recommendations:**

1. **Deprecate Flawed Source:** The data source that produced the "Wrong State" errors in the research instructions 1 is fatally flawed and must be deprecated immediately.  
2. **Adopt and Clean:** The all-districts-statewise.txt file 1 should be adopted as the new "source of truth" for *what districts to map*.  
3. **Implement Data Cleaning Pipeline:** Before processing the 1 list, it must be passed through:  
   * An **Exclusion List** to filter junk data (e.g., NA, Siliguri Mahakuma Parishad).  
   * The **Alias Dictionary** (see 3.2 and Appendix) to normalize all names *before* matching them to the GeoJSON file.

---

## **Appendix: Master Resolution Log for Problem Districts**

This table provides the definitive resolution for all identified problem districts. It serves as the basis for the recommended "Alias Dictionary" and "Aggregation" logic.

| API\_District\_Name \[1, 1\] | Verified State | Status | Mappable\_GeoJSON\_Name (Search Target) | Parent\_District\_for\_Aggregation (if not mappable) |
| :---- | :---- | :---- | :---- | :---- |
| **High Priority** |  |  |  |  |
| Sarangarh Bilaigarh | Chhattisgarh | **NOT\_MAPPABLE\_NEW** |  | Raigarh \+ Baloda Bazar |
| Narmadapuram | Madhya Pradesh | **MAPPABLE\_ALIAS** | Hoshangabad |  |
| Unakoti | Tripura | **MAPPABLE** | Unakoti |  |
| Chatrapati Sambhaji Nagar | Maharashtra | **MAPPABLE\_ALIAS** | Aurangabad |  |
| Dharashiv | Maharashtra | **MAPPABLE\_ALIAS** | Osmanabad |  |
| Jayashanker Bhopalapally | Telangana | **MAPPABLE\_ALIAS** | Jayashankar Bhupalpally |  |
| Siddharth Nagar | Uttar Pradesh | **MAPPABLE** | Siddharth Nagar |  |
| Eastern West Khasi Hills | Meghalaya | **NOT\_MAPPABLE\_NEW** |  | West Khasi Hills |
| **Renamed Districts** |  |  |  |  |
| Ahilyanagar | Maharashtra | **MAPPABLE\_ALIAS** | Ahmednagar |  |
| Kawardha | Chhattisgarh | **MAPPABLE\_ALIAS** | Kabirdham |  |
| Pondicherry | Puducherry | **MAPPABLE\_ALIAS** | Puducherry |  |
| Nawanshahr | Punjab | **MAPPABLE\_ALIAS** | Shahid Bhagat Singh Nagar |  |
| Ropar | Punjab | **MAPPABLE\_ALIAS** | Rupnagar |  |
| **Spelling Variants** |  |  |  |  |
| Beed | Maharashtra | **MAPPABLE\_ALIAS** | Bid |  |
| Boudh | Odisha | **MAPPABLE\_ALIAS** | Baudh |  |
| Mukatsar | Punjab | **MAPPABLE\_ALIAS** | Sri Muktsar Sahib |  |
| Rae Bareli | Uttar Pradesh | **MAPPABLE\_ALIAS** | Raebareli |  |
| Thoothukkudi | Tamil Nadu | **MAPPABLE\_ALIAS** | Tuticorin |  |
| Kumram Bheem(Asifabad) | Telangana | **MAPPABLE\_ALIAS** | Komaram Bheem Asifabad |  |
| Narsinghpur | Madhya Pradesh | **MAPPABLE\_ALIAS** | Narsimhapur |  |
| Poonch | Jammu and Kashmir | **MAPPABLE\_ALIAS** | Punch |  |
| Dohad | Gujarat | **MAPPABLE\_ALIAS** | Dahod |  |
| Khandwa | Madhya Pradesh | **MAPPABLE\_ALIAS** | East Nimar |  |
| Khargone | Madhya Pradesh | **MAPPABLE\_ALIAS** | West Nimar |  |
| Sonepur | Odisha | **MAPPABLE\_ALIAS** | Subarnapur |  |
| **Other New Districts** |  |  |  |  |
| Bajali | Assam | **NOT\_MAPPABLE\_NEW** |  | Barpeta |
| Tamulpur | Assam | **NOT\_MAPPABLE\_NEW** |  | Baksa |
| Khairagarh C. G. | Chhattisgarh | **NOT\_MAPPABLE\_NEW** |  | Rajnandgaon |
| Manendragarh C. B. | Chhattisgarh | **NOT\_MAPPABLE\_NEW** |  | Korea |
| Mohla Manpur A. C. | Chhattisgarh | **NOT\_MAPPABLE\_NEW** |  | Rajnandgaon |
| Sakti | Chhattisgarh | **NOT\_MAPPABLE\_NEW** |  | Janjgir-Champa |
| Vijayanagara | Karnataka | **NOT\_MAPPABLE\_NEW** |  | Ballari |
| Hanumakonda | Telangana | **NOT\_MAPPABLE\_NEW** |  | Warangal |
| Malerkotla | Punjab | **NOT\_MAPPABLE\_NEW** |  | Sangrur |
| Pakyong | Sikkim | **NOT\_MAPPABLE\_NEW** |  | East Sikkim |
| Soreng | Sikkim | **NOT\_MAPPABLE\_NEW** |  | West Sikkim |
| Ranipet | Tamil Nadu | **NOT\_MAPPABLE\_NEW** |  | Vellore |
| Mayiladuthurai | Tamil Nadu | **NOT\_MAPPABLE\_NEW** |  | Nagapattinam |
| Tirupathur | Tamil Nadu | **NOT\_MAPPABLE\_NEW** |  | Vellore |
| Kallakurichi | Tamil Nadu | **NOT\_MAPPABLE\_NEW** |  | Villupuram |
| Chengalpattu | Tamil Nadu | **NOT\_MAPPABLE\_NEW** |  | Kanchipuram |
| Tenkasi | Tamil Nadu | **NOT\_MAPPABLE\_NEW** |  | Tirunelveli |
| **Non-District Entities** |  |  |  |  |
| NA | NA | **EXCLUDE** |  |  |
| Siliguri Mahakuma Parishad | West Bengal | **EXCLUDE** |  | Darjeeling |
| DADRA AND NAGAR HAVELI | DN HAVELI AND DD | **ADMIN\_ANOMALY** | Dadra and Nagar Haveli |  |

#### **Works cited**

1. all-districts-statewise.txt  
2. Sarangarh-Bilaigarh | Sarangarh-Bilaigarh Chhattisgarh | India, accessed on October 31, 2025, [https://sarangarh-bilaigarh.cg.gov.in/en/](https://sarangarh-bilaigarh.cg.gov.in/en/)  
3. Sarangarh-Bilaigarh district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Sarangarh-Bilaigarh\_district](https://en.wikipedia.org/wiki/Sarangarh-Bilaigarh_district)  
4. List of districts of Chhattisgarh \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/List\_of\_districts\_of\_Chhattisgarh](https://en.wikipedia.org/wiki/List_of_districts_of_Chhattisgarh)  
5. Formation of new districts in the State of Chhattisgarh \- CA Cult, accessed on October 31, 2025, [https://cacult.com/formation-of-new-districts-in-the-state-of-chhattisgarh/](https://cacult.com/formation-of-new-districts-in-the-state-of-chhattisgarh/)  
6. District Narmadapuram, Government of Madhyapradesh | India, accessed on October 31, 2025, [https://narmadapuram.nic.in/en/](https://narmadapuram.nic.in/en/)  
7. District Portal: Madhya Pradesh, accessed on October 31, 2025, [https://mpdistricts.nic.in/](https://mpdistricts.nic.in/)  
8. History | District Narmadapuram, Government of Madhyapradesh \- India, accessed on October 31, 2025, [https://narmadapuram.nic.in/en/history/](https://narmadapuram.nic.in/en/history/)  
9. Hoshangabad district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Hoshangabad\_district](https://en.wikipedia.org/wiki/Hoshangabad_district)  
10. Regarding changing the name of "Hoshangabad" city and district to "Narmadapuram"., accessed on October 31, 2025, [https://narmadapuram.nic.in/en/notice/regarding-changing-the-name-of-hoshangabad-city-and-district-to-narmadapuram/](https://narmadapuram.nic.in/en/notice/regarding-changing-the-name-of-hoshangabad-city-and-district-to-narmadapuram/)  
11. Unakoti district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Unakoti\_district](https://en.wikipedia.org/wiki/Unakoti_district)  
12. accessed on October 31, 2025, [https://unakoti.nic.in/](https://unakoti.nic.in/)  
13. Districts | Official website of Tripura State Portal, India, accessed on October 31, 2025, [https://tripura.gov.in/districts](https://tripura.gov.in/districts)  
14. About District | Unakoti District Website | India, accessed on October 31, 2025, [https://unakoti.nic.in/about-district/](https://unakoti.nic.in/about-district/)  
15. Aurangabad \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Aurangabad](https://en.wikipedia.org/wiki/Aurangabad)  
16. Aurangabad district, Maharashtra \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Aurangabad\_district,\_Maharashtra](https://en.wikipedia.org/wiki/Aurangabad_district,_Maharashtra)  
17. About District | District Chhatrapati Sambhajinagar | India \- (www.aurangabad.gov.in.)., accessed on October 31, 2025, [https://aurangabad.gov.in/en/about-district/](https://aurangabad.gov.in/en/about-district/)  
18. Aurangabad formally renamed Chhatrapati Sambhajinagar, Osmanabad as Dharashiv | Mumbai news \- Hindustan Times, accessed on October 31, 2025, [https://www.hindustantimes.com/cities/mumbai-news/aurangabad-formally-renamed-chhatrapati-sambhajinagar-osmanabad-as-dharashiv-101694855493622.html](https://www.hindustantimes.com/cities/mumbai-news/aurangabad-formally-renamed-chhatrapati-sambhajinagar-osmanabad-as-dharashiv-101694855493622.html)  
19. Aurangabad formally renamed Chhatrapati SambhajiNagar, Osmanabad now Dharashiv, accessed on October 31, 2025, [https://www.deccanherald.com/india/maharashtra/maharashtra-govt-issues-notification-on-change-of-names-of-aurangabad-osmanabad-districts-2689050](https://www.deccanherald.com/india/maharashtra/maharashtra-govt-issues-notification-on-change-of-names-of-aurangabad-osmanabad-districts-2689050)  
20. We made the name 'Chhatrapati Sambhajinagar' foolproof: Eknath Shinde \- Deccan Herald, accessed on October 31, 2025, [https://www.deccanherald.com/india/maharashtra/we-made-the-name-chhatrapati-sambhajinagar-foolproof-eknath-shinde-2689324](https://www.deccanherald.com/india/maharashtra/we-made-the-name-chhatrapati-sambhajinagar-foolproof-eknath-shinde-2689324)  
21. Osmanabad \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Osmanabad](https://en.wikipedia.org/wiki/Osmanabad)  
22. Dharashiv District | Offical Website of Dharashiv District | India, accessed on October 31, 2025, [https://dharashiv.maharashtra.gov.in/](https://dharashiv.maharashtra.gov.in/)  
23. Department of Tourism Maharashtra \- Dharashiv, accessed on October 31, 2025, [https://maharashtratourism.gov.in/districts/dharashiv/](https://maharashtratourism.gov.in/districts/dharashiv/)  
24. Notification of Change in name of Osmanabad to Dharashiv \- date 26/02/2023, accessed on October 31, 2025, [https://dharashiv.maharashtra.gov.in/notice/notification-of-change-in-name-of-osmanabad-to-dharashiv-date-26-02-2023/](https://dharashiv.maharashtra.gov.in/notice/notification-of-change-in-name-of-osmanabad-to-dharashiv-date-26-02-2023/)  
25. Maharashtra: Name change of Aurangabad, Osmanabad comes into force, accessed on October 31, 2025, [https://m.economictimes.com/news/india/maharashtra-name-change-of-aurangabad-osmanabad-comes-into-force/articleshow/103731860.cms](https://m.economictimes.com/news/india/maharashtra-name-change-of-aurangabad-osmanabad-comes-into-force/articleshow/103731860.cms)  
26. Maharashtra govt issues notification on change of names of Aurangabad, Osmanabad districts \- National Herald, accessed on October 31, 2025, [https://www.nationalheraldindia.com/national/maharashtra-govt-issues-notification-on-change-of-names-of-aurangabad-osmanabad-districts](https://www.nationalheraldindia.com/national/maharashtra-govt-issues-notification-on-change-of-names-of-aurangabad-osmanabad-districts)  
27. Jayashankar Bhupalpally District | Welcome to Jayashankar Bhupalpally District | India, accessed on October 31, 2025, [https://bhoopalapally.telangana.gov.in/](https://bhoopalapally.telangana.gov.in/)  
28. Jayashankar Bhupalpally district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Jayashankar\_Bhupalpally\_district](https://en.wikipedia.org/wiki/Jayashankar_Bhupalpally_district)  
29. Jayashankar Bhupalpally district \- Wikidata, accessed on October 31, 2025, [https://www.wikidata.org/wiki/Q28169775](https://www.wikidata.org/wiki/Q28169775)  
30. accessed on October 31, 2025, [https://siddharthnagar.nic.in/](https://siddharthnagar.nic.in/)  
31. Siddharthnagar district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Siddharthnagar\_district](https://en.wikipedia.org/wiki/Siddharthnagar_district)  
32. Siddharthnagar \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Siddharthnagar](https://en.wikipedia.org/wiki/Siddharthnagar)  
33. Districts | Meghalaya Government Portal, accessed on October 31, 2025, [https://meghalaya.gov.in/districts](https://meghalaya.gov.in/districts)  
34. List of districts of Meghalaya \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/List\_of\_districts\_of\_Meghalaya](https://en.wikipedia.org/wiki/List_of_districts_of_Meghalaya)  
35. Eastern West Khasi Hills district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Eastern\_West\_Khasi\_Hills\_district](https://en.wikipedia.org/wiki/Eastern_West_Khasi_Hills_district)  
36. Government of Meghalaya, Office of the Chief Minister Media & Communications Cell Shillong \*\*\* Shillong | Press Release, accessed on October 31, 2025, [https://meghalaya.gov.in/sites/default/files/press\_release/CMO\_92.pdf](https://meghalaya.gov.in/sites/default/files/press_release/CMO_92.pdf)  
37. About District | Kabirdham ,Government of Chhattisgarh | India, accessed on October 31, 2025, [https://kawardha.gov.in/en/about-district/](https://kawardha.gov.in/en/about-district/)  
38. Kabirdham district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Kabirdham\_district](https://en.wikipedia.org/wiki/Kabirdham_district)  
39. Puducherry (union territory) \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Puducherry\_(union\_territory)](https://en.wikipedia.org/wiki/Puducherry_\(union_territory\))  
40. Pondicherry Petitions for Name Change to Puducherry \- Hinduism Today, accessed on October 31, 2025, [https://www.hinduismtoday.com/hpi/2006/05/30/2006-05-30-pondicherry-petitions-for-name-change-to-puducherry/](https://www.hinduismtoday.com/hpi/2006/05/30/2006-05-30-pondicherry-petitions-for-name-change-to-puducherry/)  
41. Puducherry \- The Times of India, accessed on October 31, 2025, [https://timesofindia.indiatimes.com/place/puducherry/articleshow/56870872.cms](https://timesofindia.indiatimes.com/place/puducherry/articleshow/56870872.cms)  
42. About District | Shaheed Bhagat Singh Nagar, Government of Punjab | India, accessed on October 31, 2025, [https://nawanshahr.nic.in/about-district/](https://nawanshahr.nic.in/about-district/)  
43. Shaheed Bhagat Singh Nagar district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Shaheed\_Bhagat\_Singh\_Nagar\_district](https://en.wikipedia.org/wiki/Shaheed_Bhagat_Singh_Nagar_district)  
44. About District | Rupnagar Web Portal | India, accessed on October 31, 2025, [https://rupnagar.nic.in/about-district/](https://rupnagar.nic.in/about-district/)  
45. Municipal Council Municipal Council Roopnagar, Punjab, accessed on October 31, 2025, [https://mcroopnagar.punjab.gov.in/](https://mcroopnagar.punjab.gov.in/)  
46. Rupnagar Web Portal | Land of Historic Gurudwara Takhat Sri Keshgarh Sahib | India, accessed on October 31, 2025, [https://rupnagar.nic.in/](https://rupnagar.nic.in/)  
47. accessed on October 31, 2025, [https://www.marathwadatourism.com/en/beed/\#:\~:text=Beed%20District%20(also%20spelled%20Bid,ancient%20name%20of%20this%20city.](https://www.marathwadatourism.com/en/beed/#:~:text=Beed%20District%20\(also%20spelled%20Bid,ancient%20name%20of%20this%20city.)  
48. Beed district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Beed\_district](https://en.wikipedia.org/wiki/Beed_district)  
49. accessed on October 31, 2025, [https://boudh.odisha.gov.in/\#:\~:text=An%20administrative%20District%20of%20Odisha,Subarnapur%20District%20to%20the%20west.](https://boudh.odisha.gov.in/#:~:text=An%20administrative%20District%20of%20Odisha,Subarnapur%20District%20to%20the%20west.)  
50. Boudh \- Government Of Odisha, accessed on October 31, 2025, [https://boudh.odisha.gov.in/](https://boudh.odisha.gov.in/)  
51. accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Sri\_Muktsar\_Sahib\#:\~:text=The%20government%20officially%20changed%20the,by%20its%20unofficial%20name%20%E2%80%93%20Muktsar.](https://en.wikipedia.org/wiki/Sri_Muktsar_Sahib#:~:text=The%20government%20officially%20changed%20the,by%20its%20unofficial%20name%20%E2%80%93%20Muktsar.)  
52. Sri Muktsar Sahib \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Sri\_Muktsar\_Sahib](https://en.wikipedia.org/wiki/Sri_Muktsar_Sahib)  
53. Sri Muktsar Sahib \- SikhiWiki, free Sikh encyclopedia., accessed on October 31, 2025, [https://www.sikhiwiki.org/index.php/Sri\_Muktsar\_Sahib](https://www.sikhiwiki.org/index.php/Sri_Muktsar_Sahib)  
54. accessed on October 31, 2025, [https://raebareli.nic.in/history/\#:\~:text=The%20district%20of%20Raebareli%2C%20which,of%20Rahi%2C%20a%20village%205km.](https://raebareli.nic.in/history/#:~:text=The%20district%20of%20Raebareli%2C%20which,of%20Rahi%2C%20a%20village%205km.)  
55. History | District Raebareli,Goverment of Uttar Pradesh | India, accessed on October 31, 2025, [https://raebareli.nic.in/history/](https://raebareli.nic.in/history/)  
56. Raebareli district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Raebareli\_district](https://en.wikipedia.org/wiki/Raebareli_district)  
57. Thoothukudi \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Thoothukudi](https://en.wikipedia.org/wiki/Thoothukudi)  
58. History | Thoothukudi District | India, accessed on October 31, 2025, [https://thoothukudi.nic.in/history/](https://thoothukudi.nic.in/history/)  
59. Thoothukudi district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Thoothukudi\_district](https://en.wikipedia.org/wiki/Thoothukudi_district)  
60. Komaram Bheem Asifabad District, Telangana, accessed on October 31, 2025, [https://findmygov.in/en/telangana/komaram-bheem-asifabad](https://findmygov.in/en/telangana/komaram-bheem-asifabad)  
61. Komaram Bheem Asifabad district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Komaram\_Bheem\_Asifabad\_district](https://en.wikipedia.org/wiki/Komaram_Bheem_Asifabad_district)  
62. accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Narsinghpur\_district\#:\~:text=Narsinghpur%20district%20(Hindi%20pronunciation%3A%20%5B,Pradesh%20state%20in%20central%20India.](https://en.wikipedia.org/wiki/Narsinghpur_district#:~:text=Narsinghpur%20district%20\(Hindi%20pronunciation%3A%20%5B,Pradesh%20state%20in%20central%20India.)  
63. Narsinghpur | Location, History, Agriculture, & Facts \- Britannica, accessed on October 31, 2025, [https://www.britannica.com/place/Narsinghpur](https://www.britannica.com/place/Narsinghpur)  
64. ALL ABOUT NARSINGHPUR | narsinghpurcity \- Wix.com, accessed on October 31, 2025, [https://msmadhu258.wixsite.com/narsinghpurcity/services](https://msmadhu258.wixsite.com/narsinghpurcity/services)  
65. accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Poonch\_(town)\#:\~:text=Poonch%20(or%20Punch)%2C%20(,larger%20disputed%20territory%20of%20Kashmir.](https://en.wikipedia.org/wiki/Poonch_\(town\)#:~:text=Poonch%20\(or%20Punch\)%2C%20\(,larger%20disputed%20territory%20of%20Kashmir.)  
66. Poonch | Meaning, Kashmir, History, & Facts \- Britannica, accessed on October 31, 2025, [https://www.britannica.com/place/Poonch-India](https://www.britannica.com/place/Poonch-India)  
67. About District | District Dahod, Government of Gujarat | India, accessed on October 31, 2025, [https://dahod.nic.in/about-district/](https://dahod.nic.in/about-district/)  
68. Dahod \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Dahod](https://en.wikipedia.org/wiki/Dahod)  
69. About District | District Khandwa, Government of Madhya Pradesh | India, accessed on October 31, 2025, [https://khandwa.nic.in/en/about-district/](https://khandwa.nic.in/en/about-district/)  
70. Khandwa district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Khandwa\_district](https://en.wikipedia.org/wiki/Khandwa_district)  
71. Overview of the Khandwa District | Aspirational districts \- Vikaspedia, accessed on October 31, 2025, [https://aspirational.vikaspedia.in/viewcontent/aspirational-districts/madhya-pradesh/khandwa--east-nimar-/know-your-district/overview-of-the-khandwa-district?lgn=en](https://aspirational.vikaspedia.in/viewcontent/aspirational-districts/madhya-pradesh/khandwa--east-nimar-/know-your-district/overview-of-the-khandwa-district?lgn=en)  
72. Brief Industrial Profile of Khargone District Madhya Pradesh \- DCMSME, accessed on October 31, 2025, [https://dcmsme.gov.in/dips/DIPSR\_Khargone\_MP.pdf](https://dcmsme.gov.in/dips/DIPSR_Khargone_MP.pdf)  
73. Khargone district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Khargone\_district](https://en.wikipedia.org/wiki/Khargone_district)  
74. Khargone \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Khargone](https://en.wikipedia.org/wiki/Khargone)  
75. Subarnapur district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Subarnapur\_district](https://en.wikipedia.org/wiki/Subarnapur_district)  
76. Subarnapur, Odisha \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Subarnapur,\_Odisha](https://en.wikipedia.org/wiki/Subarnapur,_Odisha)  
77. About Us \- Subarnapur \- Government Of Odisha, accessed on October 31, 2025, [https://subarnapur.odisha.gov.in/about-district/about-us](https://subarnapur.odisha.gov.in/about-district/about-us)  
78. List of districts of Assam \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/List\_of\_districts\_of\_Assam](https://en.wikipedia.org/wiki/List_of_districts_of_Assam)  
79. Inauguration of Two New Districts 'Manendragarh- Chirmiri-Bharatpur' and 'Sakti' in the state, accessed on October 31, 2025, [https://www.drishtiias.com/state-pcs-current-affairs/inauguration-of-two-new-districts-manendragarh-chirmiri-bharatpur-and-sakti-in-the-state](https://www.drishtiias.com/state-pcs-current-affairs/inauguration-of-two-new-districts-manendragarh-chirmiri-bharatpur-and-sakti-in-the-state)  
80. Vijayanagara- 31st district of Karnataka \- GKToday, accessed on October 31, 2025, [https://www.gktoday.in/vijayanagara-31st-district-of-karnataka/](https://www.gktoday.in/vijayanagara-31st-district-of-karnataka/)  
81. Malerkotla district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Malerkotla\_district](https://en.wikipedia.org/wiki/Malerkotla_district)  
82. West Bengal Act XX of 1994 \- India Code, accessed on October 31, 2025, [https://www.indiacode.nic.in/bitstream/123456789/14407/1/act20.pdf](https://www.indiacode.nic.in/bitstream/123456789/14407/1/act20.pdf)  
83. Siliguri subdivision \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Siliguri\_subdivision](https://en.wikipedia.org/wiki/Siliguri_subdivision)  
84. Left Front calls for new rural subdivision in Siliguri \- Telegraph India, accessed on October 31, 2025, [https://www.telegraphindia.com/west-bengal/left-front-calls-for-new-rural-subdivision-in-siliguri/cid/1870013](https://www.telegraphindia.com/west-bengal/left-front-calls-for-new-rural-subdivision-in-siliguri/cid/1870013)  
85. Dadra and Nagar Haveli and Daman and Diu \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Dadra\_and\_Nagar\_Haveli\_and\_Daman\_and\_Diu](https://en.wikipedia.org/wiki/Dadra_and_Nagar_Haveli_and_Daman_and_Diu)  
86. accessed on October 31, 2025, [https://ddd.gov.in/introduction/\#:\~:text=The%20union%20territory%20was%20merged,Diu%20on%20January%2026%2C%202020.](https://ddd.gov.in/introduction/#:~:text=The%20union%20territory%20was%20merged,Diu%20on%20January%2026%2C%202020.)  
87. About UT Administration | UT of Dadra and Nagar Haveli and Daman and Diu | India, accessed on October 31, 2025, [https://ddd.gov.in/introduction/](https://ddd.gov.in/introduction/)  
88. Dadra and Nagar Haveli and Daman and Diu | Merger, Map, & History | Britannica, accessed on October 31, 2025, [https://www.britannica.com/place/Dadra-and-Nagar-Haveli-and-Daman-and-Diu](https://www.britannica.com/place/Dadra-and-Nagar-Haveli-and-Daman-and-Diu)  
89. About District | District North and Middle Andaman, Government of Andaman and Nicobar | India, accessed on October 31, 2025, [https://northmiddle.andaman.nic.in/about-district/](https://northmiddle.andaman.nic.in/about-district/)  
90. North and Middle Andaman district \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/North\_and\_Middle\_Andaman\_district](https://en.wikipedia.org/wiki/North_and_Middle_Andaman_district)  
91. Andaman and Nicobar Islands \- Wikipedia, accessed on October 31, 2025, [https://en.wikipedia.org/wiki/Andaman\_and\_Nicobar\_Islands](https://en.wikipedia.org/wiki/Andaman_and_Nicobar_Islands)