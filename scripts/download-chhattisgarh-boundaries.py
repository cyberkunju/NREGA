#!/usr/bin/env python3
"""
Download Real Boundaries for Chhattisgarh Districts
These are the 5 hexagonal placeholder districts that need real boundaries
"""

import requests
import json
import time

class ChhattisgarhBoundaryDownloader:
    """Download boundaries for new Chhattisgarh districts"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'MGNREGA-Map-Project/1.0'
        })
        self.downloaded = []
        self.failed = []
    
    def query_overpass(self, district_name, variations):
        """Query Overpass API with multiple name variations"""
        
        # Try multiple name variations
        name_queries = ' '.join([f'relation["name"="{name}"]' for name in variations])
        
        query = f"""
        [out:json][timeout:300];
        [bbox:19.5,80.0,24.5,84.5];
        (
          relation["boundary"="administrative"]["admin_level"="5"]["name"~"{district_name}",i];
          relation["boundary"="administrative"]["admin_level"="6"]["name"~"{district_name}",i];
          {name_queries};
        );
        out geom;
        """
        
        try:
            print(f"  Querying Overpass API...")
            url = "https://overpass-api.de/api/interpreter"
            response = self.session.post(
                url, 
                data={'data': query}, 
                timeout=300
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('elements'):
                    return data
                else:
                    print(f"  ⚠️  No results found")
                    return None
            else:
                print(f"  ⚠️  API returned: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
            return None
    
    def convert_to_geojson(self, osm_data, district_name, state_name):
        """Convert OSM data to GeoJSON format"""
        
        if not osm_data or 'elements' not in osm_data:
            return None
        
        # Find the best element (relation with most members)
        best_element = None
        max_members = 0
        
        for element in osm_data['elements']:
            if element['type'] == 'relation':
                member_count = len(element.get('members', []))
                if member_count > max_members:
                    max_members = member_count
                    best_element = element
        
        if not best_element:
            return None
        
        # Extract coordinates from ways
        coordinates = []
        if 'members' in best_element:
            for member in best_element['members']:
                if member['type'] == 'way' and 'geometry' in member:
                    coords = [[node['lon'], node['lat']] for node in member['geometry']]
                    if len(coords) > 2:  # Valid polygon
                        coordinates.append(coords)
        
        if not coordinates:
            return None
        
        geojson = {
            "type": "Feature",
            "properties": {
                "District": district_name.upper(),
                "STATE": state_name.upper(),
                "FULL_NAME": f"{district_name}, {state_name}",
                "source": "OpenStreetMap",
                "downloaded": True,
                "osm_id": best_element.get('id')
            },
            "geometry": {
                "type": "MultiPolygon" if len(coordinates) > 1 else "Polygon",
                "coordinates": [coordinates] if len(coordinates) > 1 else coordinates
            }
        }
        
        return geojson
    
    def download_district(self, district_name, variations, state_name):
        """Download single district boundary"""
        
        print(f"\n{'='*60}")
        print(f"⏳ Downloading: {district_name}")
        print(f"{'='*60}")
        
        # Query Overpass API
        osm_data = self.query_overpass(district_name, variations)
        
        if not osm_data:
            print(f"  ❌ FAILED - Not found in OpenStreetMap")
            self.failed.append(district_name)
            return False
        
        # Convert to GeoJSON
        geojson = self.convert_to_geojson(osm_data, district_name, state_name)
        
        if not geojson:
            print(f"  ❌ FAILED - Could not convert to GeoJSON")
            self.failed.append(district_name)
            return False
        
        # Count points
        coords = geojson['geometry']['coordinates']
        if geojson['geometry']['type'] == 'MultiPolygon':
            total_points = sum(len(ring) for polygon in coords for ring in polygon)
        else:
            total_points = sum(len(ring) for ring in coords)
        
        # Save to file
        filename = f"../frontend/public/boundaries/{district_name.lower().replace(' ', '-').replace('-', '_')}.geojson"
        
        try:
            with open(filename, 'w') as f:
                json.dump(geojson, f, indent=2)
            
            self.downloaded.append((district_name, total_points, filename))
            print(f"  ✅ SUCCESS - {total_points} points")
            print(f"  📁 Saved to: {filename}")
            return True
            
        except Exception as e:
            print(f"  ❌ FAILED - Could not save file: {e}")
            self.failed.append(district_name)
            return False
    
    def download_all(self):
        """Download all 5 Chhattisgarh districts"""
        
        # Districts with name variations to try
        districts = [
            {
                'name': 'Manendragarh Chirmiri Bharatpur',
                'variations': [
                    'Manendragarh-Chirmiri-Bharatpur',
                    'Manendragarh Chirmiri Bharatpur',
                    'Manendragarh',
                    'Chirmiri',
                    'Bharatpur'
                ],
                'state': 'Chhattisgarh'
            },
            {
                'name': 'Sakti',
                'variations': [
                    'Sakti',
                    'Shakti'
                ],
                'state': 'Chhattisgarh'
            },
            {
                'name': 'Mohla Manpur Ambagarh Chowki',
                'variations': [
                    'Mohla-Manpur-Ambagarh Chowki',
                    'Mohla Manpur',
                    'Mohla',
                    'Manpur'
                ],
                'state': 'Chhattisgarh'
            },
            {
                'name': 'Khairagarh Chhuikhadan Gandai',
                'variations': [
                    'Khairagarh-Chhuikhadan-Gandai',
                    'Khairagarh',
                    'Chhuikhadan'
                ],
                'state': 'Chhattisgarh'
            },
            {
                'name': 'Sarangarh Bilaigarh',
                'variations': [
                    'Sarangarh-Bilaigarh',
                    'Sarangarh',
                    'Bilaigarh'
                ],
                'state': 'Chhattisgarh'
            }
        ]
        
        print("\n" + "="*60)
        print("CHHATTISGARH DISTRICT BOUNDARY DOWNLOADER")
        print("="*60)
        print(f"\nAttempting to download {len(districts)} districts...")
        print("\nNOTE: These are NEW districts (created 2022)")
        print("They may not be in OpenStreetMap yet.\n")
        
        for district in districts:
            self.download_district(
                district['name'],
                district['variations'],
                district['state']
            )
            time.sleep(3)  # Rate limit: 3 seconds between requests
        
        # Summary
        print("\n" + "="*60)
        print("DOWNLOAD SUMMARY")
        print("="*60)
        
        if self.downloaded:
            print(f"\n✅ Successfully downloaded: {len(self.downloaded)}/{len(districts)}")
            for name, points, filename in self.downloaded:
                print(f"  ✅ {name}: {points} points")
        
        if self.failed:
            print(f"\n❌ Failed to download: {len(self.failed)}/{len(districts)}")
            for name in self.failed:
                print(f"  ❌ {name}")
            
            print("\n⚠️  ALTERNATIVE SOLUTIONS:")
            print("  1. These districts are too new for OpenStreetMap")
            print("  2. Try GADM database: https://gadm.org/download_country.html")
            print("  3. Or hide these districts temporarily (see FIX_HEXAGONAL_DISTRICTS.md)")
        
        print("="*60 + "\n")

if __name__ == "__main__":
    print("\nStarting download process...")
    print("This may take 1-2 minutes per district.\n")
    
    downloader = ChhattisgarhBoundaryDownloader()
    downloader.download_all()
    
    print("\n✅ Download process complete!")
    print("\nNext steps:")
    print("1. Check the downloaded files in frontend/public/boundaries/")
    print("2. If downloads failed, see FIX_HEXAGONAL_DISTRICTS.md for alternatives")
    print("3. Run scripts/integrate-new-boundaries.js to add them to main GeoJSON\n")
