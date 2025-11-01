/**
 * Location Detection Utility
 * Detects user's location and finds their district
 */

import * as turf from '@turf/turf';

/**
 * Get user's current position using browser Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Find district from coordinates using GeoJSON boundaries
 * @param {number} longitude 
 * @param {number} latitude 
 * @param {Object} geoJSON - India districts GeoJSON
 * @returns {Object|null} - District feature or null
 */
export const findDistrictFromCoordinates = (longitude, latitude, geoJSON) => {
  if (!geoJSON || !geoJSON.features) {
    console.error('Invalid GeoJSON data');
    return null;
  }

  const point = turf.point([longitude, latitude]);

  // Find the district polygon that contains this point
  for (const feature of geoJSON.features) {
    try {
      if (feature.geometry && feature.geometry.type) {
        const polygon = turf.feature(feature.geometry);
        if (turf.booleanPointInPolygon(point, polygon)) {
          return feature;
        }
      }
    } catch (error) {
      console.warn('Error checking district:', feature.properties?.district, error);
    }
  }

  return null;
};

/**
 * Get district name from feature properties
 * @param {Object} feature - GeoJSON feature
 * @returns {string|null}
 */
export const getDistrictNameFromFeature = (feature) => {
  if (!feature || !feature.properties) return null;
  
  return feature.properties.District || 
         feature.properties.district || 
         feature.properties.DISTRICT || 
         feature.properties.name || 
         null;
};

/**
 * Check if coordinates are within India's approximate bounds
 * @param {number} longitude 
 * @param {number} latitude 
 * @returns {boolean}
 */
export const isWithinIndiaBounds = (longitude, latitude) => {
  // Approximate bounds of India
  const INDIA_BOUNDS = {
    minLat: 6.5,
    maxLat: 35.5,
    minLng: 68.0,
    maxLng: 97.5
  };

  return (
    latitude >= INDIA_BOUNDS.minLat &&
    latitude <= INDIA_BOUNDS.maxLat &&
    longitude >= INDIA_BOUNDS.minLng &&
    longitude <= INDIA_BOUNDS.maxLng
  );
};

/**
 * Main function to detect user's district
 * @param {Object} geoJSON - India districts GeoJSON
 * @returns {Promise<{districtName: string, coordinates: {latitude: number, longitude: number}}>}
 */
export const detectUserDistrict = async (geoJSON) => {
  try {
    console.log('🌍 Detecting user location...');
    
    // Get user's coordinates
    const coordinates = await getUserLocation();
    console.log('📍 User coordinates:', coordinates);

    // Check if within India
    if (!isWithinIndiaBounds(coordinates.longitude, coordinates.latitude)) {
      throw new Error('Location is outside India');
    }

    // Find district
    const districtFeature = findDistrictFromCoordinates(
      coordinates.longitude,
      coordinates.latitude,
      geoJSON
    );

    if (!districtFeature) {
      throw new Error('Could not determine district from location');
    }

    const districtName = getDistrictNameFromFeature(districtFeature);
    
    if (!districtName) {
      throw new Error('District name not found in GeoJSON');
    }

    console.log('✅ Detected district:', districtName);

    return {
      districtName,
      coordinates,
      feature: districtFeature
    };
  } catch (error) {
    console.error('❌ Location detection failed:', error.message);
    throw error;
  }
};
