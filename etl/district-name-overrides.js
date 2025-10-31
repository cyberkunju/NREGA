/**
 * District Name Manual Overrides
 * Maps known problematic district names to their correct GeoJSON equivalents
 * Key format: super-normalized name (all lowercase, no special chars)
 */

const MANUAL_OVERRIDES = {
  // Format issues
  'darjeelinggorkahillcouncildghc': 'darjeeling',
  'darjeelinggorkha hillcouncil': 'darjeeling',
  
  // Number formatting
  '24parganasnorth': '24 parganas north',
  '24parganassouth': '24 parganas south',
  '24parganas north': '24 parganas north',
  '24parganas south': '24 parganas south',
  
  // Union territories
  'dadraandnagarhaveli': 'dadra and nagar haveli',
  'dadranagarhaveli': 'dadra and nagar haveli',
  
  // Spelling variants
  'ahmednagar': 'ahmadnagar',
  'ahmadnagar': 'ahmednagar',
  
  // Hyphen vs space
  'agarmalwa': 'agar malwa',
  'agar-malwa': 'agar malwa',
  
  // Space vs no space
  'ambedkarnagar': 'ambedkar nagar',
  'ambedkar nagar': 'ambedkarnagar',
  
  // Compound names
  'ashoknagar': 'ashok nagar',
  'ashok nagar': 'ashoknagar',
  
  // Alternative spellings
  'chhotaudepur': 'chhota udepur',
  'chhota udepur': 'chhotaudepur',
  
  // Common variations
  'coochbehar': 'cooch behar',
  'cooch behar': 'coochbehar',
  
  // District vs full name
  'gangtokdistrict': 'gangtok',
  'gangtok district': 'gangtok',
  
  // Direction suffixes
  'dinajpurdakshin': 'dinajpur dakshin',
  'dinajpur dakshin': 'dakshin dinajpur',
  'dinajputtar': 'dinajpur uttar',
  'dinajpur uttar': 'uttar dinajpur',
  
  // Name changes and variations
  'auranagabad': 'aurangabad',
  'aurangabad': 'aurangabad',
  
  // Add more as discovered during testing
};

module.exports = MANUAL_OVERRIDES;
