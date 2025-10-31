import React from 'react';
import './MetricGroup.css';

/**
 * MetricGroup Component
 * Displays a group of related metrics with a title and organized layout
 * Optimized with React.memo to prevent unnecessary re-renders
 * 
 * @param {Object} props
 * @param {string} props.title - Group title
 * @param {Array} props.metrics - Array of metric objects
 * @param {string} props.metrics[].label - Metric label
 * @param {string|number} props.metrics[].value - Metric value
 * @param {string} props.metrics[].unit - Unit of measurement (optional)
 * @param {string} props.groupId - Unique identifier for the group (optional)
 */
const MetricGroup = React.memo(({ title, metrics, groupId }) => {
  const titleId = groupId ? `${groupId}-title` : `metric-group-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div 
      className="metric-group" 
      role="group" 
      aria-labelledby={titleId}
    >
      <h3 
        id={titleId}
        className="metric-group-title"
      >
        {title}
      </h3>
      <div 
        className="metric-group-items"
        role="list"
        aria-label={`${title} metrics`}
      >
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="metric-item"
            role="listitem"
            aria-label={`${metric.label}: ${metric.value}${metric.unit || ''}`}
          >
            <div className="metric-label" aria-hidden="true">
              {metric.label}
            </div>
            <div 
              className="metric-value-display" 
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="sr-only">{metric.label}: </span>
              {metric.value}
              {metric.unit && (
                <span 
                  className="metric-unit-small"
                  aria-label={`Unit: ${metric.unit}`}
                >
                  {metric.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

MetricGroup.displayName = 'MetricGroup';

export default MetricGroup;