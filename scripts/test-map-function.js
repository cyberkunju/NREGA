#!/usr/bin/env node

const DISTRICT_NAME_MAPPINGS = {
    '24 parganas (north)': 'north twenty-four parganas',
    '24 parganas north': 'north twenty-four parganas',
    'north 24 parganas': 'north twenty-four parganas',
};

const normalizeDistrictName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')  // This removes parentheses!
    .replace(/\bdist(rict)?\b/g, '')
    .trim();
};

const mapDistrictName = (apiName, stateName = '') => {
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

console.log('Testing mapDistrictName:\n');

const test1 = '24 Parganas (north)';
const normalized1 = normalizeDistrictName(test1);
const mapped1 = mapDistrictName(test1, 'West Bengal');

console.log(`Input: "${test1}"`);
console.log(`Normalized: "${normalized1}"`);
console.log(`Mapped: "${mapped1}"`);
console.log(`Mapping exists for "${normalized1}": ${DISTRICT_NAME_MAPPINGS[normalized1] ? 'YES' : 'NO'}`);
console.log(`Mapping exists for "24 parganas (north)": ${DISTRICT_NAME_MAPPINGS['24 parganas (north)'] ? 'YES' : 'NO'}`);
console.log(`Mapping exists for "24 parganas north": ${DISTRICT_NAME_MAPPINGS['24 parganas north'] ? 'YES' : 'NO'}`);
