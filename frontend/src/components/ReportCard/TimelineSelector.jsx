import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './TimelineSelector.css';

/**
 * TimelineSelector Component - Simplified Version
 * Direct access to time period selection without dropdown
 */
const TimelineSelector = ({ 
  currentPeriod, 
  onPeriodChange,
  availablePeriods = []
}) => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);

  // Update selected period when current period changes
  useEffect(() => {
    setSelectedPeriod(currentPeriod);
  }, [currentPeriod]);

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    onPeriodChange(period);
  };

  // Show last 12 months for easy access
  const recentPeriods = availablePeriods.slice(0, 12);

  return (
    <div className="timeline-selector-simple">
      <div className="timeline-label">
        <svg className="timeline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
        </svg>
        <span className="timeline-text">{t('reportCard.selectPeriod')}:</span>
      </div>
      
      <div className="timeline-periods-grid">
        {recentPeriods.map((period, index) => {
          const isSelected = 
            period.month === selectedPeriod?.month && 
            period.year === selectedPeriod?.year;
          const isLatest = index === 0;

          return (
            <button
              key={`${period.month}-${period.year}`}
              className={`timeline-period-btn ${isSelected ? 'selected' : ''} ${isLatest ? 'latest' : ''}`}
              onClick={() => handlePeriodSelect(period)}
              aria-label={`${t('reportCard.viewDataFor')} ${period.month} ${period.year}`}
              aria-pressed={isSelected}
            >
              <span className="period-month">{period.month}</span>
              <span className="period-year">{period.year}</span>
              {isLatest && <span className="latest-badge">{t('reportCard.latest')}</span>}
            </button>
          );
        })}
      </div>
      
      {availablePeriods.length > 12 && (
        <p className="timeline-more-info">
          {t('reportCard.showingLast12Months')} • {availablePeriods.length} {t('reportCard.totalPeriodsAvailable')}
        </p>
      )}
    </div>
  );
};

export default TimelineSelector;
