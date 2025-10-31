import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPerformance } from '../services/api';
import ReportCardHeader from '../components/ReportCard/ReportCardHeader';
import NaturalLanguageSummary from '../components/ReportCard/NaturalLanguageSummary';
import DetailedMetricsSection from '../components/ReportCard/DetailedMetricsSection';
import { MetricCard, TrendIndicator } from '../components/ReportCard';
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
  const { districtName } = useParams();
  const navigate = useNavigate();
  
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPerformance(districtName);
        setPerformanceData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (districtName) {
      fetchPerformanceData();
    }
  }, [districtName]);

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
          label: 'Improving',
          indicator: 'positive',
          icon: '↑',
          description: 'More workers are being paid on time compared to last month.',
        };
      case 'declining':
        return {
          label: 'Declining',
          indicator: 'negative',
          icon: '↓',
          description: 'Timely payments have fallen since last month.',
        };
      case 'stable':
      default:
        return {
          label: 'Stable',
          indicator: 'neutral',
          icon: '→',
          description: 'Payment performance is holding steady compared to last month.',
        };
    }
  }, [trend]);

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
          <p>Loading performance data…</p>
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
          <h2>Unable to load district data</h2>
          <p>{error.message || 'Please check your connection or try again later.'}</p>
          <div className="error-actions">
            <button type="button" className="secondary-button" onClick={handleBackToSelector}>
              Back to selector
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
              This data may be outdated. Last updated {formatDate(lastUpdated)}.
            </span>
          </aside>
        )}

        <NaturalLanguageSummary performanceData={performanceData} />

        <section className="primary-metrics" aria-labelledby="primary-metrics-heading">
          <h2 id="primary-metrics-heading" className="sr-only">Primary metrics</h2>
          <div className="metrics-grid">
            <MetricCard
              title="Payments on time"
              value={formatPercentage(currentMonth.paymentPercentage)}
              icon="₹"
              indicator={paymentIndicator}
              accentColor={paymentColor}
              description="Share of wages paid within 15 days."
            />

            <MetricCard
              title="Families who got work"
              value={formatNumber(currentMonth.totalHouseholds)}
              icon="👥"
              indicator="neutral"
              description="Households that received employment this month."
            />

            <MetricCard
              title="Average days of work"
              value={currentMonth.averageDays?.toFixed(1) ?? '0.0'}
              unit=" days"
              icon="📅"
              indicator="neutral"
              description="Average number of days of work provided per household."
            />

            <MetricCard
              title="Performance trend"
              value={trendConfig.label}
              icon={trendConfig.icon}
              indicator={trendConfig.indicator}
              description={trendConfig.description}
            />
          </div>
        </section>

        <section className="trend-indicator-section" aria-label="Trend indicator">
          <TrendIndicator trend={trend} />
        </section>

        <DetailedMetricsSection performanceData={performanceData} />

        <footer className="report-card-footer">
          <p className="last-updated">Last updated: {formatDate(lastUpdated)}</p>
        </footer>
      </div>
    </div>
  );
};

export default ReportCard;
