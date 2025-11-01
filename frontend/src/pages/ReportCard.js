import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPerformance, getAvailablePeriods } from '../services/api';
import ReportCardHeader from '../components/ReportCard/ReportCardHeader';
import NaturalLanguageSummary from '../components/ReportCard/NaturalLanguageSummary';
import TimelineSelector from '../components/ReportCard/TimelineSelector';
import { MetricCard, TrendIndicator } from '../components/ReportCard';
import { MetricIcons } from '../components/ReportCard/MetricIcons';
import AdvancedMetricsDropdown from '../components/ReportCard/AdvancedMetricsDropdown';
import {
  formatNumber,
  formatDate,
  formatPercentage,
  getColorForPercentage,
  isDataOutdated,
  classifyPaymentPerformance,
} from '../utils/formatters';
import './ReportCard.css';

const ReportCard = () => {
  const { t } = useTranslation();
  const { districtName } = useParams();
  const navigate = useNavigate();
  
  const [performanceData, setPerformanceData] = useState(null);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available periods when district changes
  useEffect(() => {
    const fetchPeriods = async () => {
      if (districtName) {
        const periods = await getAvailablePeriods(districtName);
        setAvailablePeriods(periods);
        if (periods.length > 0) {
          setSelectedPeriod(periods[0]); // Set to latest by default
        }
      }
    };
    fetchPeriods();
  }, [districtName]);

  // Fetch performance data when district or selected period changes
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPerformance(
          districtName,
          selectedPeriod?.year,
          selectedPeriod?.month
        );
        setPerformanceData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (districtName && selectedPeriod) {
      fetchPerformanceData();
    }
  }, [districtName, selectedPeriod]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleBackToSelector = () => {
    navigate('/');
  };

  // Calculate derived values with useMemo hooks BEFORE any conditional returns
  const { currentMonth, trend, lastUpdated, state } = performanceData || {};
  const isOutdated = lastUpdated ? isDataOutdated(lastUpdated) : false;
  const paymentColor = currentMonth ? getColorForPercentage(currentMonth.paymentPercentage) : '#ccc';
  const paymentClassification = currentMonth ? classifyPaymentPerformance(currentMonth.paymentPercentage) : 'average';

  const trendConfig = useMemo(() => {
    switch (trend) {
      case 'improving':
        return {
          label: t('reportCard.improving'),
          indicator: 'positive',
          icon: '↑',
          description: t('reportCard.improvingDesc'),
        };
      case 'declining':
        return {
          label: t('reportCard.declining'),
          indicator: 'negative',
          icon: '↓',
          description: t('reportCard.decliningDesc'),
        };
      case 'stable':
      default:
        return {
          label: t('reportCard.stable'),
          indicator: 'neutral',
          icon: '→',
          description: t('reportCard.stableDesc'),
        };
    }
  }, [trend, t]);

  const paymentIndicator = useMemo(() => {
    switch (paymentClassification) {
      case 'excellent':
      case 'good':
        return 'positive';
      case 'average':
        return 'neutral';
      case 'below_average':
        return 'warning';
      case 'poor':
        return 'negative';
      default:
        return 'neutral';
    }
  }, [paymentClassification]);

  // Loading state
  if (loading) {
    return (
      <div className="report-card-page">
        <div className="loading-state" role="status" aria-live="polite">
          <div className="loading-spinner" />
          <p>{t('reportCard.loadingData')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="report-card-page">
        <div className="error-state" role="alert">
          <div className="error-icon" aria-hidden="true">⚠</div>
          <h2>{t('reportCard.errorTitle')}</h2>
          <p>{error.message || t('reportCard.errorMessage')}</p>
          <div className="error-actions">
            <button type="button" className="secondary-button" onClick={handleBackToSelector}>
              {t('reportCard.backToSelector')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!performanceData || !performanceData.currentMonth) {
    return (
      <div className="report-card-page">
        <div className="error-state" role="status">
          <div className="error-icon" aria-hidden="true">📊</div>
          <h2>We don’t have data for {districtName} yet</h2>
          <p>Please try another district or check back again soon.</p>
          <button type="button" className="secondary-button" onClick={handleBackToSelector}>
            Back to selector
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-card-page">
      <div className="report-card-container">
        <ReportCardHeader
          districtName={performanceData.district}
          stateName={state}
          month={currentMonth.month}
          year={currentMonth.year}
          lastUpdated={lastUpdated}
          onBackClick={handleBackToSelector}
        />

        {isOutdated && (
          <aside className="data-banner" role="note">
            <span className="data-banner__icon" aria-hidden="true">⚠</span>
            <span>
              {t('reportCard.outdatedWarning', { date: formatDate(lastUpdated) })}
            </span>
          </aside>
        )}

        <NaturalLanguageSummary performanceData={performanceData} />

        <TimelineSelector
          currentPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          availablePeriods={availablePeriods}
        />

        <section className="primary-metrics" aria-labelledby="primary-metrics-heading">
          <h2 id="primary-metrics-heading" className="sr-only">{t('reportCard.primaryMetrics')}</h2>
          <div className="metrics-grid">
            <MetricCard
              title={t('metrics.paymentsOnTime')}
              value={formatPercentage(currentMonth.paymentPercentage)}
              icon={MetricIcons.rupee}
              indicator={paymentIndicator}
              accentColor={paymentColor}
              description={t('metrics.paymentsOnTimeDesc')}
            />

            <MetricCard
              title={t('metrics.familiesGotWork')}
              value={formatNumber(currentMonth.totalHouseholds)}
              icon={MetricIcons.users}
              indicator="neutral"
              description={t('metrics.familiesGotWorkDesc')}
            />

            <MetricCard
              title={t('metrics.avgDaysWork')}
              value={currentMonth.averageDays?.toFixed(1) ?? '0.0'}
              unit={` ${t('common.days')}`}
              icon={MetricIcons.calendar}
              indicator="neutral"
              description={t('metrics.avgDaysWorkDesc')}
            />

            <MetricCard
              title={t('metrics.performanceTrend')}
              value={trendConfig.label}
              icon={trend === 'improving' ? MetricIcons.trendUp : trend === 'declining' ? MetricIcons.trendDown : MetricIcons.trendStable}
              indicator={trendConfig.indicator}
              description={trendConfig.description}
            />

            <MetricCard
              title={t('metrics.womenParticipation')}
              value={currentMonth.womenParticipation ? formatPercentage(currentMonth.womenParticipation) : t('common.na')}
              icon={MetricIcons.women}
              indicator={currentMonth.womenParticipation >= 50 ? 'positive' : 'neutral'}
              description={t('metrics.womenParticipationDesc')}
            />

            <MetricCard
              title={t('metrics.avgWageRate')}
              value={currentMonth.averageWage ? `₹${currentMonth.averageWage.toFixed(0)}` : t('common.na')}
              icon={MetricIcons.wage}
              indicator="neutral"
              description={t('metrics.avgWageRateDesc')}
            />

            <MetricCard
              title={t('metrics.households100Days')}
              value={currentMonth.households100Days ? formatNumber(currentMonth.households100Days) : t('common.na')}
              icon={MetricIcons.target}
              indicator={currentMonth.households100Days > 0 ? 'positive' : 'neutral'}
              description={t('metrics.households100DaysDesc')}
            />

            <MetricCard
              title={t('metrics.workCompletionRate')}
              value={currentMonth.workCompletion ? formatPercentage(currentMonth.workCompletion) : t('common.na')}
              icon={MetricIcons.checkmark}
              indicator={currentMonth.workCompletion >= 70 ? 'positive' : 'neutral'}
              description={t('metrics.workCompletionRateDesc')}
            />
          </div>
        </section>

        <AdvancedMetricsDropdown 
          performanceData={performanceData}
          districtName={districtName}
          availablePeriods={availablePeriods}
        />

        <section className="trend-indicator-section" aria-label="Trend indicator">
          <TrendIndicator trend={trend} />
        </section>

        <footer className="report-card-footer">
          <p className="last-updated">{t('reportCard.lastUpdated')} {formatDate(lastUpdated)}</p>
        </footer>
      </div>
    </div>
  );
};

export default ReportCard;
