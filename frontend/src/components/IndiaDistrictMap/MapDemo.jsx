import React, { useState, useEffect } from 'react';
import IndiaDistrictMap from './IndiaDistrictMap';

/**
 * Demo page for testing IndiaDistrictMap component
 * Use this to verify the map works before integrating with your app
 */
const MapDemo = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Sample performance data for testing
  const samplePerformanceData = {
    'pune|maharashtra': {
      currentMonth: {
        paymentPercentage: 95.5,
        totalHouseholds: 17219,
        averageDays: 42.3
      }
    },
    'bangalore urban|karnataka': {
      currentMonth: {
        paymentPercentage: 88.2,
        totalHouseholds: 15432,
        averageDays: 38.7
      }
    },
    'mumbai|maharashtra': {
      currentMonth: {
        paymentPercentage: 92.1,
        totalHouseholds: 21543,
        averageDays: 45.2
      }
    },
    'chennai|tamil nadu': {
      currentMonth: {
        paymentPercentage: 78.4,
        totalHouseholds: 14325,
        averageDays: 35.6
      }
    },
    'kolkata|west bengal': {
      currentMonth: {
        paymentPercentage: 85.7,
        totalHouseholds: 18765,
        averageDays: 40.1
      }
    },
    'delhi|delhi': {
      currentMonth: {
        paymentPercentage: 91.3,
        totalHouseholds: 16890,
        averageDays: 43.8
      }
    },
    'jaipur|rajasthan': {
      currentMonth: {
        paymentPercentage: 82.6,
        totalHouseholds: 13245,
        averageDays: 37.4
      }
    },
    'hyderabad|telangana': {
      currentMonth: {
        paymentPercentage: 89.5,
        totalHouseholds: 19876,
        averageDays: 41.9
      }
    },
    'ahmedabad|gujarat': {
      currentMonth: {
        paymentPercentage: 87.2,
        totalHouseholds: 14567,
        averageDays: 39.3
      }
    },
    'lucknow|uttar pradesh': {
      currentMonth: {
        paymentPercentage: 76.8,
        totalHouseholds: 12345,
        averageDays: 34.2
      }
    }
  };

  const handleDistrictClick = (district) => {
    console.log('District clicked:', district);
    setSelectedDistrict(district);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <IndiaDistrictMap
        districtPerformance={samplePerformanceData}
        onDistrictClick={handleDistrictClick}
        loading={loading}
        palette="custom"
      />

      {/* Selected District Info Panel */}
      {selectedDistrict && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.96)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          minWidth: '280px',
          zIndex: 1000
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#2c3e50' }}>
            Selected District
          </h3>
          <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '12px', paddingBottom: '8px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
              {selectedDistrict.name}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>
              {selectedDistrict.state}
            </p>
          </div>
          
          {selectedDistrict.data && selectedDistrict.data.currentMonth ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#7f8c8d' }}>Payment %:</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#26a69a' }}>
                  {selectedDistrict.data.currentMonth.paymentPercentage?.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#7f8c8d' }}>Households:</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  {selectedDistrict.data.currentMonth.totalHouseholds?.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#7f8c8d' }}>Avg Days:</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  {selectedDistrict.data.currentMonth.averageDays?.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#95a5a6', fontStyle: 'italic' }}>
              No data available
            </p>
          )}

          <button
            onClick={() => setSelectedDistrict(null)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#26a69a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Instructions Panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '16px',
        borderRadius: '10px',
        maxWidth: '280px',
        fontSize: '12px',
        zIndex: 999
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          🗺️ Map Demo
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Hover over districts to see tooltips</li>
          <li>Click districts to see details</li>
          <li>Use controls to zoom/pan</li>
          <li>Colored districts have data</li>
          <li>Gray districts = no data</li>
        </ul>
        <p style={{ margin: '12px 0 0 0', fontSize: '11px', opacity: 0.7 }}>
          This demo uses sample data for 10 major cities
        </p>
      </div>
    </div>
  );
};

export default MapDemo;
