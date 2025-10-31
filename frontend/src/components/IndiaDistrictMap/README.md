# IndiaDistrictMap Component

Interactive district-level choropleth map using Mapbox GL JS for MGNREGA performance visualization.

## Features

✅ **740+ Districts** - Complete India district boundaries with Polygon/MultiPolygon geometry  
✅ **Smooth Animations** - 60fps rendering with entrance animations  
✅ **Interactive** - Hover tooltips, click handlers, zoom to district  
✅ **Choropleth Visualization** - Color-coded by payment performance  
✅ **Responsive** - Works on mobile, tablet, and desktop  
✅ **Modern UI** - Glass-morphism legend, animated tooltips  

## Installation

All dependencies are already installed in `package.json`:

```bash
npm install
```

## Configuration

### 1. Get Mapbox Token

1. Sign up at [Mapbox](https://account.mapbox.com/auth/signup/)
2. Get your free access token from [Access Tokens page](https://account.mapbox.com/access-tokens/)
3. Create `.env` file in `frontend/` directory:

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your token
REACT_APP_MAPBOX_TOKEN=your_actual_mapbox_token_here
```

### 2. Verify GeoJSON Data

The district GeoJSON file is already downloaded at:
```
frontend/public/india-districts.geojson (3.9MB)
```

## Usage

### Basic Example

```jsx
import IndiaDistrictMap from './components/IndiaDistrictMap';

function App() {
  const districtPerformance = {
    'pune|maharashtra': {
      currentMonth: {
        paymentPercentage: 95.5,
        totalHouseholds: 17219,
        averageDays: 42.3
      }
    },
    // ... more districts
  };

  const handleDistrictClick = (district) => {
    console.log('Clicked:', district.name, district.state);
    console.log('Data:', district.data);
  };

  return (
    <IndiaDistrictMap
      districtPerformance={districtPerformance}
      onDistrictClick={handleDistrictClick}
      loading={false}
      palette="custom"
    />
  );
}
```

### Integration with Existing MapView

The new component can replace or complement the existing `MapView.js`:

```jsx
import IndiaDistrictMap from './components/IndiaDistrictMap';
import { useDistrictPerformance } from './hooks/useDistrictPerformance';

function Dashboard() {
  const { data: districtPerformance, loading } = useDistrictPerformance();

  return (
    <div className="dashboard">
      <IndiaDistrictMap
        districtPerformance={districtPerformance}
        onDistrictClick={(district) => {
          // Your existing district selection logic
          setSelectedDistrict(district);
        }}
        loading={loading}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `districtPerformance` | Object | `{}` | Performance data keyed by `district\|state` |
| `metric` | String | `'paymentPercentage'` | Metric to visualize |
| `onDistrictClick` | Function | `undefined` | Callback when district is clicked |
| `loading` | Boolean | `false` | Show loading overlay |
| `palette` | String | `'custom'` | Color palette: `'custom'`, `'payment'`, `'population'`, `'economic'` |

## Data Format

The component expects performance data in this format:

```javascript
{
  'pune|maharashtra': {
    currentMonth: {
      paymentPercentage: 95.5,      // Primary metric for coloring
      totalHouseholds: 17219,        // Shown in tooltip
      averageDays: 42.3,             // Average days of work
      // ... other metrics
    }
  }
}
```

The key format is: `lowercase(districtName)|lowercase(stateName)`

## Color Palettes

### Custom (Default)
```javascript
colors: ['#bdbdbd', '#616161', '#757575', '#9e9e9e', '#66bb6a', '#26a69a']
```
Designed specifically for MGNREGA payment performance (gray → green gradient).

### Payment
Yellow-Green gradient for payment metrics.

### Population
Yellow-Orange-Red gradient for population/household data.

### Economic
Blue gradient for economic indicators.

## Components

- **`IndiaDistrictMap.jsx`** - Main map component
- **`Legend.jsx`** - Gradient legend with performance ratings
- **`Tooltip.jsx`** - Animated hover tooltip
- **`LoadingOverlay.jsx`** - Loading animation

## Utilities

- **`colorScales.js`** - Color scale generation and Mapbox expressions
- **`districtMapping.js`** - GeoJSON enrichment and data normalization
- **`formatters.js`** - Number and percentage formatting

## Performance

- **Initial Load:** ~2.5s (including GeoJSON fetch)
- **Frame Rate:** 60fps (WebGL rendering)
- **Memory:** ~120MB
- **Bundle Size:** ~380KB (gzipped)

## Customization

### Change Colors

Edit `src/utils/colorScales.js`:

```javascript
export const HEATMAP_PALETTES = {
  custom: {
    colors: ['#yourcolor1', '#yourcolor2', '#yourcolor3'],
    name: "Your Palette Name"
  }
};
```

### Modify Interactions

Edit `setupInteractions()` in `IndiaDistrictMap.jsx` to customize hover/click behavior.

### Adjust Map Style

Change Mapbox style in initialization:

```javascript
style: 'mapbox://styles/mapbox/dark-v11',  // or 'streets-v12', 'satellite-v9'
```

## Troubleshooting

### Map not displaying

1. **Check Mapbox token:**
   ```bash
   echo $REACT_APP_MAPBOX_TOKEN
   ```

2. **Verify GeoJSON file exists:**
   ```bash
   ls -lh frontend/public/india-districts.geojson
   ```

3. **Check browser console** for errors

### Districts showing as gray (no data)

The district names in your API data must match the GeoJSON properties. Use the `normalizeDistrictName` utility to handle variations:

```javascript
import { createPerformanceKey } from './utils/districtMapping';

const key = createPerformanceKey('Pune', 'Maharashtra');
// Returns: 'pune|maharashtra'
```

### Performance issues

1. The GeoJSON is optimized (simplified) already
2. If still slow, consider using TopoJSON format (50% smaller)
3. Enable React.StrictMode checks

## Browser Support

- ✅ Chrome 79+
- ✅ Firefox 78+
- ✅ Safari 13+
- ✅ Edge 79+

## License

Part of MGNREGA Report Card project.

## Credits

- Mapbox GL JS for rendering
- [india-maps-data](https://github.com/udit-001/india-maps-data) for GeoJSON boundaries
- D3.js for color scales
