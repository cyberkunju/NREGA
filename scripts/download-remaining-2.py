#!/usr/bin/env python3
"""
Download the 2 remaining districts with alternative queries
"""

import requests
import json
import time
import os

def try_multiple_queries(district_name, state_name, geo_id, alternatives):
    """Try multiple name variations"""
    
    print(f"\n{'='*60}")
    print(f"Trying {district_name}, {state_name}")
    print(f"{'='*60}")
    
    for i, name_variant in enumerate([district_name] + alternatives, 1):
        print(f"\n[{i}] Trying: '{name_variant}'...", end=" ", flush=True)
        
        query = f"""
        [out:json][timeout:300];
        (
          relation["boundary"="administrative"]["admin_level"="5"]["name"="{name_variant}"]["state"="{state_name}"];
          relation["boundary"="administrative"]["admin_level"="5"]["name:en"="{name_variant}"];
          relation["boundary"="administrative"]["admin_level"="5"]["name"~"{name_variant}",i];
        );
        out geom;
        """
        
        try:
            response = requests.post(
                "https://overpass-api.de/api/interpreter",
                data={'data': query},
                timeout=300
            )
            
            if response.status_code == 200:
                osm_data = response.json()
                
                if osm_data.get('elements'):
                    print(f"✅ FOUND!")
                    
                    # Convert to GeoJSON
                    geojson = convert_to_geojson(osm_data, district_name, state_name, geo_id)
                    points = count_points(geojson)
                    
                    # Save
                    filename = f"research/{district_name.lower().replace(' ', '-')}.geojson"
                    os.makedirs('research', exist_ok=True)
                    
                    with open(filename, 'w') as f:
                        json.dump(geojson, f, indent=2)
                    
                    print(f"    Saved: {points} points → {filename}")
                    return True
                else:
                    print("❌ No data")
            else:
                print(f"❌ Error {response.status_code}")
        
        except Exception as e:
            print(f"❌ {e}")
        
        time.sleep(2)
    
    print(f"\n❌ All attempts failed for {district_name}")
    return False

def convert_to_geojson(osm_data, district_name, state_name, geo_id):
    """Convert OSM data to GeoJSON"""
    coordinates = []
    
    for element in osm_data['elements']:
        if element['type'] == 'relation' and 'members' in element:
            for member in element['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    ring = [[node['lon'], node['lat']] for node in member['geometry']]
                    if len(ring) > 2:
                        coordinates.append(ring)
    
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
            "source": "OpenStreetMap"
        },
        "geometry": {
            "type": "Polygon" if len(coordinates) == 1 else "MultiPolygon",
            "coordinates": coordinates if len(coordinates) > 1 else coordinates
        }
    }

def count_points(geojson):
    """Count coordinate points"""
    coords = geojson['geometry']['coordinates']
    if geojson['geometry']['type'] == 'Polygon':
        return sum(len(ring) for ring in coords)
    else:
        return sum(sum(len(ring) for ring in polygon) for polygon in coords)

# Try with alternative spellings
districts = [
    ("Bajali", "Assam", 801, ["Bajali district", "Bājāli"]),
    ("Rae Bareli", "Uttar Pradesh", 815, ["Raebareli", "Rae Bareilly", "Raebarelli", "Rai Bareli"]),
]

print("="*60)
print("DOWNLOADING REMAINING 2 DISTRICTS")
print("="*60)

success = 0
for district, state, geo_id, alternatives in districts:
    if try_multiple_queries(district, state, geo_id, alternatives):
        success += 1

print("\n" + "="*60)
print(f"✅ Downloaded: {success}/2")
print("="*60)
