import React from 'react';
import './TrendIndicator.css';

/**
 * TrendIndicator Component
 * Displays trend direction with icon, color, and text label
 * 
 * @param {Object} props
 * @param {string} props.trend - Trend direction: 'improving', 'stable', or 'declining'
 */
const TrendIndicator = ({ trend }) => {
  const config = (() => {
    switch (trend) {
      case 'improving':
        return {
          icon: '↑',
          label: 'Improving',
          className: 'trend-improving',
        };
      case 'declining':
        return {
          icon: '↓',
          label: 'Declining',
          className: 'trend-declining',
        };
      case 'stable':
      default:
        return {
          icon: '→',
          label: 'Stable',
          className: 'trend-stable',
        };
    }
  })();

  return (
    <div className={`trend-indicator ${config.className}`}>
      <span className="trend-icon" aria-hidden="true">
        {config.icon}
      </span>
      <span className="trend-label">{config.label}</span>
    </div>
  );
};

export default TrendIndicator;
