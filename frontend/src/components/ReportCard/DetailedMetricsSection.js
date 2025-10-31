import React, { useState, useCallback, useMemo } from 'react';
import MetricGroup from './MetricGroup';
import { processDetailedMetrics, hasDetailedMetrics } from '../../utils/formatters';
import './DetailedMetricsSection.css';

/**
 * DetailedMetricsSection Component
 * Expandable section that shows comprehensive performance metrics
 * organized into logical groups with optimized smooth animation
 * Optimized with React.memo and useMemo for performance
 * 
 * @param {Object} props
 * @param {Object} props.performanceData - Performance data object
 * @param {boolean} props.isExpanded - Whether the section is expanded (optional, for controlled mode)
 * @param {function} props.onToggle - Toggle callback (optional, for controlled mode)
 */
const DetailedMetricsSection = React.memo(({ 
  performanceData, 
  isExpanded: controlledExpanded, 
  onToggle 
}) => {
  // Use internal state if not controlled
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledExpanded !== undefined && onToggle !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  
  // Memoize toggle handler to prevent unnecessary re-renders
  const handleToggle = useCallback(() => {
    if (isControlled) {
      onToggle();
    } else {
      setInternalExpanded(prev => !prev);
    }
  }, [isControlled, onToggle]);

  // Memoize processed metrics data to avoid recalculation on every render
  const detailedMetrics = useMemo(() => processDetailedMetrics(performanceData), [performanceData]);
  const hasData = useMemo(() => hasDetailedMetrics(performanceData), [performanceData]);

  return (
    <div className="detailed-metrics-section" role="region" aria-labelledby="detailed-metrics-heading">
      <h2 id="detailed-metrics-heading" className="sr-only">
        Detailed Performance Metrics
      </h2>
      
      <button 
        className="detailed-metrics-toggle"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls="detailed-metrics-content"
        aria-describedby="toggle-description"
        type="button"
      >
        <span className="toggle-text">
          {isExpanded ? 'Show Less' : 'Show More Details'}
        </span>
        <span className="toggle-arrow" aria-hidden="true">
          {isExpanded ? '↑' : '↓'}
        </span>
      </button>
      
      <div id="toggle-description" className="sr-only">
        {isExpanded 
          ? 'Collapse detailed metrics section' 
          : 'Expand to view comprehensive performance metrics organized by category'
        }
      </div>
      
      <div 
        id="detailed-metrics-content"
        className={`detailed-metrics-content ${isExpanded ? 'expanded' : 'collapsed'}`}
        aria-hidden={!isExpanded}
        role="tabpanel"
        aria-labelledby="detailed-metrics-heading"
      >
        <div className="detailed-metrics-grid">
          {hasData ? (
            <>
              <MetricGroup
                title="Work & Wages"
                metrics={detailedMetrics.workAndWages.map(metric => ({
                  label: metric.label,
                  value: metric.value
                }))}
                groupId="work-wages"
              />
              
              <MetricGroup
                title="Project Status"
                metrics={detailedMetrics.projectStatus.map(metric => ({
                  label: metric.label,
                  value: metric.value
                }))}
                groupId="project-status"
              />
              
              <MetricGroup
                title="Inclusion & Focus"
                metrics={detailedMetrics.inclusionFocus.map(metric => ({
                  label: metric.label,
                  value: metric.value
                }))}
                groupId="inclusion-focus"
              />
            </>
          ) : (
            <div className="placeholder-content" role="status" aria-live="polite">
              <p>Detailed metrics are not available for this district</p>
              <p className="placeholder-subtitle">
                This may be due to incomplete data collection or reporting delays
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DetailedMetricsSection.displayName = 'DetailedMetricsSection';

export default DetailedMetricsSection;