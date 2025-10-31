import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LocationDetector.css';

const LocationDetector = ({ onLocationDetected, onLocationError }) => {
  const [status, setStatus] = useState('idle'); // idle, requesting, detecting, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Request geolocation on mount
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      handleError('Geolocation is not supported by your browser');
      return;
    }

    setStatus('requesting');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 second timeout
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleGeolocationError,
      options
    );
  };

  const handleSuccess = async (position) => {
    setStatus('detecting');
    const { latitude, longitude } = position.coords;

    try {
      // Reverse geocoding using Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MGNREGA-Report-Card/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to determine location');
      }

      const data = await response.json();
      
      // Extract district name from address
      const district = data.address?.state_district || 
                      data.address?.county || 
                      data.address?.city ||
                      null;

      if (district) {
        setStatus('success');
        if (onLocationDetected) {
          onLocationDetected(district, { latitude, longitude });
        }
        // Auto-navigate to report card
        setTimeout(() => {
          navigate(`/district/${encodeURIComponent(district)}`);
        }, 1000);
      } else {
        handleError('Could not determine your district from location');
      }
    } catch (error) {
      handleError('Failed to determine district from coordinates');
    }
  };

  const handleGeolocationError = (error) => {
    let message = '';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location access denied. Please use the map or search to find your district.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable. Please use the map or search.';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out. Please use the map or search.';
        break;
      default:
        message = 'An error occurred while detecting location. Please use the map or search.';
    }
    
    handleError(message);
  };

  const handleError = (message) => {
    setStatus('error');
    setErrorMessage(message);
    if (onLocationError) {
      onLocationError(message);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage('');
    requestLocation();
  };

  if (status === 'idle' || status === 'requesting') {
    return (
      <div className="location-detector">
        <div className="location-icon">📍</div>
        <h3>Detecting Your Location</h3>
        <p>Please allow location access to automatically find your district</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (status === 'detecting') {
    return (
      <div className="location-detector">
        <div className="location-icon">🔍</div>
        <h3>Finding Your District</h3>
        <p>Determining your district from GPS coordinates...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="location-detector success">
        <div className="location-icon">✓</div>
        <h3>Location Detected!</h3>
        <p>Redirecting to your district report card...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="location-detector error">
        <div className="location-icon">⚠️</div>
        <h3>Location Detection Failed</h3>
        <p className="error-message">{errorMessage}</p>
        <button className="retry-button" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return null;
};

export default LocationDetector;
