#!/usr/bin/env python3
"""
Download Missing District Boundaries from OpenStreetMap
Simple, fast, accurate - no Docker needed
"""

import requests
import json
import time
import os

# Missing districts that need accurate boundaries
MISSING_DISTRICTS = [
    ("Ranipet", "Tamil Nadu", 802),
    ("Vijayanagara", "Karnataka", 803),
    ("Mayiladuthurai", "Tamil Nadu", 805),
    ("Hanumakonda", "Telangana", 804),
    ("Malerkotla", "Punjab", 800),
    ("Bajali", "Assam", 801),
    ("Pakyong", "Sikkim", 806),
    ("Soreng", "Sikkim", 807),
    ("Tamulpur", "Assam", 808),
    ("Rae Bareli", "Uttar Pradesh", 815),
    ("Eastern West Khasi Hills", "Meghalaya", 814),
]

def download_district_boundary(district_name, state_name, geo_id):
    """Download detailed boundary from Overpass API"""
    
    print(f"⏳ Downloading {district_name}, {state_name}...", end=" ", flush=True)
    
    # Overpass query for district boundary
    query = f"""
    [out:json][timeout:300];
    area["name"="{state_name}"]["admin_level"="4"]->.state;
    (
      relation(area.state)["boundary"="administrative"]["admin_level"="5"]["name"="{district_name}"];
      relation(area.state)["boundary"="administrative"]["admin_level"="5"]["name:en"="{district_name}"];
    );
    out geom;
    """
    
    try:
        response = requests.post(
            "https://overpass-api.de/api/interpreter",
            data={'data': query},
            timeout=300
        )
        
        if response.status_code != 200:
            print(f"❌ API error: {response.status_code}")
            return None
        
        osm_data = response.json()
        
        if not osm_data.get('elements'):
            print("❌ No data found")
            return None
        
        # Convert to GeoJSON
        geojson = convert_to_geojson(osm_data, district_name, state_name, geo_id)
        
        # Count points
        total_points = count_points(geojson)
        
        # Save file
        filename = f"research/{district_name.lower().replace(' ', '-')}.geojson"
        os.makedirs('research', exist_ok=True)
        
        with open(filename, 'w') as f:
            json.dump(geojson, f, indent=2)
        
        print(f"✅ {total_points} points → {filename}")
        return geojson
        
    except requests.Timeout:
        print("❌ Timeout")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def convert_to_geojson(osm_data, district_name, state_name, geo_id):
    """Convert OSM data to GeoJSON format"""
    
    coordinates = []
    
    for element in osm_data['elements']:
        if element['type'] == 'relation' and 'members' in element:
            # Extract outer ways
            for member in element['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    ring = [[node['lon'], node['lat']] for node in member['geometry']]
                    if len(ring) > 2:
                        coordinates.append(ring)
    
    # If no coordinates found, try direct ways
    if not coordinates:
        for element in osm_data['elements']:
            if element['type'] == 'way' and 'geometry' in element:
                ring = [[node['lon'], node['lat']] for node in element['geometry']]
                if len(ring) > 2:
                    coordinates.append(ring)
    
    return {
        "type": "Feature",
        "properties": {
            "District": district_name.upper(),
            "STATE": state_name.upper(),
            "id": geo_id,
            "FULL_NAME": f"{district_name}, {state_name}",
            "source": "OpenStreetMap",
            "downloaded": time.strftime("%Y-%m-%d")
        },
        "geometry": {
            "type": "Polygon" if len(coordinates) == 1 else "MultiPolygon",
            "coordinates": coordinates if len(coordinates) > 1 else coordinates
        }
    }

def count_points(geojson):
    """Count total coordinate points"""
    coords = geojson['geometry']['coordinates']
    if geojson['geometry']['type'] == 'Polygon':
        return sum(len(ring) for ring in coords)
    else:  # MultiPolygon
        return sum(sum(len(ring) for ring in polygon) for polygon in coords)

def main():
    print("="*80)
    print("DOWNLOADING MISSING DISTRICT BOUNDARIES")
    print("="*80)
    print(f"\nTotal districts: {len(MISSING_DISTRICTS)}\n")
    
    downloaded = []
    failed = []
    
    for district_name, state_name, geo_id in MISSING_DISTRICTS:
        result = download_district_boundary(district_name, state_name, geo_id)
        
        if result:
            downloaded.append(district_name)
        else:
            failed.append(district_name)
        
        # Rate limit: 3 seconds between requests
        time.sleep(3)
    
    # Summary
    print("\n" + "="*80)
    print(f"✅ Successfully downloaded: {len(downloaded)}/{len(MISSING_DISTRICTS)}")
    
    if downloaded:
        print("\nDownloaded:")
        for name in downloaded:
            print(f"  ✅ {name}")
    
    if failed:
        print(f"\n❌ Failed: {len(failed)}")
        for name in failed:
            print(f"  ❌ {name}")
        print("\nTip: Failed districts may need manual download from:")
        print("  https://www.openstreetmap.org/")
    
    print("="*80)
    print("\nNext steps:")
    print("1. Check research/ folder for downloaded GeoJSON files")
    print("2. Run: node scripts/integrate-researcher-geojson.js")
    print("3. Test the map!")

if __name__ == "__main__":
    main()
