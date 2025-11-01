import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { getHeatmapData } from '../../services/api';
import { normalizeDistrictName, createLookupKeys, findBestMatch } from '../../utils/districtNameMapping';
import perfectMapping from '../../data/perfect-district-mapping-v2.json';
import MetricSelector from './MetricSelector';
import Legend from './Legend';
import Tooltip from './Tooltip';
import LoadingOverlay from './LoadingOverlay';
import SearchBar from './SearchBar';
import Logo from './Logo';
import './MapView.css';

// Metric configurations with color ramps
const METRICS = {
  // Primary Metrics
  paymentPercentage: {
    key: 'paymentPercentage',
    title: 'Payment Timeliness',
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 25, '#f59e0b', 50, '#eab308', 75, '#84cc16', 100, '#10b981'],
    icon: '⏱️',
    category: 'primary'
  },
  averageDays: {
    key: 'averageDays',
    title: 'Average Payment Days',
    unit: ' days',
    format: (val) => `${Math.round(val)} days`,
    colorStops: [0, '#10b981', 25, '#84cc16', 50, '#eab308', 75, '#f59e0b', 100, '#ef4444', 105, '#dc2626'],
    icon: '📅',
    category: 'primary'
  },
  womenParticipation: {
    key: 'womenParticipationPercent',
    title: 'Women Participation',
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 25, '#f59e0b', 50, '#eab308', 75, '#84cc16', 100, '#10b981'],
    icon: '👤',
    category: 'primary'
  },
  
  // Advanced Metrics
  households100Days: {
    key: 'households100DaysPercent',
    title: '100-Day Employment',
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 5, '#f59e0b', 10, '#eab308', 15, '#84cc16', 20, '#10b981'],
    icon: '💯',
    category: 'advanced'
  },
  scstParticipation: {
    key: 'scstParticipationPercent',
    title: 'SC/ST Participation',
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 15, '#f59e0b', 30, '#eab308', 45, '#84cc16', 60, '#10b981'],
    icon: '🤝',
    category: 'advanced'
  },
  workCompletion: {
    key: 'workCompletionPercent',
    title: 'Work Completion Rate',
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 25, '#f59e0b', 50, '#eab308', 75, '#84cc16', 100, '#10b981'],
    icon: '✅',
    category: 'advanced'
  },
  averageWage: {
    key: 'averageWageRate',
    title: 'Average Wage Rate',
    unit: '/day',
    format: (val) => `₹${Math.round(val)}`,
    colorStops: [0, '#dc2626', 150, '#ef4444', 200, '#f59e0b', 250, '#eab308', 300, '#84cc16', 350, '#10b981'],
    icon: '💵',
    category: 'advanced'
  },
  agricultureWorks: {
    key: 'agricultureWorksPercent',
    title: 'Agriculture Works',
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 20, '#f59e0b', 40, '#eab308', 60, '#84cc16', 80, '#10b981'],
    icon: '🌾',
    category: 'advanced'
  }
};

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [enrichedGeoJSON, setEnrichedGeoJSON] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('paymentPercentage');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  
  const hoveredDistrictId = useRef(null);
  const enrichedDataRef = useRef(null); // Store enriched data for property lookups
  const selectedMetricRef = useRef(selectedMetric); // Ref to always have current metric

  // Initialize MapLibre GL map (Task 3)
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    console.log('🗺️  [MapView] Initializing MapLibre GL...');

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#a8dadc'
              }
            }
          ],
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
        },
        center: [78.9629, 22.5937], // Center of India
        zoom: 4,
        minZoom: 4,
        maxZoom: 10,
        renderWorldCopies: false, // Prevent world duplication
        dragRotate: false, // Disable rotation
        touchZoomRotate: false
      });

      // Store initial center and bounds
      let initialCenter = { lng: 78.9629, lat: 22.5937 };
      let initialBounds = null;

      map.current.on('load', () => {
        console.log('✅ [MapView] Map loaded successfully');
        setMapLoaded(true);
      });

      // Snap back to center at default zoom, constrain at higher zoom
      map.current.on('moveend', () => {
        if (!initialBounds) return;
        
        const currentZoom = map.current.getZoom();
        const currentCenter = map.current.getCenter();
        
        // At default zoom level (4-4.5), snap back to center
        if (currentZoom <= 4.5) {
          const distanceFromCenter = Math.sqrt(
            Math.pow(currentCenter.lng - initialCenter.lng, 2) + 
            Math.pow(currentCenter.lat - initialCenter.lat, 2)
          );
          
          // If moved more than a tiny amount, snap back
          if (distanceFromCenter > 0.1) {
            map.current.easeTo({
              center: initialCenter,
              duration: 500,
              easing: (t) => t * (2 - t) // easeOutQuad
            });
          }
        } else {
          // When zoomed in, constrain to India's bounds
          let needsCorrection = false;
          let newCenter = { ...currentCenter };
          
          // Check longitude bounds
          if (currentCenter.lng < initialBounds.getWest()) {
            newCenter.lng = initialBounds.getWest() + 1;
            needsCorrection = true;
          } else if (currentCenter.lng > initialBounds.getEast()) {
            newCenter.lng = initialBounds.getEast() - 1;
            needsCorrection = true;
          }
          
          // Check latitude bounds
          if (currentCenter.lat < initialBounds.getSouth()) {
            newCenter.lat = initialBounds.getSouth() + 1;
            needsCorrection = true;
          } else if (currentCenter.lat > initialBounds.getNorth()) {
            newCenter.lat = initialBounds.getNorth() - 1;
            needsCorrection = true;
          }
          
          // Smoothly pan back if out of bounds
          if (needsCorrection) {
            map.current.panTo(newCenter, { duration: 300 });
          }
        }
      });

      // Store initial bounds reference
      window.setInitialBounds = (bounds) => {
        initialBounds = bounds;
      };

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.current.on('error', (e) => {
        console.error('❌ [MapView] Map error:', e);
        // Don't show error for minor tile loading issues
        if (e.error && !e.error.message.includes('tile')) {
          console.error('Critical map error:', e.error);
          setError('Map failed to load. Please refresh the page.');
        }
      });
    } catch (err) {
      console.error('❌ [MapView] Failed to initialize map:', err);
      setError('Failed to initialize map. Please refresh the page.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fetch heatmap data and GeoJSON, then enrich (Task 2)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('📊 [MapView] Loading data...');

        // Fetch heatmap data from API
        const heatmapResponse = await getHeatmapData();
        console.log('🔍 Raw heatmap response:', heatmapResponse);
        const apiData = heatmapResponse.data || heatmapResponse;
        console.log(`✅ Loaded ${apiData.length} districts from API`);
        console.log('🔍 First 3 districts:', apiData.slice(0, 3));
        console.log('🔍 Women participation check:', apiData.filter(d => d.womenParticipationPercent !== null).slice(0, 5).map(d => `${d.districtName}: ${d.womenParticipationPercent}%`));

        // Load GeoJSON from public folder
        const geoResponse = await fetch('/india-districts.geojson');
        if (!geoResponse.ok) {
          console.error('GeoJSON fetch failed:', geoResponse.status, geoResponse.statusText);
          throw new Error(`Failed to load district GeoJSON: ${geoResponse.status}`);
        }
        const geoJSON = await geoResponse.json();
        console.log(`✅ Loaded GeoJSON with ${geoJSON.features.length} features`);
        
        // Validate GeoJSON structure
        if (!geoJSON.features || geoJSON.features.length === 0) {
          throw new Error('Invalid GeoJSON: No features found');
        }
        
        console.log('Sample feature:', geoJSON.features[0].properties);

        // Create comprehensive lookup map for performance data using perfect mapping
        const dataLookup = {};
        
        // Build reverse mapping: geoId -> API data
        const geoIdToApiMap = {};
        
        apiData.forEach(district => {
          // Create composite key for perfect mapping lookup (using : separator for v2)
          const compositeKey = `${normalizeDistrictName(district.stateName)}:${normalizeDistrictName(district.districtName)}`;
          const mapping = perfectMapping.mappings[compositeKey];
          
          // Debug Andaman districts
          if (district.districtName && (district.districtName.includes('Andaman') || district.districtName.includes('Nicobar'))) {
            console.log(`🔍 ANDAMAN DEBUG:`, {
              districtName: district.districtName,
              stateName: district.stateName,
              compositeKey: compositeKey,
              mappingFound: !!mapping,
              geoId: mapping?.geoId
            });
          }
          
          if (mapping && mapping.geoId) {
            // Map by geoId for perfect matching
            if (!geoIdToApiMap[mapping.geoId]) {
              geoIdToApiMap[mapping.geoId] = [];
            }
            geoIdToApiMap[mapping.geoId].push(district);
          }
          
          // Also add fallback lookup keys for backward compatibility
          const lookupKeys = createLookupKeys(district.districtName, district.stateName);
          lookupKeys.forEach(key => {
            if (!dataLookup[key]) {
              dataLookup[key] = district;
            }
          });
        });

        console.log(`📊 Perfect mapping: ${Object.keys(geoIdToApiMap).length} geoIds mapped`);
        console.log(`📊 Fallback lookup: ${Object.keys(dataLookup).length} keys for ${apiData.length} districts`);
        console.log(`📍 Sample lookup keys:`, Object.keys(dataLookup).slice(0, 15));
        console.log(`📍 Sample API data:`, apiData.slice(0, 3).map(d => `${d.districtName} (${d.stateName})`));
        
        // Debug: Check if createLookupKeys is working
        const testKeys = createLookupKeys('Pune', 'Maharashtra');
        console.log(`🧪 Test createLookupKeys('Pune', 'Maharashtra'):`, testKeys);
        console.log(`🧪 Is 'maharashtra:pune' in dataLookup?`, dataLookup['maharashtra:pune'] ? 'YES' : 'NO');

        // Enrich GeoJSON features with performance data using perfect mapping
        let perfectMatchCount = 0;
        let fallbackMatchCount = 0;
        let noMatchCount = 0;
        
        const enriched = {
          ...geoJSON,
          features: geoJSON.features.map(feature => {
            const props = feature.properties;
            // Handle different property naming conventions in GeoJSON
            const districtNameRaw = (props.District || props.district);
            const stateNameRaw = (props.STATE || props.st_nm);
            const geoId = props.dt_code || props.id;
            
            let perfData = null;
            
            // Strategy 1: Use perfect mapping via geoId
            // TEMPORARILY DISABLED: Manual fixes have wrong geoIds causing wrong data display
            // TODO: Regenerate perfect mapping with correct geoIds from GeoJSON
            // const apiDataArray = geoIdToApiMap[geoId];
            // if (apiDataArray && apiDataArray.length > 0) {
            //   perfData = apiDataArray[0]; // Use first match (should only be one)
            //   perfectMatchCount++;
            // }
            
            // Strategy 2: Use perfect mapping to find API key, then lookup data
            if (!perfData) {
              // First, try to find this GeoJSON district in the perfect mapping
              // The mapping structure is: "api-state:api-district" -> { geoDistrict, geoState, geoId }
              // We need to reverse lookup: find the key where geoDistrict matches our GeoJSON district
              
              let apiKey = null;
              const normalizedState = normalizeDistrictName(stateNameRaw);
              const normalizedDistrict = normalizeDistrictName(districtNameRaw);
              
              // Search through perfect mapping for a match
              for (const [key, value] of Object.entries(perfectMapping.mappings)) {
                if (value.geoDistrict === districtNameRaw && value.geoState === stateNameRaw) {
                  apiKey = key;
                  break;
                }
              }
              
              // Debug first 3 districts 
              if (noMatchCount + fallbackMatchCount + perfectMatchCount < 3) {
                console.log(`🔍 GeoJSON: "${districtNameRaw}" (${stateNameRaw})`);
                console.log(`   Normalized: "${normalizedState}:${normalizedDistrict}"`);
                console.log(`   API key from mapping: ${apiKey || 'NOT FOUND'}`);
                console.log(`   Data in lookup: ${apiKey && dataLookup[apiKey] ? '✓' : '✗'}`);
              }
              
              // If we found the API key, use it to lookup the data
              if (apiKey && dataLookup[apiKey]) {
                perfData = dataLookup[apiKey];
                fallbackMatchCount++;
              }
            }
            
            // Strategy 3: Fuzzy matching DISABLED to prevent wrong matches
            // The fuzzy matching was causing Kolkata to match with Soreng
            // Better to show no data than wrong data
            // if (!perfData) {
            //   const bestMatch = findBestMatch(districtNameRaw, stateNameRaw, 
            //     Object.keys(dataLookup).map(key => key.split(':').pop() || key)
            //   );
            //   if (bestMatch) {
            //     perfData = dataLookup[bestMatch] || dataLookup[normalizeDistrictName(bestMatch)];
            //     if (perfData) {
            //       fallbackMatchCount++;
            //     }
            //   }
            // }
            
            if (!perfData) {
              noMatchCount++;
            }

            return {
              ...feature,
              properties: {
                ...props,
                // Keep original GeoJSON properties (handle both naming conventions)
                district_name: districtNameRaw,
                state_name: stateNameRaw,
                dt_code: props.dt_code || props.id,
                st_code: props.st_code || props.State_LGD,
                // Add performance metrics (using camelCase from API)
                hasData: !!perfData,
                paymentPercentage: perfData?.paymentPercentage ?? null,
                averageDays: perfData?.averageDays ?? null,
                womenParticipationPercent: perfData?.womenParticipationPercent ?? null,
                totalHouseholds: perfData?.totalHouseholds ?? null,
                // Advanced metrics
                households100DaysPercent: perfData?.households100DaysPercent ?? null,
                scstParticipationPercent: perfData?.scstParticipationPercent ?? null,
                workCompletionPercent: perfData?.workCompletionPercent ?? null,
                averageWageRate: perfData?.averageWageRate ?? null,
                agricultureWorksPercent: perfData?.agricultureWorksPercent ?? null,
                month: perfData?.month ?? null,
                year: perfData?.finYear ?? null,
                // Store API district name for navigation
                apiDistrictName: perfData?.districtName ?? null,
                apiStateName: perfData?.stateName ?? null,
                // Debug info
                matchedWith: perfData ? `${perfData.districtName}, ${perfData.stateName}` : null
              }
            };
          })
        };

        const withData = enriched.features.filter(f => f.properties.hasData).length;
        const withoutData = enriched.features.filter(f => !f.properties.hasData);
        console.log(`📊 Enriched ${withData}/${enriched.features.length} features with data (${((withData/enriched.features.length)*100).toFixed(1)}% coverage)`);
        console.log(`🎯 Match statistics: Perfect=${perfectMatchCount}, Fallback=${fallbackMatchCount}, None=${noMatchCount}`);
        console.log(`📍 Sample enriched feature:`, enriched.features[0].properties);
        console.log(`✅ Districts WITH data:`, enriched.features.filter(f => f.properties.hasData).slice(0, 5).map(f => `${f.properties.district_name} → ${f.properties.matchedWith}`));
        console.log(`❌ Districts WITHOUT data:`, withoutData.slice(0, 10).map(f => {
          const props = f.properties;
          const districtName = props.district_name;
          const stateName = props.state_name;
          return `${districtName}, ${stateName}`;
        }));
        
        // Log specific problematic districts for debugging
        const problematicDistricts = withoutData.filter(f => {
          const name = f.properties.district_name?.toLowerCase();
          return name?.includes('parganas') || name?.includes('cooch') || name?.includes('koch');
        });
        if (problematicDistricts.length > 0) {
          console.log(`🔍 Problematic districts (should have data):`, problematicDistricts.map(f => 
            `${f.properties.district_name}, ${f.properties.state_name}`
          ));
        }

        // Store enriched data for property lookups
        enrichedDataRef.current = enriched;
        setEnrichedGeoJSON(enriched);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        setError('Failed to load district data. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Add source and layers when map and data are ready (Task 4)
  useEffect(() => {
    if (!mapLoaded || !enrichedGeoJSON || !map.current) return;
    if (map.current.getSource('districts')) return; // Avoid re-adding

    console.log('🎨 [MapView] Adding source and layers...');

    map.current.addSource('districts', {
      type: 'geojson',
      data: enrichedGeoJSON,
      generateId: true // ESSENTIAL for feature-state interactions
    });

    if (map.current && enrichedGeoJSON.features.length > 0) {
      const bbox = turf.bbox(enrichedGeoJSON);
      const bounds = [
        [bbox[0], bbox[1]], // Southwest
        [bbox[2], bbox[3]]  // Northeast
      ];
      
      map.current.fitBounds(bounds, {
        padding: 40,
        duration: 0,
        maxZoom: 4 // Prevent fitBounds from zooming in too much
      });
      
      // Store initial bounds for constraint checking
      if (window.setInitialBounds) {
        window.setInitialBounds(map.current.getBounds());
      }
    }

    // Add heatmap fill layer with initial metric
    addHeatmapLayer(selectedMetric);

    // Placeholder districts to hide (new 2022 Chhattisgarh districts with only geometric placeholders)
    const PLACEHOLDER_DISTRICTS = [
      'khairagarh chhuikhadan gandai',
      'manendragarh chirmiri bharatpur',
      'mohla manpur ambagarh chowki',
      'sakti',
      'sarangarh bilaigarh'
    ];

    // Add India background (all districts combined) - lighter color
    map.current.addLayer({
      id: 'india-background',
      type: 'fill',
      source: 'districts',
      paint: {
        'fill-color': '#ffffff',
        'fill-opacity': [
          'case',
          // Hide placeholder districts
          ['in', ['downcase', ['coalesce', ['get', 'district_name'], ['get', 'district'], ['get', 'DISTRICT'], '']], ['literal', PLACEHOLDER_DISTRICTS]],
          0,  // Completely transparent for placeholders
          1   // Normal for real districts
        ]
      }
    }, 'district-heatmap'); // Add below heatmap layer

    // Add district borders - make them more visible
    map.current.addLayer({
      id: 'district-borders',
      type: 'line',
      source: 'districts',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#1e293b',
          '#64748b'
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          2.5,
          0.8
        ],
        'line-opacity': [
          'case',
          // Hide borders for placeholder districts
          ['in', ['downcase', ['coalesce', ['get', 'district_name'], ['get', 'district'], ['get', 'DISTRICT'], '']], ['literal', PLACEHOLDER_DISTRICTS]],
          0,  // Invisible border for placeholders
          1   // Normal border for real districts
        ]
      }
    });

    // Add district labels (appear only when zoomed in)
    map.current.addLayer({
      id: 'district-labels',
      type: 'symbol',
      source: 'districts',
      minzoom: 5, // Labels appear at zoom level 5+ (changed from 6)
      filter: [
        '!',
        ['in', ['downcase', ['coalesce', ['get', 'district_name'], ['get', 'district'], ['get', 'DISTRICT'], '']], ['literal', PLACEHOLDER_DISTRICTS]]
      ],
      layout: {
        'text-field': ['get', 'district_name'], // Use the normalized property name
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5, 10,  // Smaller text at zoom 5
          7, 12,  // Regular text at zoom 7
          9, 14   // Larger text at zoom 9
        ],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.05,
        'text-max-width': 8,
        'text-allow-overlap': false,
        'text-ignore-placement': false
      },
      paint: {
        'text-color': '#2c3e50',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
        'text-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5, 0.6,  // More transparent at lower zoom
          7, 0.8,  // More opaque at higher zoom
          9, 1.0   // Fully opaque at high zoom
        ]
      }
    });

    console.log('✅ Layers added successfully');

    // Setup interactions (Task 7 & 8)
    setupInteractions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, enrichedGeoJSON, selectedMetric]);

  // Helper function to add heatmap layer
  const addHeatmapLayer = (metric) => {
    const metricConfig = METRICS[metric];
    const metricKey = metricConfig.key;

    // Placeholder districts to hide (new 2022 Chhattisgarh districts with only geometric placeholders)
    const PLACEHOLDER_DISTRICTS = [
      'khairagarh chhuikhadan gandai',
      'manendragarh chirmiri bharatpur',
      'mohla manpur ambagarh chowki',
      'sakti',
      'sarangarh bilaigarh'
    ];

    map.current.addLayer({
      id: 'district-heatmap',
      type: 'fill',
      source: 'districts',
      paint: {
        'fill-color': [
          'case',
          // Check if district has no data at all (null value, but NOT 0)
          // Use typeof to distinguish null from 0
          ['==', ['typeof', ['get', metricKey]], 'null'],
          '#bdbdbd', // Gray for no data
          // Otherwise use color scale (includes 0 values which will be red)
          [
            'interpolate',
            ['linear'],
            ['get', metricKey],
            ...metricConfig.colorStops
          ]
        ],
        'fill-opacity': [
          'case',
          // Hide placeholder districts completely
          ['in', ['downcase', ['coalesce', ['get', 'district_name'], ['get', 'district'], ['get', 'DISTRICT'], '']], ['literal', PLACEHOLDER_DISTRICTS]],
          0,  // Completely transparent for placeholders
          [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.9,
            0.7
          ]
        ]
      }
    });
  };

  // Update map colors when metric changes (Task 5)
  const updateMapColors = useCallback((newMetric) => {
    if (!map.current || !map.current.getLayer('district-heatmap')) return;

    const metricConfig = METRICS[newMetric];
    const metricKey = metricConfig.key;

    console.log(`🎨 Updating colors for metric: ${newMetric}`);

    map.current.setPaintProperty('district-heatmap', 'fill-color', [
      'case',
      // Check if district has no data at all (null value, but NOT 0)
      // Use typeof to distinguish null from 0
      ['==', ['typeof', ['get', metricKey]], 'null'],
      '#bdbdbd', // Gray for no data
      // Otherwise use color scale (includes 0 values which will be red)
      [
        'interpolate',
        ['linear'],
        ['get', metricKey],
        ...metricConfig.colorStops
      ]
    ]);
  }, []);

  // Handle metric selection change
  const handleMetricChange = (newMetric) => {
    console.log(`📊 Metric changed to: ${newMetric}`);
    setSelectedMetric(newMetric);
    selectedMetricRef.current = newMetric; // Update ref immediately
    updateMapColors(newMetric);
  };

  // Setup hover and click interactions (Task 7 & 8)
  const setupInteractions = () => {
    if (!map.current) return;

    // Remove existing event listeners to prevent duplicates
    map.current.off('mousemove', 'district-heatmap');
    map.current.off('mouseleave', 'district-heatmap');
    map.current.off('click', 'district-heatmap');

    // Hover effect
    map.current.on('mousemove', 'district-heatmap', (e) => {
      if (e.features.length === 0) return;

      const feature = e.features[0];
      const featureId = feature.id;

      // Update hover state
      if (hoveredDistrictId.current !== null && hoveredDistrictId.current !== featureId) {
        map.current.setFeatureState(
          { source: 'districts', id: hoveredDistrictId.current },
          { hover: false }
        );
      }

      hoveredDistrictId.current = featureId;
      map.current.setFeatureState(
        { source: 'districts', id: hoveredDistrictId.current },
        { hover: true }
      );

      // Get properties from rendered feature
      const props = feature.properties;
      
      // Look up full properties from enriched data if available
      let fullProps = props;
      if (enrichedDataRef.current && featureId !== undefined) {
        const matchedFeature = enrichedDataRef.current.features.find(f => 
          f.properties.dt_code === props.dt_code || 
          f.properties.id === props.id ||
          ((f.properties.District || f.properties.district) === (props.District || props.district) && 
           (f.properties.STATE || f.properties.st_nm) === (props.STATE || props.st_nm))
        );
        if (matchedFeature) {
          fullProps = matchedFeature.properties;
        }
      }
      
      const metricConfig = METRICS[selectedMetricRef.current];
      const metricValue = fullProps[metricConfig.key];

      // Get district and state names, handling both naming conventions
      const districtName = fullProps.district_name || fullProps.District || fullProps.district;
      const stateName = fullProps.state_name || fullProps.STATE || fullProps.st_nm;
      
      console.log('Hover - District:', districtName, 'State:', stateName);

      setTooltip({
        show: true,
        x: e.point.x,
        y: e.point.y,
        data: {
          districtName: districtName,
          stateName: stateName,
          currentMetric: metricConfig.title,
          currentValue: metricValue !== null && metricValue !== undefined 
            ? metricConfig.format(Math.min(100, metricValue)) // Cap display at 100
            : 'No data',
          hasData: fullProps.hasData,
          // All 3 primary metrics
          paymentPercentage: fullProps.paymentPercentage,
          averageDays: fullProps.averageDays,
          womenParticipationPercent: fullProps.womenParticipationPercent
        }
      });

      // Only show pointer cursor for districts with data
      map.current.getCanvas().style.cursor = fullProps.hasData ? 'pointer' : 'default';
    });

    map.current.on('mouseleave', 'district-heatmap', () => {
      if (hoveredDistrictId.current !== null) {
        map.current.setFeatureState(
          { source: 'districts', id: hoveredDistrictId.current },
          { hover: false }
        );
      }
      hoveredDistrictId.current = null;
      setTooltip({ show: false, x: 0, y: 0, data: null });
      map.current.getCanvas().style.cursor = '';
    });

    // Click to navigate
    map.current.on('click', 'district-heatmap', (e) => {
      if (e.features.length === 0) return;

      const feature = e.features[0];
      const props = feature.properties;
      
      // Look up full properties from enriched data
      let fullProps = props;
      if (enrichedDataRef.current && feature.id !== undefined) {
        const matchedFeature = enrichedDataRef.current.features.find(f => 
          f.properties.dt_code === props.dt_code || 
          f.properties.id === props.id ||
          ((f.properties.District || f.properties.district) === (props.District || props.district) && 
           (f.properties.STATE || f.properties.st_nm) === (props.STATE || props.st_nm))
        );
        if (matchedFeature) {
          fullProps = matchedFeature.properties;
        }
      }
      
      // Only navigate if district has API data
      if (!fullProps.hasData || !fullProps.apiDistrictName) {
        console.log(`⚠️ District has no data, not navigating`);
        return;
      }
      
      // Use API district name for navigation (not GeoJSON name)
      const districtName = fullProps.apiDistrictName;

      if (districtName) {
        console.log(`📍 Navigating to: ${districtName}`);
        navigate(`/district/${encodeURIComponent(districtName)}`);
      }
    });
  };

  return (
    <div className="map-wrapper">
      {loading && <LoadingOverlay message="Loading district data..." />}
      {error && (
        <div className="map-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      )}
      
      <Logo />
      <SearchBar onSelectDistrict={(districtName) => navigate(`/district/${encodeURIComponent(districtName)}`)} />
      
      <div ref={mapContainer} className="map-container" />
      
      {mapLoaded && enrichedGeoJSON && (
        <>
          <MetricSelector 
            selectedMetric={selectedMetric} 
            onChange={handleMetricChange}
            metrics={METRICS}
            onAdvancedToggle={setShowAdvancedMetrics}
          />
          {!showAdvancedMetrics && (
            <Legend 
              selectedMetric={selectedMetric}
              metricConfig={METRICS[selectedMetric]}
            />
          )}
          <Tooltip {...tooltip} />
        </>
      )}
    </div>
  );
};

export default MapView;
