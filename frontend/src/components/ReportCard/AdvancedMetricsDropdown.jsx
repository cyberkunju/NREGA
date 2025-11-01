import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricCard } from './index';
import { MetricIcons } from './MetricIcons';
import HistoricalAnalysis from './HistoricalAnalysis';
import { formatPercentage, formatNumber } from '../../utils/formatters';
import './AdvancedMetricsDropdown.css';

const AdvancedMetricsDropdown = ({ performanceData, districtName, availablePeriods }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!performanceData || !performanceData.currentMonth) {
    return null;
  }

  const { currentMonth } = performanceData;

  return (
    <section className="advanced-metrics-section" aria-labelledby="advanced-metrics-heading">
      <button
        className="advanced-metrics-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="advanced-metrics-content"
      >
        <span className="toggle-label">
          <svg 
            className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {t('reportCard.advancedMetrics')}
        </span>
        <span className="toggle-hint">
          {isExpanded ? t('common.hide') : t('common.show')} {t('reportCard.detailedAnalytics')}
        </span>
      </button>

      {isExpanded && (
        <div 
          id="advanced-metrics-content"
          className="advanced-metrics-content"
          role="region"
          aria-labelledby="advanced-metrics-heading"
        >
          <h3 id="advanced-metrics-heading" className="advanced-metrics-title">
            {t('reportCard.detailedPerformanceAnalytics')}
          </h3>
          
          <div className="metrics-grid">
            <MetricCard
              title="SC/ST participation"
              value={currentMonth.scstParticipation ? formatPercentage(currentMonth.scstParticipation) : 'N/A'}
              icon={MetricIcons.diversity}
              indicator={currentMonth.scstParticipation >= 30 ? 'positive' : 'neutral'}
              description="Percentage of work by SC/ST communities."
            />

            <MetricCard
              title="Agriculture works"
              value={currentMonth.agricultureWorks ? formatPercentage(currentMonth.agricultureWorks) : 'N/A'}
              icon={MetricIcons.agriculture}
              indicator="neutral"
              description="Share of agriculture-related projects."
            />

            <MetricCard
              title="NRM expenditure"
              value={currentMonth.nrmExpenditure ? formatPercentage(currentMonth.nrmExpenditure) : 'N/A'}
              icon={MetricIcons.environment}
              indicator={currentMonth.nrmExpenditure >= 50 ? 'positive' : 'neutral'}
              description="Natural Resource Management spending."
            />

            <MetricCard
              title="Category B works"
              value={currentMonth.categoryBWorks ? formatPercentage(currentMonth.categoryBWorks) : 'N/A'}
              icon={MetricIcons.infrastructure}
              indicator="neutral"
              description="Infrastructure development projects."
            />

            <MetricCard
              title="Total works completed"
              value={currentMonth.worksCompleted ? formatNumber(currentMonth.worksCompleted) : 'N/A'}
              icon={MetricIcons.checkmark}
              indicator="neutral"
              description="Number of projects finished."
            />

            <MetricCard
              title="Ongoing works"
              value={currentMonth.worksOngoing ? formatNumber(currentMonth.worksOngoing) : 'N/A'}
              icon={MetricIcons.clock}
              indicator="neutral"
              description="Projects currently in progress."
            />
          </div>

          {/* Historical Analysis Section */}
          <HistoricalAnalysis 
            districtName={districtName}
            availablePeriods={availablePeriods}
          />
        </div>
      )}
    </section>
  );
};

export default AdvancedMetricsDropdown;
