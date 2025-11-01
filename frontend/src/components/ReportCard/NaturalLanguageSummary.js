import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/formatters';
import './NaturalLanguageSummary.css';

/**
 * Natural Language Summary Component
 * Generates a simple, readable narrative summary of district performance metrics
 * Uses ONLY real API data from the backend response
 * Follows strict accessibility guidelines for low-literacy users
 */
const NaturalLanguageSummary = ({ performanceData }) => {
  const { t } = useTranslation();
  // Generate the summary text based on performance data
  const summaryText = useMemo(() => {
    if (!performanceData || !performanceData.currentMonth) {
      return {
        text: t('summary.noData', {
          district: performanceData?.district || t('summary.thisDistrict'),
          month: performanceData?.currentMonth?.month || '',
          year: performanceData?.currentMonth?.year || ''
        }),
        hasData: false
      };
    }

    const {
      district,
      state: stateName,
      currentMonth,
      trend
    } = performanceData;

    const {
      month,
      year,
      paymentPercentage,
      totalHouseholds,
      averageDays
    } = currentMonth;

    // Format values for display
    const familiesFormatted = totalHouseholds ? formatNumber(totalHouseholds) : t('common.na');
    const paymentPercent = paymentPercentage ? paymentPercentage.toFixed(1) : '0';
    const avgDaysRounded = averageDays ? Math.round(averageDays) : 0;
    
    // Map trend to user-friendly description
    const trendDescription = {
      'improving': t('summary.trendImproving'),
      'stable': t('summary.trendStable'),
      'declining': t('summary.trendDeclining')
    }[trend] || t('summary.trendStable');

    // Select template based on payment performance thresholds
    if (paymentPercentage >= 90) {
      // Good performance template
      return {
        text: t('summary.goodPerformance', {
          district,
          state: stateName,
          month,
          year,
          paymentPercent,
          families: familiesFormatted,
          avgDays: avgDaysRounded,
          trend: trendDescription
        }),
        hasData: true,
        performance: 'good'
      };
    } else if (paymentPercentage >= 70) {
      // Average performance template
      return {
        text: t('summary.averagePerformance', {
          district,
          state: stateName,
          month,
          year,
          families: familiesFormatted,
          avgDays: avgDaysRounded,
          paymentPercent,
          trend: trendDescription
        }),
        hasData: true,
        performance: 'average'
      };
    } else {
      // Poor performance template
      return {
        text: t('summary.poorPerformance', {
          district,
          state: stateName,
          month,
          year,
          families: familiesFormatted,
          avgDays: avgDaysRounded,
          paymentPercent,
          trend: trendDescription
        }),
        hasData: true,
        performance: 'poor'
      };
    }
  }, [performanceData, t]);

  return (
    <section 
      className="natural-language-summary"
      aria-labelledby="summary-heading"
    >
      <h2 id="summary-heading" className="sr-only">
        {t('summary.heading')}
      </h2>
      
      <div 
        className={`summary-content ${summaryText.performance || 'default'}`}
        aria-live="polite"
      >
        <p className="summary-text">
          {summaryText.text}
        </p>
      </div>
      
      {!summaryText.hasData && (
        <div className="summary-notice" role="note">
          <span className="notice-icon" aria-hidden="true">ℹ️</span>
          <span className="notice-text">
            {t('summary.incompleteNotice')}
          </span>
        </div>
      )}
    </section>
  );
};

export default NaturalLanguageSummary;
