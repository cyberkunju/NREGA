import React, { useMemo } from 'react';
import { formatNumber } from '../../utils/formatters';
import './NaturalLanguageSummary.css';

/**
 * Natural Language Summary Component
 * Generates a simple, readable narrative summary of district performance metrics
 * Uses ONLY real API data from the backend response
 * Follows strict accessibility guidelines for low-literacy users
 */
const NaturalLanguageSummary = ({ performanceData }) => {
  // Generate the summary text based on performance data
  const summaryText = useMemo(() => {
    if (!performanceData || !performanceData.currentMonth) {
      return {
        text: `We are currently unable to show a full summary for ${performanceData?.district || 'this district'} for ${performanceData?.currentMonth?.month || ''} ${performanceData?.currentMonth?.year || ''} as some data is missing. Please check the detailed numbers below or try again later.`,
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
    const familiesFormatted = totalHouseholds ? formatNumber(totalHouseholds) : 'N/A';
    const paymentPercent = paymentPercentage ? paymentPercentage.toFixed(1) : '0';
    const avgDaysRounded = averageDays ? Math.round(averageDays) : 0;
    
    // Map trend to user-friendly description
    const trendDescription = {
      'improving': 'getting better',
      'stable': 'staying steady',
      'declining': 'getting worse'
    }[trend] || 'staying steady';

    // Select template based on payment performance thresholds
    if (paymentPercentage >= 90) {
      // Good performance template
      return {
        text: `Good news from ${district} district in ${stateName}! For ${month} ${year}, the MGNREGA work is going well 👍. Almost all workers (${paymentPercent}%) are getting their wages paid quickly and on time. Many families (${familiesFormatted}) found work, getting about ${avgDaysRounded} days of work each on average. Things are currently ${trendDescription}.`,
        hasData: true,
        performance: 'good'
      };
    } else if (paymentPercentage >= 70) {
      // Average performance template
      return {
        text: `Here's the update for ${district} district in ${stateName} for ${month} ${year}. Many families (${familiesFormatted}) got work through MGNREGA, working around ${avgDaysRounded} days each. While most payments (${paymentPercent}%) are on time, there are still some delays we hope improve ⚠️. The situation is currently ${trendDescription}.`,
        hasData: true,
        performance: 'average'
      };
    } else {
      // Poor performance template
      return {
        text: `In ${district} district, ${stateName}, for ${month} ${year}, attention is needed for MGNREGA payments. Although ${familiesFormatted} families received work (averaging ${avgDaysRounded} days), many are facing delays in getting their wages (only ${paymentPercent}% paid on time ❌). We hope this improves soon. The overall trend is currently ${trendDescription}.`,
        hasData: true,
        performance: 'poor'
      };
    }
  }, [performanceData]);

  return (
    <section 
      className="natural-language-summary"
      aria-labelledby="summary-heading"
    >
      <h2 id="summary-heading" className="sr-only">
        District Performance Summary
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
            Summary generated from available data. Some metrics may be incomplete.
          </span>
        </div>
      )}
    </section>
  );
};

export default NaturalLanguageSummary;
