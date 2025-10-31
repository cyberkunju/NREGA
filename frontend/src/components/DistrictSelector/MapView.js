import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

import { getDistricts, getPerformance } from '../../services/api';
import { formatNumber, formatPercentage, getColorForPercentage } from '../../utils/formatters';

const INDIA_BOUNDS = [
  [6.4627, 68.1097], // Southwest
  [37.6, 97.4], // Northeast
];

const normalize = (value) => (value || '').toString().trim().toLowerCase();
const performanceKey = (name, state) => `${normalize(name)}|${normalize(state)}`;

const MapViewController = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView(center, zoom);
    }
  }, [bounds, center, map, zoom]);

  return null;
};

const MapView = ({ onDistrictSelect }) => {
  const [mapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom] = useState(5);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [districtList, setDistrictList] = useState([]);
  const [districtPerformance, setDistrictPerformance] = useState({});
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [performanceProgress, setPerformanceProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadPerformanceData = async (districts) => {
    if (!districts.length) {
      setDistrictPerformance({});
      return;
    }

    setLoadingPerformance(true);
    setPerformanceProgress({ loaded: 0, total: districts.length });

    const results = {};
    const concurrency = 6;
    let index = 0;
    let completed = 0;

    const worker = async () => {
      while (true) {
        if (index >= districts.length) {
          break;
        }

        const currentIndex = index;
        index += 1;

        if (currentIndex >= districts.length) {
          break;
        }

        const districtName = districts[currentIndex];

        try {
          const data = await getPerformance(districtName);

          if (data && data.district) {
            const key = performanceKey(data.district, data.state);
            results[key] = data;
          }
        } catch (fetchError) {
          console.warn(`Unable to load performance for ${districtName}`, fetchError);
        } finally {
          completed += 1;
          if (completed % 5 === 0 || completed === districts.length) {
            setPerformanceProgress({ loaded: completed, total: districts.length });
          }
        }
      }
    };

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    setDistrictPerformance(results);
    setPerformanceProgress({ loaded: districts.length, total: districts.length });
    setLoadingPerformance(false);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingMap(true);
        setError(null);

        const [geoResponse, districtsResponse] = await Promise.all([
          fetch('/districts.geojson'),
          getDistricts(),
        ]);

        if (!geoResponse.ok) {
          throw new Error('Failed to load district map data.');
        }

        const geoJson = await geoResponse.json();
        setGeoJsonData(geoJson);

        const districts = Array.isArray(districtsResponse?.districts)
          ? districtsResponse.districts
          : Array.isArray(districtsResponse)
            ? districtsResponse
            : [];

        setDistrictList(districts);

        await loadPerformanceData(districts);
      } catch (err) {
        console.error('Error loading map view:', err);
        setError(err.message || 'Unable to load map data at the moment.');
      } finally {
        setLoadingMap(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDistrictClick = (districtName) => {
    if (onDistrictSelect) {
      onDistrictSelect(districtName);
    }

    navigate(`/district/${encodeURIComponent(districtName)}`);
  };

  const buildPopupContent = (feature) => {
    const name = feature?.properties?.name;
    const state = feature?.properties?.state;
    const key = performanceKey(name, state);
    const performance = districtPerformance[key];

    if (!performance || !performance.currentMonth) {
      return `<div class="popup-content"><strong>${name}</strong><br/><span>No recent performance data available.</span></div>`;
    }

    const { currentMonth } = performance;

    return `
      <div class="popup-content">
        <strong>${name}${state ? `, ${state}` : ''}</strong>
        <div class="popup-metric">Payments on time: <span>${formatPercentage(currentMonth.paymentPercentage)}</span></div>
        <div class="popup-metric">Households served: <span>${formatNumber(currentMonth.totalHouseholds)}</span></div>
        <div class="popup-metric">Average days of work: <span>${currentMonth.averageDays ? currentMonth.averageDays.toFixed(1) : '0'}</span></div>
      </div>
    `;
  };

  const getMarkerStyle = (feature) => {
    const name = feature?.properties?.name;
    const state = feature?.properties?.state;
    const key = performanceKey(name, state);
    const performance = districtPerformance[key];

    const percentage = performance?.currentMonth?.paymentPercentage;
    const households = performance?.currentMonth?.totalHouseholds;

    const fillColor = percentage ? getColorForPercentage(percentage) : '#BDBDBD';
    const radius = households ? Math.max(6, Math.min(18, households / 3000)) : 6;

    return {
      radius,
      fillColor,
      color: '#424242',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = feature?.properties?.name;
    if (!name) {
      return;
    }

    layer.bindPopup(buildPopupContent(feature));

    layer.on('click', () => {
      handleDistrictClick(name);
    });
  };

  const pointToLayer = (feature, latlng) => {
    const baseStyle = getMarkerStyle(feature);
    const marker = L.circleMarker(latlng, baseStyle);

    marker.on('mouseover', function handleMouseOver() {
      this.setStyle({
        weight: 2,
        radius: baseStyle.radius + 2,
      });
    });

    marker.on('mouseout', function handleMouseOut() {
      this.setStyle(baseStyle);
    });

    return marker;
  };

  const performanceVersion = useMemo(
    () => Object.keys(districtPerformance).length,
    [districtPerformance]
  );

  if (loadingMap) {
    return (
      <div className="map-view loading">
        <div className="map-loading-card">
          <div className="map-spinner" aria-hidden="true" />
          <p>Loading live district map…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-view error">
        <div className="map-error-card" role="alert">
          <p className="error-message">{error}</p>
          <button type="button" className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view" data-testid="district-map">
      <header className="map-header">
        <h2>District Performance Map</h2>
        <p>Minimalist heatmap powered by real-time government data.</p>
      </header>

      <div className="map-layout">
        <aside className="map-sidebar" aria-label="Map guidance">
          <div className="map-instructions">
            <ul>
              <li>Use the search bar above or click on the map to open a district report card.</li>
              <li>Marker colour indicates payment performance. Size reflects households that worked.</li>
              <li>
                Showing
                {' '}
                <strong>{geoJsonData?.features?.length ?? 0}</strong>
                {' '}
                districts with live MGNREGA data.
              </li>
            </ul>

            {loadingPerformance ? (
              <div className="map-status" role="status" aria-live="polite">
                <span className="map-spinner small" aria-hidden="true" />
                <span>
                  Loading performance data… {performanceProgress.loaded}/{performanceProgress.total}
                </span>
              </div>
            ) : (
              <div className="map-status" role="status" aria-live="polite">
                <span className="status-dot" aria-hidden="true" />
                <span>Performance data synced.</span>
              </div>
            )}
          </div>

          <div className="map-legend" aria-label="Heatmap legend">
            <div className="legend-title">Payment performance (15-day wages)</div>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#26a69a' }} />
                <span>Excellent · 95%+</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#66bb6a' }} />
                <span>Good · 85-95%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#9e9e9e' }} />
                <span>Average · 75-85%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#757575' }} />
                <span>Below average · 60-75%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#616161' }} />
                <span>Poor · &lt;60%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#bdbdbd' }} />
                <span>No data yet</span>
              </div>
            </div>
            <p className="legend-note">Marker size indicates total households that worked.</p>
          </div>
        </aside>

        <div className="map-container" aria-label="India district performance map">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
            maxBounds={INDIA_BOUNDS}
            minZoom={4}
          >
            <MapViewController center={mapCenter} zoom={mapZoom} bounds={INDIA_BOUNDS} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {geoJsonData && (
              <GeoJSON
                key={performanceVersion}
                data={geoJsonData}
                onEachFeature={onEachFeature}
                pointToLayer={pointToLayer}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapView;
