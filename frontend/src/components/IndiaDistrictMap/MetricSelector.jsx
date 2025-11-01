import React from 'react';
import './MetricSelector.css';

// Modern minimalistic SVG icons - v2
const MetricIcons = {
  paymentPercentage: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  averageDays: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  womenParticipation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
};

const MetricSelector = ({ selectedMetric, onChange, metrics }) => {
  const metricKeys = Object.keys(metrics);

  return (
    <div className="metric-selector">
      <div className="metric-selector-title">SELECT METRIC</div>
      <div className="metric-buttons">
        {metricKeys.map((key) => {
          const metric = metrics[key];
          return (
            <button
              key={key}
              className={`metric-button ${selectedMetric === key ? 'active' : ''}`}
              onClick={() => onChange(key)}
              title={metric.title}
            >
              <span className="metric-icon">{MetricIcons[key]}</span>
              <span className="metric-label">{metric.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MetricSelector;
