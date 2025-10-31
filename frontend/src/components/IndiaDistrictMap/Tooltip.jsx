import React from 'react';
import './Tooltip.css';

const Tooltip = ({ show, x, y, data }) => {
  if (!show || !data) return null;

  const style = {
    left: `${x + 20}px`,
    top: `${y - 60}px`,
    position: 'absolute',
    pointerEvents: 'none'
  };

  return (
    <div className="map-tooltip" style={style}>
      <div className="tooltip-header">
        <h3 className="tooltip-title">{data.districtName}</h3>
        {data.stateName && (
          <p className="tooltip-subtitle">{data.stateName}</p>
        )}
      </div>

      <div className="tooltip-content">
        <div className="tooltip-metric">
          <span className="tooltip-label">{data.metric}:</span>
          <span className={`tooltip-value ${data.hasData ? '' : 'no-data'}`}>
            {data.value}
          </span>
        </div>
      </div>

      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default Tooltip;
