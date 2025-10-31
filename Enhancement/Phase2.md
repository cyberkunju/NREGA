

## **Phase 2: Map Component Overhaul (MapLibre)**

**(Goal: Implement the core interactive heatmap visualization for all of India)**

### **Task 1: Prerequisites & MapLibre Setup**

  * **Install Dependencies:** If you haven't already, get the necessary libraries.
    ```bash
    npm install maplibre-gl react-map-gl mapbox-gl @mapbox/mapbox-gl-geocoder topojson-client
    # Or: npm install maplibre-gl mapbox-gl topojson-client (if using maplibre-gl directly without the react-map-gl wrapper)
    npm uninstall react-leaflet leaflet # Clean up old dependencies
    ```
  * **Map Style & Token:**
      * Choose a base map style. You can use MapTiler, Stadia Maps, or self-host tiles. If using a Mapbox style (like `mapbox://styles/mapbox/light-v11`), you'll still need a Mapbox access token.
      * Store your chosen style URL and any necessary token securely in your `.env` file (e.g., `REACT_APP_MAP_STYLE_URL`, `REACT_APP_MAP_TOKEN`).
  * **CSS:** Import the MapLibre CSS file in your main component or `index.js`.
    ```javascript
    import 'maplibre-gl/dist/maplibre-gl.css';
    // or 'mapbox-gl/dist/mapbox-gl.css' if using mapbox-gl package
    ```

-----

### **Task 2: Data Fetching & Preparation (Frontend)**

  * **Location:** Inside your main map component (`MapView.jsx` or similar) using `useEffect`.
  * **Fetch Heatmap Data:**
      * Call your enhanced `/api/heatmap-data` endpoint. This should return the array containing the latest capped metrics (Payment Timeliness, Avg Days, Women %, etc.) for *all* districts, keyed by a unique district identifier (like census code or `state_name:district_name`).
      * Store this data in React state (e.g., `heatmapData`). Handle loading and error states.
  * **Load Geographic Data (TopoJSON/GeoJSON):**
      * Fetch or import your all-India districts TopoJSON/GeoJSON file (ensure it's optimized/simplified if possible). Store this raw geographic data in state (e.g., `topoData`).
  * **Convert TopoJSON (if applicable):**
      * Use `topojson-client` to convert the TopoJSON to GeoJSON format *after* it loads.
        ```javascript
        import * as topojson from 'topojson-client';
        // ... inside useEffect after topoData is loaded ...
        const districtsGeoJSON = topojson.feature(topoData, topoData.objects.districts); // Adjust 'districts' if object name differs
        // Store districtsGeoJSON in state
        ```
  * **Join MGNREGA Data with GeoJSON:**
      * Once both `heatmapData` (from API) and `districtsGeoJSON` are loaded, create the `enrichedGeoJSON`. Iterate through `districtsGeoJSON.features` and merge the corresponding metrics from `heatmapData` into each feature's `properties`. **This is critical.** Ensure you have a reliable key (e.g., district census code, or combine state+district name) present in *both* datasets to perform the join. Handle districts present in GeoJSON but missing in API data (assign default/null metric values). Store this final `enrichedGeoJSON` in state.

-----

### **Task 3: Initialize MapLibre Component**

  * **Refactor:** Replace your existing `react-leaflet` map structure.
  * **Basic Setup (Direct MapLibre):**
    ```javascript
    import React, { useRef, useEffect, useState } from 'react';
    import maplibregl from 'maplibre-gl'; // Or mapboxgl if using that package

    const MapView = () => {
      const mapContainer = useRef(null);
      const map = useRef(null);
      const [mapLoaded, setMapLoaded] = useState(false);
      const [enrichedGeoJSON, setEnrichedGeoJSON] = useState(null);
      // ... state for heatmapData, selectedMetric etc. ...

      // ... useEffect for fetching heatmapData and loading/processing GeoJSON ...
      // ... ensure enrichedGeoJSON is set in state when ready ...

      useEffect(() => {
        // Initialize map only once and only when the container is ready
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: process.env.REACT_APP_MAP_STYLE_URL, // Your chosen style
          center: [78.9629, 20.5937], // India center
          zoom: 4,
          minZoom: 3,
          maxZoom: 15
          // Add Mapbox token here if needed by the style
          // accessToken: process.env.REACT_APP_MAPBOX_TOKEN
        });

        map.current.on('load', () => {
          setMapLoaded(true); // Signal that base map layers are loaded
        });

        // Add map controls (optional)
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        return () => map.current.remove(); // Cleanup on unmount
      }, []); // Empty dependency array ensures this runs only once

      // ... useEffect for adding source and layers (depends on mapLoaded and enrichedGeoJSON) ...
      // ... useEffect for handling interactions ...

      return (
        <div className="map-wrapper"> {/* Add a wrapper for positioning controls */}
          {/* ... Loading Indicator ... */}
          <div ref={mapContainer} className="map-container" style={{ width: '100%', height: '100vh' }} />
          {/* ... Overlay Controls (Selector, Legend) ... */}
        </div>
      );
    };
    export default MapView;
    ```

-----

### **Task 4: Add Data Source and Layers**

  * **Location:** Create a new `useEffect` hook that depends on `mapLoaded` and `enrichedGeoJSON`. This ensures the map is ready and the data is prepared before adding layers.
  * **Add Source:** Inside this new effect, check if the source already exists (important for potential re-renders). If not, add the `enrichedGeoJSON`.
    ```javascript
    useEffect(() => {
        if (!mapLoaded || !enrichedGeoJSON || !map.current) return;
        if (map.current.getSource('districts')) return; // Avoid adding source multiple times

        map.current.addSource('districts', {
          type: 'geojson',
          data: enrichedGeoJSON,
          generateId: true // ESSENTIAL for feature-state interactions
        });

        // --- Add Layers Here (Heatmap, Borders, Labels) ---

    }, [mapLoaded, enrichedGeoJSON]);
    ```
  * **Add Heatmap Layer (`district-heatmap`):** Define the `fill` layer using the Gray -\> Emerald `interpolate` expression based on the *currently selected metric* (use state `selectedMetric`, defaulting to `paymentPercentage`). Remember to include the capping logic `['min', 100, ...]` and the `coalesce` for nulls.
  * **Add Borders Layer (`district-borders`):** Define the `line` layer with subtle styling.
  * **Add Labels Layer (`district-labels`):** Define the `symbol` layer. Set the `text-field` layout property. Crucially, set the layer's `minzoom` property (e.g., `minzoom: 6` or `minzoom: 7`) so labels only appear when zoomed in sufficiently.

-----

### **Task 5: Implement Metric Selector & Dynamic Styling**

  * **State:** Use `useState` for `selectedMetric`, default to `'paymentPercentage'`.
  * **UI Component:** Create the icon-button selector (e.g., `<MetricSelector selectedMetric={selectedMetric} onChange={setSelectedMetric} />`) and position it over the map.
  * **Update Map Style:** Create a function (e.g., `updateMapColors`) that takes the `newMetric` as an argument. Inside this function:
      * Use `map.current.setPaintProperty('district-heatmap', 'fill-color', [ ... new interpolate expression based on newMetric ... ]);` to update the colors dynamically without removing/re-adding the layer.
      * Call this function from the `onChange` handler of your selector component.
  * **Initial Styling:** Ensure the initial `addLayer` call for `district-heatmap` uses the default `selectedMetric`.

-----

### **Task 6: Implement Dynamic Legend**

  * **Component:** Create a `<Legend selectedMetric={selectedMetric} />` component.
  * **Positioning:** Overlay it on the map (e.g., bottom-left).
  * **Logic:** Inside the component, use the `selectedMetric` prop to:
      * Display the correct title (e.g., "Payment Timeliness").
      * Render the correct color blocks and value range labels corresponding to the Gray -\> Emerald ramp and the specific thresholds for that metric.

-----

### **Task 7: Implement Hover Effects & Tooltips**

  * **Event Listeners:** Set up `mousemove` and `mouseleave` listeners on the `'district-heatmap'` layer within a `useEffect` hook that runs *after* the layer is added.
  * **Feature State:** Use `map.current.setFeatureState` to toggle `{ hover: true/false }` based on the feature's `id`. Store the `hoveredDistrictId` in a `useRef` or local variable within the effect scope.
  * **Layer Styling Update:** Modify the `paint` properties of `district-heatmap` (e.g., `'fill-opacity'`) and `district-borders` (e.g., `'line-width'`) to use `['case', ['boolean', ['feature-state', 'hover'], false], hoveredValue, normalValue]` expressions.
  * **Tooltip:** Use MapLibre's `Popup` or a custom React component.
      * **Content:** Fetch `district_name`, `state_name`, and the value for the *currently selected metric* from the hovered feature's `properties`. Format the value (e.g., cap percentage, add `%`, format numbers).
      * **Positioning:** Update the popup's `LngLat` on `mousemove`. Show/hide it on `mousemove`/`mouseleave`.

-----

### **Task 8: Implement Click Navigation**

  * **Event Listener:** Set up a `click` listener on the `'district-heatmap'` layer.
  * **Get Data:** Extract the `district_name` from `e.features[0].properties`.
  * **Navigate:** Use `react-router`'s `useNavigate` hook: `Maps(\`/district/${encodeURIComponent(districtName)}\`)\`.

-----

### **Task 9: Final Cleanup & Testing**

  * **Remove Leaflet:** Double-check all Leaflet code, dependencies, and CSS are gone.
  * **Test Extensively:**
      * Map loading speed.
      * Heatmap colors update correctly when changing metrics.
      * Legend updates correctly.
      * Hover effects are smooth.
      * Tooltips show correct, capped data.
      * Clicking navigates correctly.
      * Labels appear/disappear at correct zoom levels.
      * Zoom limits work.
      * Check console for errors.

-----

This detailed breakdown covers the migration. Focus on getting the data joined and the basic heatmap layer rendering first, then incrementally add the selector, legend, and interactions. Remember to manage state effectively and leverage MapLibre's API for dynamic updates. 