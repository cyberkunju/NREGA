import React from 'react';
import './MetricCard.css';

const MetricCard = ({
  title,
  value,
  unit = '',
  icon,
  indicator,
  accentColor,
  description,
}) => {
  const indicatorClass = indicator ? `metric-card--${indicator}` : '';
  const style = accentColor ? { '--metric-accent': accentColor } : undefined;

  return (
    <article className={`metric-card ${indicatorClass}`} style={style}>
      <header className="metric-card-header">
        {icon && (
          <span className="metric-icon" aria-hidden="true">
            {typeof icon === 'string' ? icon : icon}
          </span>
        )}
        <h3 className="metric-title">{title}</h3>
      </header>

      <div className="metric-value-container">
        <span className="metric-value">
          {value}
          {unit && <span className="metric-unit">{unit}</span>}
        </span>
      </div>

      {description && <p className="metric-description">{description}</p>}
    </article>
  );
};

export default MetricCard;
