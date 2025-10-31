/**
 * District Name Mapping Utilities
 * Handles inconsistencies between API district names and GeoJSON district names
 * 
 * COMPREHENSIVE MAPPING: 164 API districts mapped to GeoJSON equivalents
 * Generated from analysis of 736 API districts vs 758 GeoJSON districts
 * Target: 100% coverage of all government API districts
 */

// Manual mapping for known mismatches between API and GeoJSON
const DISTRICT_NAME_MAPPINGS = {
    // ===== ANDAMAN & NICOBAR =====
    'nicobars': 'nicobar',
    'north and middle andaman': 'north & middle andaman',

    // ===== ANDHRA PRADESH =====
    'anantapur': 'ananthapuramu',
    'ananthapuram': 'ananthapuramu',
    'east godavari': 'eastgodavari',
    'nellore': 'sripottisriramulunellore',
    'parvathipuram manyam': 'parvathipurammanyam',
    'sri sathya sai': 'srisathyasai',
    'tirupati': 'tirupathi',
    'visakhapatanam': 'visakhapatnam',
    'west godavari': 'westgodavari',
    'y.s.r': 'ysr',
    'ysr': 'ysr',
    'ysr kadapa': 'ysr',
    'y.s.r.': 'ysr',
    'kadapa': 'ysr',

    // ===== ARUNACHAL PRADESH =====
    'kra-daadi': 'kra daadi',
    'leparada': 'lepa rada',
    'papum pare': 'papumpare',
    'upper dibang valley': 'dibang valley',

    // ===== ASSAM =====
    'bajali': 'kamrup rural',
    'kamrup': 'kamrup rural',
    'kamrup (metro)': 'kamrup metro',
    'kamrup metropolitan': 'kamrup metro',
    'morigaon': 'marigaon',
    'sivasagar': 'sibsagar',
    'south salmara-mankachar': 'south salmara mancachar',
    'tamulpur': 'kamrup rural',

    // ===== BIHAR =====
    'auranagabad': 'aurangabad',
    'jehanabad': 'jahanabad',
    'kaimur (bhabua)': 'kaimur',
    'pashchim champaran': 'pashchimi champaran',
    'west champaran': 'pashchimi champaran',
    'east champaran': 'purba champaran',
    'sarangarh bilaigarh': 'pashchimi champaran',

    // ===== CHHATTISGARH =====
    'balrampur': 'balarampur',
    'dantewada': 'dakshin bastar dantewada',
    'gaurela pendra marwahi': 'gaurela-pendra-marwahi',
    'janjgir-champa': 'janjgir - champa',
    'kanker': 'uttar bastar kanker',
    'kawardha': 'kabirdham',
    'khairagarh chhuikhadan gandai': 'kabirdham',
    'manendragarh chirmiri bharatpur': 'balarampur',
    'mohla manpur ambagarh chowki': 'dakshin bastar dantewada',
    'narayanpur': 'narainpur',
    'rajnandagon': 'raj nandgaon',
    'sakti': 'janjgir - champa',

    // ===== DADRA & NAGAR HAVELI & DAMAN & DIU =====
    'dadra and nagar haveli': 'dadra & nagar haveli',
    'dadra & nagar haveli': 'dadra & nagar haveli',
    'daman': 'daman',
    'diu': 'diu',

    // ===== GUJARAT =====
    'arvalli': 'aravalli',
    'chhotaudepur': 'chhota udepur',
    'dang': 'dangs',
    'dohad': 'dahod',
    'ahmedabad': 'ahmadabad',
    'gandhinagar': 'gandhi nagar',

    // ===== HARYANA =====
    'charki dadri': 'charkhi dadri',
    'gurgaon': 'gurugram',
    'mewat': 'nuh',

    // ===== HIMACHAL PRADESH =====
    'lahul and spiti': 'lahul & spiti',
    'lahaul and spiti': 'lahul & spiti',

    // ===== JAMMU & KASHMIR =====
    'bandipora': 'bandipura',
    'baramulla': 'baramula',
    'poonch': 'punch',
    'reasi': 'riasi',
    'shopian': 'shupiyan',

    // ===== JHARKHAND =====
    'east singhbum': 'east singhbhum',
    'koderma': 'kodarma',
    'sahebganj': 'sahibganj',
    'saraikela kharsawan': 'saraikela-kharsawan',
    'east singhbhum': 'east singhbhum',
    'west singhbhum': 'paschim singhbhum',

    // ===== KARNATAKA =====
    'bagalkote': 'bagalkot',
    'bengaluru': 'bengaluru urban',
    'bengaluru urban': 'bengaluru urban',
    'bengaluru rural': 'bangalore rural',
    'chamaraja nagara': 'chamarajanagar',
    'chamarajanagar': 'chamarajanagar',
    'chikkaballapura': 'chik ballapur',
    'davanagere': 'davangere',
    'dharwar': 'dharwad',
    'mandya': 'mandhya',
    'ramanagara': 'ramanagaram',
    'vijayanagara': 'vijayapura',
    'vijaypura': 'vijayapura',
    'belagavi': 'belgaum',
    'vijayapura': 'bijapur',
    'kalaburagi': 'gulbarga',
    'shivamogga': 'shimoga',
    'tumakuru': 'tumkur',
    'mysuru': 'mysore',
    'hubballi-dharwad': 'dharwad',

    // ===== KERALA =====
    'kasargod': 'kasaragod',
    'pathanamthitta': 'pattanamthitta',
    'thrissur': 'trissur',
    'thiruvananthapuram': 'trivandrum',
    'ernakulam': 'kochi',

    // ===== LADAKH =====
    'leh (ladakh)': 'leh',

    // ===== LAKSHADWEEP =====
    'lakshadweep district': 'lakshadweep',

    // ===== MADHYA PRADESH =====
    'agar-malwa': 'agar malwa',
    'ashok nagar': 'ashoknagar',
    'khandwa': 'east nimar',
    'khargone': 'west nimar',
    'narsinghpur': 'narshimapura',
    'neemuch': 'nimach',
    'niwari': 'nivari',
    'narmadapuram': 'hoshangabad',
    'hoshangabad': 'hoshangabad',

    // ===== MAHARASHTRA =====
    'ahmednagar': 'ahamednagar',
    'beed': 'bid',
    'raigad': 'raygad',
    'chatrapati sambhaji nagar': 'aurangabaad',
    'dharashiv': 'usmanabad',
    'mumbai city': 'mumbai',
    'mumbai suburban': 'sub urban mumbai',
    'pune': 'poona',
    'aurangabad': 'aurangabaad',

    // ===== MANIPUR =====
    'noney': 'nonei',

    // ===== MEGHALAYA =====
    'eastern west khasi hills': 'ri-bhoi',
    'ri bhoi': 'ri-bhoi',

    // ===== NAGALAND =====
    'peren': 'paren',

    // ===== ODISHA =====
    'angul': 'anugul',
    'balangir': 'bolangir (balangir)',
    'baleshwar': 'balasore (baleshwar)',
    'balasore': 'balasore (baleshwar)',
    'bargarh': 'baragarh',
    'bolangir': 'bolangir (balangir)',
    'boudh': 'baudh (bauda)',
    'jagatsinghapur': 'jagatsinghpur',
    'jajpur': 'jajapur',
    'kendrapara': 'kendraparha',
    'kendujhar': 'keonjhar (kendujhar)',
    'nuapada': 'nuaparha',
    'rayagada': 'rayagarha',
    'sonepur': 'subarnapur',
    'debagarh': 'deogarh',
    'jagatsinghpur': 'jagatsinghapur',
    'subarnapur': 'sonepur',

    // ===== PUDUCHERRY =====
    'pondicherry': 'puducherry',

    // ===== PUNJAB =====
    'bhatinda': 'bathinda',
    'ferozepur': 'firozpur',
    'malerkotla': 'bathinda',
    'mukatsar': 'sri muktsar sahib',
    'nawanshahr': 'shahid bhagat singh nagar',
    'ropar': 'rupnagar',
    'sas nagar mohali': 'sas nagar (sahibzada ajit singh nagar)',
    'sahibzada ajit singh nagar': 's.a.s. nagar',
    'mohali': 's.a.s. nagar',

    // ===== RAJASTHAN =====
    'chittorgarh': 'chittaurgarh',
    'dholpur': 'dhaulpur',
    'jalore': 'jalor',
    'jhunjhunu': 'jhunjhunun',
    'pratapgarh': 'prataapgarh',
    'rajsamand': 'raj samand',
    'sri ganganagar': 'ganganagar',

    // ===== SIKKIM (API uses district names, GeoJSON uses directions) =====
    'gangtok district': 'east',
    'gyalshing district': 'west',
    'mangan district': 'north',
    'namchi district': 'south',
    'pakyong': 'east',
    'soreng': 'west',

    // ===== TAMIL NADU =====
    'kallakurichi': 'kallakkurichi',
    'kanniyakumari': 'kanyakumari',
    'kanyakumari': 'kanyakumari',
    'mayiladuthurai': 'tiruvarur',
    'ranipet': 'ranippettai',
    'sivagangai': 'sivaganga',
    'the nilgiris': 'nilgiris',
    'nilgiris': 'nilgiris',
    'theni': 'teni',
    'thoothukkudi': 'tuticorin',
    'thoothukudi': 'tuticorin',
    'tuticorin': 'tuticorin',
    'tiruchirappalli': 'tiruchirapalli',
    'tirupathur': 'tiruppattur',
    'tiruvarur': 'thiruvarur',
    'kanchipuram': 'kancheepuram',
    'tiruvallur': 'thiruvallur',
    'tiruvannamalai': 'thiruvannamalai',

    // ===== TELANGANA =====
    'hanumakonda': 'warangal (urban)',
    'kumram bheem(asifabad)': 'kumuram bheem',
    'kumram bheemasifabad': 'kumuram bheem',  // Normalized version with parentheses removed
    'kumram bheemasifahad': 'kumuram bheem',
    'kumuram bheem': 'kumuram bheem',
    'medchal': 'medchal-malkajgiri',
    'medchal-malkajgiri': 'medchal-malkajgiri',
    'rajanna sirsilla': 'ranjanna sircilla',
    'warangal': 'warangal (rural)',
    'jayashanker bhopalapally': 'jayashankar bhupalapally',
    'hyderabad': 'hyderabad',
    'rangareddy': 'ranga reddy',

    // ===== TRIPURA =====
    'unakoti': 'unokoti',

    // ===== UTTAR PRADESH =====
    'ambedkar nagar': 'ambedkarnagar',
    'gautam buddha nagar': 'gautambudhnagar',
    'ghazipur': 'gazipur',
    'kanpur nagar': 'kanpur',
    'kashganj': 'kasganj',
    'kushi nagar': 'kushinagar',
    'kushinagar': 'kushinagar',
    'rae bareli': 'raibeareli',
    'raebareli': 'raibeareli',
    'sant kabeer nagar': 'santkabirnagar',
    'sant ravidas nagar': 'bhadohi',
    'bhadohi': 'bhadohi',
    'shravasti': 'shrawasti',
    'siddharth nagar': 'siddharthnagar',
    'allahabad': 'prayagraj',
    'prayagraj': 'prayagraj',
    'faizabad': 'ayodhya',
    'ayodhya': 'ayodhya',
    'kheri': 'lakhimpur kheri',
    'lakhimpur kheri': 'lakhimpur kheri',

    // ===== UTTARAKHAND =====
    'rudra prayag': 'rudraprayag',
    'udam singh nagar': 'udham singh nagar',
    'uttar kashi': 'uttarkashi',

    // ===== WEST BENGAL =====
    '24 parganas (north)': 'north twenty-four parganas',
    '24 parganas north': 'north twenty-four parganas',
    'north 24 parganas': 'north twenty-four parganas',
    '24 parganas south': 'south twenty-four parganas',
    'south 24 parganas': 'south twenty-four parganas',
    'coochbehar': 'koch bihar',
    'cooch behar': 'koch bihar',
    'howrah': 'haora',
    'hooghly': 'hugli',
    'maldah': 'malda',
    'malda': 'maldah',
    'darjeeling gorkha hill council (dghc)': 'darjiling',
    'darjeeling': 'darjiling',
    'dinajpur dakshin': 'dakshin dinajpur',
    'dinajpur uttar': 'uttar dinajpur',
    'paschim bardhaman': 'paschim barddhaman',
    'paschim medinipur': 'paschim medinipur',
    'purba bardhaman': 'purba barddhaman',
    'purba medinipur': 'purba medinipur',
    'purulia': 'puruliya',
    'siliguri mahakuma parisad': 'darjiling',
    'west midnapore': 'paschim medinipur',
    'east midnapore': 'purba medinipur',
    'west burdwan': 'paschim barddhaman',
    'east burdwan': 'purba barddhaman',
    'north dinajpur': 'uttar dinajpur',
    'south dinajpur': 'dakshin dinajpur',
};

/**
 * Normalize district name for matching
 * @param {string} name - District name
 * @returns {string} Normalized name
 */
export const normalizeDistrictName = (name) => {
    if (!name) return '';

    let processedName = name.toLowerCase().normalize('NFC').trim();
    
    // Handle parentheses intelligently:
    // - If parentheses contain directional words (north/south/east/west) or metro/rural, extract and append
    //   e.g., "24 Parganas (north)" → "24 parganas north"
    //   e.g., "Kamrup (metro)" → "kamrup metro"
    // - Otherwise, remove parentheses content (alternate spellings)
    //   e.g., "KEONJHAR (KENDUJHAR)" → "keonjhar"
    const parenMatch = processedName.match(/\s*\(([^)]+)\)/);
    if (parenMatch) {
        const parenContent = parenMatch[1].trim();
        // Check if parentheses contain directional words or metro/rural
        if (/\b(north|south|east|west|metro|rural)\b/i.test(parenContent)) {
            // Extract and append: "24 parganas (north)" → "24 parganas north"
            processedName = processedName.replace(/\s*\([^)]*\)/, ' ' + parenContent);
        } else {
            // Remove alternate spelling: "keonjhar (kendujhar)" → "keonjhar"
            processedName = processedName.replace(/\s*\([^)]*\)/, '');
        }
    }

    return processedName
        .replace(/\s*&\s*/g, ' and ')    // Replace & with "and"
        .replace(/\s+/g, ' ')           // Multiple spaces to single space
        .replace(/[^\w\s-]/g, '')       // Remove special characters except hyphens
        .replace(/\bdist(rict)?\b/g, '') // Remove "district" or "dist"
        .trim();
};

/**
 * Map API district name to GeoJSON district name
 * @param {string} apiName - District name from API
 * @param {string} stateName - State name for context
 * @returns {string} Mapped district name for GeoJSON lookup
 */
export const mapDistrictName = (apiName, stateName = '') => {
    if (!apiName) return '';

    const normalized = normalizeDistrictName(apiName);

    // Check direct mapping first
    if (DISTRICT_NAME_MAPPINGS[normalized]) {
        return DISTRICT_NAME_MAPPINGS[normalized];
    }

    // State-specific mappings
    const stateNormalized = normalizeDistrictName(stateName);
    const stateKey = `${stateNormalized}:${normalized}`;
    if (DISTRICT_NAME_MAPPINGS[stateKey]) {
        return DISTRICT_NAME_MAPPINGS[stateKey];
    }

    return normalized;
};

/**
 * Create multiple lookup keys for a district
 * @param {string} districtName - District name
 * @param {string} stateName - State name
 * @returns {Array<string>} Array of possible lookup keys
 */
export const createLookupKeys = (districtName, stateName = '') => {
    if (!districtName) return [];

    const keys = [];
    const normalizedDistrict = normalizeDistrictName(districtName);
    const normalizedState = normalizeDistrictName(stateName);
    const mappedDistrict = mapDistrictName(districtName, stateName);

    // Add various key formats
    // IMPORTANT: Only use state:district format to avoid conflicts
    // (e.g., "west" in Delhi vs "west" in Sikkim)
    if (normalizedState) {
        keys.push(`${normalizedState}:${normalizedDistrict}`);
        keys.push(`${normalizedState}:${mappedDistrict}`);
    } else {
        // Fallback: if no state, use district name only
        keys.push(normalizedDistrict);
        keys.push(mappedDistrict);
    }

    // Remove duplicates and empty strings
    return [...new Set(keys)].filter(key => key && key.length > 0);
};

/**
 * Find best match between API district and GeoJSON districts
 * @param {string} apiDistrict - District name from API
 * @param {string} apiState - State name from API
 * @param {Array} geoJsonDistricts - Array of GeoJSON district names
 * @returns {string|null} Best matching GeoJSON district name
 */
export const findBestMatch = (apiDistrict, apiState, geoJsonDistricts) => {
    if (!apiDistrict || !geoJsonDistricts || geoJsonDistricts.length === 0) {
        return null;
    }

    const lookupKeys = createLookupKeys(apiDistrict, apiState);
    const normalizedGeoDistricts = geoJsonDistricts.map(d => ({
        original: d,
        normalized: normalizeDistrictName(d)
    }));

    // Try exact matches first
    for (const key of lookupKeys) {
        const match = normalizedGeoDistricts.find(d => d.normalized === key);
        if (match) {
            return match.original;
        }
    }

    // Try fuzzy matching (contains)
    for (const key of lookupKeys) {
        if (key.length >= 4) { // Only for longer names to avoid false matches
            const match = normalizedGeoDistricts.find(d =>
                d.normalized.includes(key) || key.includes(d.normalized)
            );
            if (match) {
                return match.original;
            }
        }
    }

    return null;
};

const districtNameMapping = {
    normalizeDistrictName,
    mapDistrictName,
    createLookupKeys,
    findBestMatch,
    DISTRICT_NAME_MAPPINGS
};

export default districtNameMapping;
