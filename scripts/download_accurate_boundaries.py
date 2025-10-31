#!/usr/bin/env python3
"""
Download Accurate District Boundaries from GADM

This script downloads India district boundaries from GADM database
and extracts the 16 districts we need.

Requirements:
    pip install geopandas requests

Usage:
    python download_accurate_boundaries.py
"""

import geopandas as gpd
import json
import os
from pathlib import Path

print("=" * 80)
print("DOWNLOADING ACCURATE DISTRICT BOUNDARIES FROM GADM")
print("=" * 80)
print()

# Create output directory
output_dir = Path("accurate_boundaries")
output_dir.mkdir(exist_ok=True)

# Districts to extract (name as it appears in GADM)
districts_to_find = {
    # District name in GADM : (State, Output filename)
    'Malerkotla': ('Punjab', 'malerkotla'),
    'Vijayanagara': ('Karnataka', 'vijayanagara'),
    'Ranipet': ('Tamil Nadu', 'ranipet'),
    'Bajali': ('Assam', 'bajali'),
    'Tamulpur': ('Assam', 'tamulpur'),
    'Hanumakonda': ('Telangana', 'hanumakonda'),
    'Pakyong': ('Sikkim', 'pakyong'),
    'Soreng': ('Sikkim', 'soreng'),
    'Mayiladuthurai': ('Tamil Nadu', 'mayiladuthurai'),
    'Rae Bareli': ('Uttar Pradesh', 'rae-bareli'),
    'Raebareli': ('Uttar Pradesh', 'rae-bareli'),  # Try alternate spelling
    'Sarangarh Bilaigarh': ('Chhattisgarh', 'sarangarh-bilaigarh'),
    'Khairagarh Chhuikhadan Gandai': ('Chhattisgarh', 'khairagarh-chhuikhadan-gandai'),
    'Manendragarh Chirmiri Bharatpur': ('Chhattisgarh', 'manendragarh-chirmiri-bharatpur'),
    'Mohla Manpur Ambagarh Chowki': ('Chhattisgarh', 'mohla-manpur-ambagarh-chowki'),
    'Sakti': ('Chhattisgarh', 'sakti'),
    'Eastern West Khasi Hills': ('Meghalaya', 'eastern-west-khasi-hills')
}

print("📥 Downloading GADM India district data...")
print("   URL: https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_3.json")
print("   Size: ~100MB (this may take a few minutes)")
print()

try:
    # Download GADM data
    url = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_3.json"
    gdf = gpd.read_file(url)
    
    print(f"✅ Downloaded! Total districts in GADM: {len(gdf)}")
    print()
    
    # Show sample of available districts
    print("📋 Sample districts in GADM:")
    print(gdf[['NAME_3', 'NAME_2', 'NAME_1']].head(10).to_string())
    print()
    
    found = 0
    not_found = []
    
    print("🔍 Searching for our 16 districts...")
    print()
    
    for district_name, (state_name, output_name) in districts_to_find.items():
        # Try to find district
        district = gdf[gdf['NAME_3'] == district_name]
        
        if not district.empty:
            # Convert to GeoJSON format
            geojson = json.loads(district.to_json())
            
            # Extract the feature
            feature = geojson['features'][0]
            
            # Update properties to match our format
            feature['properties'] = {
                'District': district_name.upper(),
                'STATE': state_name.upper(),
                'id': 800 + found,  # Sequential IDs starting from 800
                'FULL_NAME': f"{district_name}, {state_name}"
            }
            
            # Count coordinates
            coords = feature['geometry']['coordinates']
            if feature['geometry']['type'] == 'Polygon':
                point_count = len(coords[0])
            elif feature['geometry']['type'] == 'MultiPolygon':
                point_count = sum(len(ring[0]) for ring in coords)
            else:
                point_count = 0
            
            # Save
            output_path = output_dir / f"{output_name}.geojson"
            with open(output_path, 'w') as f:
                json.dump(feature, f, indent=2)
            
            print(f"✅ {district_name} ({state_name})")
            print(f"   Points: {point_count}")
            print(f"   Saved: {output_path}")
            found += 1
        else:
            print(f"❌ {district_name} ({state_name}) - NOT FOUND")
            not_found.append(district_name)
        
        print()
    
    print("=" * 80)
    print("DOWNLOAD COMPLETE")
    print("=" * 80)
    print(f"\n✅ Found: {found} / {len(districts_to_find)}")
    print(f"❌ Not found: {len(not_found)}")
    
    if not_found:
        print(f"\n⚠️  Missing districts:")
        for d in not_found:
            print(f"   - {d}")
        print("\n   These may be too new for GADM or have different names")
        print("   Try OpenStreetMap for these districts")
    
    print(f"\n💾 Files saved to: {output_dir.absolute()}")
    print("\n🔄 Next steps:")
    print("   1. Copy files to research/ folder")
    print("   2. Run: node scripts/validate-researcher-geojson.js")
    print("   3. Run: node scripts/integrate-researcher-geojson.js")
    print("   4. Restart Docker")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nTroubleshooting:")
    print("   1. Check internet connection")
    print("   2. Ensure geopandas is installed: pip install geopandas")
    print("   3. Try downloading GADM file manually from:")
    print("      https://gadm.org/download_country.html")
