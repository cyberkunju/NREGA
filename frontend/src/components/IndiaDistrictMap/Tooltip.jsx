import React from 'react';
import { useTranslation } from 'react-i18next';
import './Tooltip.css';

// Minimalistic SVG icons
const TooltipIcons = {
  payment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    </svg>
  )
};

const Tooltip = ({ show, x, y, data }) => {
  const { t } = useTranslation();
  
  if (!show || !data) return null;

  const style = {
    left: `${x + 20}px`,
    top: `${y - 60}px`,
    position: 'absolute',
    pointerEvents: 'none'
  };

  // Format helper
  const formatValue = (value, formatter) => {
    if (value === null || value === undefined) return t('legend.noData');
    return formatter ? formatter(value) : value;
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
        {/* Current selected metric - highlighted */}
        <div className="tooltip-metric current">
          <span className="tooltip-label">{data.currentMetricKey ? t(data.currentMetricKey) : ''}:</span>
          <span className={`tooltip-value ${data.hasData ? '' : 'no-data'}`}>
            {data.currentValue}
          </span>
        </div>

        {/* Divider */}
        <div className="tooltip-divider"></div>

        {/* All 3 primary metrics */}
        <div className="tooltip-metrics-grid">
          <div className="tooltip-metric-row">
            <span className="tooltip-metric-icon">{TooltipIcons.payment}</span>
            <span className="tooltip-metric-label">{t('tooltip.payment')}:</span>
            <span className="tooltip-metric-value">
              {formatValue(data.paymentPercentage, (v) => `${v.toFixed(1)}%`)}
            </span>
          </div>
          
          <div className="tooltip-metric-row">
            <span className="tooltip-metric-icon">{TooltipIcons.calendar}</span>
            <span className="tooltip-metric-label">{t('tooltip.avgDays')}:</span>
            <span className="tooltip-metric-value">
              {formatValue(data.averageDays, (v) => `${Math.round(v)}d`)}
            </span>
          </div>
          
          <div className="tooltip-metric-row">
            <span className="tooltip-metric-icon">{TooltipIcons.user}</span>
            <span className="tooltip-metric-label">{t('tooltip.women')}:</span>
            <span className="tooltip-metric-value">
              {formatValue(data.womenParticipationPercent, (v) => `${v.toFixed(1)}%`)}
            </span>
          </div>
        </div>
      </div>

      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default Tooltip;
