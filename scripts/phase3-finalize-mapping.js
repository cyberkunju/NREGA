/**
 * Phase 3: Finalize Perfect Mapping
 * 
 * This script:
 * 1. Auto-approves high confidence matches (≥90%)
 * 2. Shows medium/low confidence matches for manual review
 * 3. Handles unmatched districts (new districts, merged districts, etc.)
 * 4. Generates final production-ready mapping file
 * 5. Creates validation report
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function reviewMatch(match, index, total) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Match ${index + 1} of ${total} (Confidence: ${(match.confidence * 100).toFixed(1)}%)`);
  console.log(`${'='.repeat(70)}`);
  console.log(`API:     ${match.apiDistrict}, ${match.apiState}`);
  console.log(`GeoJSON: ${match.geoDistrict}, ${match.geoState}`);
  console.log(`GeoID:   ${match.geoId}`);
  console.log(`Score:   ${(match.similarityScore * 100).toFixed(1)}%`);
  
  const answer = await question('\nApprove this match? (y/n/skip): ');
  return answer.toLowerCase();
}

async function handleUnmatched(district, geoDistricts) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Unmatched API District`);
  console.log(`${'='.repeat(70)}`);
  console.log(`District: ${district.districtName}`);
  console.log(`State:    ${district.stateName}`);
  
  // Find potential matches in same state
  const sameState = geoDistricts.filter(g => 
    g.normalizedState === district.normalizedState
  );
  
  if (sameState.length > 0) {
    console.log(`\nPossible matches in ${district.stateName}:`);
    sameState.slice(0, 10).forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.district} (ID: ${g.geoId})`);
    });
  }
  
  console.log('\nOptions:');
  console.log('  1-N: Select a match by number');
  console.log('  new: Mark as new district (not in GeoJSON)');
  console.log('  skip: Skip for now');
  
  const answer = await question('\nYour choice: ');
  
  if (answer === 'new') {
    return { action: 'exclude', reason: 'New district not in GeoJSON' };
  } else if (answer === 'skip') {
    return { action: 'skip' };
  } else {
    const num = parseInt(answer);
    if (num > 0 && num <= sameState.length) {
      const selected = sameState[num - 1];
      return {
        action: 'match',
        geoDistrict: selected.district,
        geoState: selected.state,
        geoId: selected.geoId,
        confidence: 1.0,
        method: 'manual-verified'
      };
    }
  }
  
  return { action: 'skip' };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PHASE 3: FINALIZE PERFECT MAPPING');
  console.log('  Manual Review & Validation');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    // Load all data
    const allMatches = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'analysis-output', 'all-matches.json'),
      'utf-8'
    ));
    
    const highConfidence = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'analysis-output', 'high-confidence-matches.json'),
      'utf-8'
    ));
    
    const mediumConfidence = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'analysis-output', 'medium-confidence-matches.json'),
      'utf-8'
    ));
    
    const lowConfidence = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'analysis-output', 'low-confidence-matches.json'),
      'utf-8'
    ));
    
    const stillUnmatched = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'analysis-output', 'still-unmatched.json'),
      'utf-8'
    ));
    
    const geoData = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'analysis-output', 'geojson-ground-truth.json'),
      'utf-8'
    ));
    
    console.log(`✅ Auto-approving ${highConfidence.count} high confidence matches (≥90%)\n`);
    
    const finalMatches = [...allMatches.matches];
    const excluded = [];
    const needsReview = [];
    
    // Review medium confidence matches
    if (mediumConfidence.count > 0) {
      console.log(`\n⚠️  Reviewing ${mediumConfidence.count} medium confidence matches...\n`);
      console.log('These matches look good but need your confirmation.');
      console.log('Press Enter to auto-approve all, or type "review" to check each one: ');
      
      const choice = await question('');
      
      if (choice.toLowerCase() === 'review') {
        for (let i = 0; i < mediumConfidence.matches.length; i++) {
          const match = mediumConfidence.matches[i];
          const decision = await reviewMatch(match, i, mediumConfidence.matches.length);
          
          if (decision === 'y') {
            finalMatches.push({
              ...match,
              confidence: 1.0,
              method: 'manual-verified'
            });
          } else if (decision === 'n') {
            needsReview.push(match);
          }
        }
      } else {
        // Auto-approve all medium confidence
        console.log('✅ Auto-approving all medium confidence matches\n');
        mediumConfidence.matches.forEach(match => {
          finalMatches.push({
            ...match,
            confidence: 0.95,
            method: 'auto-approved'
          });
        });
      }
    }
    
    // Review low confidence matches
    if (lowConfidence.count > 0) {
      console.log(`\n⚠️  ${lowConfidence.count} low confidence matches need review\n`);
      console.log('These matches are uncertain. Review each one carefully.');
      console.log('Press Enter to skip all, or type "review" to check each one: ');
      
      const choice = await question('');
      
      if (choice.toLowerCase() === 'review') {
        for (let i = 0; i < lowConfidence.matches.length; i++) {
          const match = lowConfidence.matches[i];
          const decision = await reviewMatch(match, i, lowConfidence.matches.length);
          
          if (decision === 'y') {
            finalMatches.push({
              ...match,
              confidence: 1.0,
              method: 'manual-verified'
            });
          } else {
            needsReview.push(match);
          }
        }
      } else {
        console.log('⏭️  Skipping low confidence matches\n');
        needsReview.push(...lowConfidence.matches);
      }
    }
    
    // Handle unmatched districts
    if (stillUnmatched.count > 0) {
      console.log(`\n❌ ${stillUnmatched.count} districts are still unmatched\n`);
      console.log('These are likely:');
      console.log('  - New districts created after GeoJSON was made');
      console.log('  - Districts that were merged into others');
      console.log('  - Data quality issues in API\n');
      
      console.log('Options:');
      console.log('  1. Auto-mark all as "new districts" (excluded from map)');
      console.log('  2. Review each one manually');
      console.log('  3. Skip for now\n');
      
      const choice = await question('Your choice (1/2/3): ');
      
      if (choice === '1') {
        stillUnmatched.districts.forEach(d => {
          excluded.push({
            apiDistrict: d.districtName,
            apiState: d.stateName,
            reason: 'New district not in GeoJSON',
            verified: true
          });
        });
        console.log(`✅ Marked ${stillUnmatched.count} districts as excluded\n`);
      } else if (choice === '2') {
        for (let i = 0; i < stillUnmatched.districts.length; i++) {
          const district = stillUnmatched.districts[i];
          const result = await handleUnmatched(district, geoData.districts);
          
          if (result.action === 'match') {
            finalMatches.push({
              apiDistrict: district.districtName,
              apiState: district.stateName,
              geoDistrict: result.geoDistrict,
              geoState: result.geoState,
              geoId: result.geoId,
              compositeKey: district.compositeKey,
              confidence: result.confidence,
              method: result.method
            });
          } else if (result.action === 'exclude') {
            excluded.push({
              apiDistrict: district.districtName,
              apiState: district.stateName,
              reason: result.reason,
              verified: true
            });
          }
        }
      }
    }
    
    // Generate final mapping
    console.log('\n📝 Generating final production mapping...\n');
    
    const finalMapping = {
      version: '2.0-final',
      generated: new Date().toISOString(),
      source: 'Phase 3: Manual Review & Validation',
      totalMappings: finalMatches.length,
      excludedDistricts: excluded.length,
      coverage: ((finalMatches.length / 735) * 100).toFixed(2) + '%',
      mappings: {},
      excluded: {}
    };
    
    // Add all matches
    finalMatches.forEach(match => {
      const key = match.compositeKey || `${match.apiState.toLowerCase().replace(/[^\w\s-]/g, '').trim()}:${match.apiDistrict.toLowerCase().replace(/[^\w\s-]/g, '').trim()}`;
      
      finalMapping.mappings[key] = {
        geoDistrict: match.geoDistrict,
        geoState: match.geoState,
        geoId: match.geoId,
        confidence: match.confidence,
        method: match.method
      };
    });
    
    // Add excluded districts
    excluded.forEach((ex, i) => {
      finalMapping.excluded[`excluded_${i}`] = ex;
    });
    
    // Save final mapping
    const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalMapping, null, 2));
    
    console.log(`💾 Saved final mapping to: ${outputPath}\n`);
    
    // Generate validation report
    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalAPIDistricts: 735,
        mappedDistricts: finalMatches.length,
        excludedDistricts: excluded.length,
        coverage: finalMapping.coverage,
        needsReview: needsReview.length
      },
      breakdown: {
        exactMatches: allMatches.matches.filter(m => m.confidence === 1.0 && m.method === 'exact-match').length,
        variationMatches: allMatches.matches.filter(m => m.method === 'variation-match').length,
        manualVerified: finalMatches.filter(m => m.method === 'manual-verified').length,
        autoApproved: finalMatches.filter(m => m.method === 'auto-approved').length
      },
      needsReview: needsReview,
      excluded: excluded
    };
    
    fs.writeFileSync(
      path.join(__dirname, '..', 'analysis-output', 'validation-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  FINAL SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total API Districts:      735`);
    console.log(`Mapped Districts:         ${finalMatches.length}`);
    console.log(`Excluded Districts:       ${excluded.length}`);
    console.log(`Coverage:                 ${finalMapping.coverage}`);
    console.log(`Needs Review:             ${needsReview.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('✅ Phase 3 Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review validation-report.json');
    console.log('2. Update frontend to use perfect-district-mapping-v2.json');
    console.log('3. Run validation tests');
    console.log('4. Deploy to production\n');
    
    rl.close();
    
  } catch (error) {
    console.error('\n❌ Phase 3 Failed:', error.message);
    console.error(error.stack);
    rl.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
