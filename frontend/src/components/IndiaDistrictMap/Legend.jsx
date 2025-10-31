import React from 'react';
import './Legend.css';

const Legend = ({ selectedMetric, metricConfig }) => {
  if (!metricConfig) return null;

  // Create color blocks from colorStops
  const colorBlocks = [];
  const stops = metricConfig.colorStops;
  
  // Process stops in pairs: [value, color, value, color, ...]
  for (let i = 0; i < stops.length - 2; i += 2) {
    colorBlocks.push({
      label: `${stops[i]}${metricConfig.unit}`,
      color: stops[i + 1]
    });
  }
  
  // Add the last block
  colorBlocks.push({
    label: `${stops[stops.length - 2]}${metricConfig.unit}`,
    color: stops[stops.length - 1]
  });

  return (
    <div className="map-legend">
      <h4 className="legend-title">{metricConfig.title}</h4>
      <div className="legend-gradient">
        {colorBlocks.map((block, index) => (
          <div key={index} className="legend-block">
            <div 
              className="legend-color" 
              style={{ backgroundColor: block.color }}
            />
            <span className="legend-value">{block.label}</span>
          </div>
        ))}
      </div>
      <div className="legend-info">
        <div className="legend-info-item">
          <div className="legend-dot" style={{ backgroundColor: '#bdbdbd' }} />
          <span className="legend-text">No data</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;
