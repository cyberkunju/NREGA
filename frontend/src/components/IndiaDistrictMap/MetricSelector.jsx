import React from 'react';
import './MetricSelector.css';

const MetricSelector = ({ selectedMetric, onChange, metrics }) => {
  const metricKeys = Object.keys(metrics);

  return (
    <div className="metric-selector">
      <div className="metric-selector-title">Select Metric</div>
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
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-label">{metric.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MetricSelector;
