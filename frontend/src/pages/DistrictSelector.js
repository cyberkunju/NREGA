import React from 'react';
import MapView from '../components/IndiaDistrictMap/MapView';
import './DistrictSelector.css';

const DistrictSelector = () => {

  return (
    <div className="fullscreen-map">
      {/* Fullscreen Map with New MapView Component */}
      <MapView />
    </div>
  );
};

export default DistrictSelector;
