import * as d3 from 'd3-scale';
import * as d3Color from 'd3-color';
import { 
  interpolateYlGn, 
  interpolateYlOrRd, 
  interpolateBlues, 
  interpolatePurples 
} from 'd3-scale-chromatic';

/**
 * Color Scale Utilities for District Choropleth Map
 * Provides aesthetic color schemes and MapLibre GL JS compatible expressions
 * Compatible with both Mapbox GL and MapLibre GL (uses GL Style Spec)
 */

export const HEATMAP_PALETTES = {
  payment: {
    scheme: interpolateYlGn,
    name: "Yellow-Green",
    description: "Best for payment performance metrics",
    steps: 5
  },
  population: {
    scheme: interpolateYlOrRd,
    name: "Yellow-Orange-Red",
    description: "Best for population and household data",
    steps: 5
  },
  economic: {
    scheme: interpolateBlues,
    name: "Blues",
    description: "Best for economic indicators",
    steps: 5
  },
  employment: {
    scheme: interpolatePurples,
    name: "Purples",
    description: "Best for employment metrics",
    steps: 5
  },
  custom: {
    // Custom gradient matching existing design
    colors: ['#bdbdbd', '#616161', '#757575', '#9e9e9e', '#66bb6a', '#26a69a'],
    name: "MGNREGA Performance",
    description: "Custom colors for MGNREGA payment performance"
  }
};

/**
 * Create D3 color scale for data values
 * @param {Array} values - Array of numeric values
 * @param {string} palette - Palette key from HEATMAP_PALETTES
 * @returns {Function} D3 scale function
 */
export const createColorScale = (values, palette = 'payment') => {
  const filteredValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  
  if (filteredValues.length === 0) {
    return () => '#BDBDBD'; // Default gray
  }

  const minValue = Math.min(...filteredValues);
  const maxValue = Math.max(...filteredValues);

  const paletteConfig = HEATMAP_PALETTES[palette];
  
  if (paletteConfig.colors) {
    // Use custom color array
    return d3
      .scaleQuantize()
      .domain([minValue, maxValue])
      .range(paletteConfig.colors);
  }

  // Use D3 interpolator
  return d3
    .scaleSequential()
    .domain([minValue, maxValue])
    .interpolator(paletteConfig.scheme)
    .clamp(true);
};

/**
 * Generate MapLibre GL JS compatible color expression
 * @param {number} minValue - Minimum data value
 * @param {number} maxValue - Maximum data value
 * @param {string} propertyName - GeoJSON property name to color by
 * @param {string} palette - Palette key
 * @returns {Array} MapLibre expression array (GL Style Spec compatible)
 */
export const getMapboxColorExpression = (minValue, maxValue, propertyName = 'value', palette = 'payment') => {
  const paletteConfig = HEATMAP_PALETTES[palette];
  let colors;

  if (paletteConfig.colors) {
    // Use custom colors with quantize steps
    const steps = paletteConfig.colors.length;
    colors = paletteConfig.colors.flatMap((color, i) => {
      const value = minValue + ((maxValue - minValue) * i / (steps - 1));
      return [value, color];
    });
  } else {
    // Generate colors from D3 interpolator
    const steps = paletteConfig.steps || 9;
    colors = Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      const value = minValue + (maxValue - minValue) * t;
      const color = d3Color.color(paletteConfig.scheme(t));
      return [value, color.formatHex()];
    }).flat();
  }

  return [
    'interpolate',
    ['linear'],
    ['get', propertyName],
    ...colors
  ];
};

/**
 * Get color for a specific value (for legend and tooltips)
 * @param {number} value - Data value
 * @param {number} minValue - Minimum value in dataset
 * @param {number} maxValue - Maximum value in dataset
 * @param {string} palette - Palette key
 * @returns {string} Hex color string
 */
export const getColorForValue = (value, minValue, maxValue, palette = 'payment') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '#BDBDBD';
  }

  const paletteConfig = HEATMAP_PALETTES[palette];
  
  if (paletteConfig.colors) {
    const steps = paletteConfig.colors.length;
    const normalized = (value - minValue) / (maxValue - minValue);
    const index = Math.min(Math.floor(normalized * steps), steps - 1);
    return paletteConfig.colors[index];
  }

  const normalized = (value - minValue) / (maxValue - minValue);
  const color = d3Color.color(paletteConfig.scheme(normalized));
  return color.formatHex();
};

/**
 * Format number for display (matching existing formatter)
 * @param {number} value - Number to format
 * @returns {string} Formatted string
 */
export const formatValue = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('en-IN');
};

/**
 * Get legend stops for a given palette
 * @param {number} minValue - Minimum value
 * @param {number} maxValue - Maximum value
 * @param {string} palette - Palette key
 * @param {number} steps - Number of legend steps
 * @returns {Array} Array of {value, color, label}
 */
export const getLegendStops = (minValue, maxValue, palette = 'payment', steps = 5) => {
  const paletteConfig = HEATMAP_PALETTES[palette];
  const stops = [];

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const value = minValue + (maxValue - minValue) * t;
    const color = getColorForValue(value, minValue, maxValue, palette);
    const label = formatValue(value);
    
    stops.push({ value, color, label });
  }

  return stops;
};

/**
 * Get statistics from enriched GeoJSON
 * @param {Object} geojson - Enriched GeoJSON
 * @returns {Object} Statistics object
 */
export const getDataStatistics = (geojson) => {
  if (!geojson || !geojson.features) {
    return {
      total: 0,
      withData: 0,
      withoutData: 0,
      minValue: 0,
      maxValue: 0,
      avgValue: 0
    };
  }

  const values = geojson.features
    .map(f => f.properties?.value || 0)
    .filter(v => v > 0);

  return {
    total: geojson.features.length,
    withData: geojson.features.filter(f => f.properties?.hasData).length,
    withoutData: geojson.features.filter(f => !f.properties?.hasData).length,
    minValue: values.length > 0 ? Math.min(...values) : 0,
    maxValue: values.length > 0 ? Math.max(...values) : 100,
    avgValue: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  };
};

export default {
  HEATMAP_PALETTES,
  createColorScale,
  getMapboxColorExpression,
  getColorForValue,
  formatValue,
  getLegendStops,
  getDataStatistics
};
