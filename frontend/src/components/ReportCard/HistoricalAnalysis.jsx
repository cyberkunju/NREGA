import React, { useState, useEffect } from 'react';
import { getPerformance } from '../../services/api';
import './HistoricalAnalysis.css';

/**
 * HistoricalAnalysis Component
 * Detailed historical data analysis with precise period selection
 * Integrated into Advanced Metrics section
 */
const HistoricalAnalysis = ({ districtName, availablePeriods }) => {
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // Fetch historical data for selected periods
  const fetchHistoricalData = async (periods) => {
    setLoading(true);
    try {
      const dataPromises = periods.map(period =>
        getPerformance(districtName, period.year, period.month)
      );
      const results = await Promise.all(dataPromises);
      setHistoricalData(results);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodToggle = (period) => {
    const isSelected = selectedPeriods.some(
      p => p.month === period.month && p.year === period.year
    );

    let newSelection;
    if (isSelected) {
      newSelection = selectedPeriods.filter(
        p => !(p.month === period.month && p.year === period.year)
      );
    } else {
      if (compareMode && selectedPeriods.length >= 3) {
        // Limit to 3 periods in compare mode
        return;
      }
      newSelection = [...selectedPeriods, period];
    }

    setSelectedPeriods(newSelection);
    if (newSelection.length > 0) {
      fetchHistoricalData(newSelection);
    } else {
      setHistoricalData([]);
    }
  };

  const exportHistoricalData = () => {
    if (historicalData.length === 0) return;

    const headers = [
      'Period',
      'Payment %',
      'Households',
      'Avg Days',
      'Women %',
      'Wage',
      '100-Day HH',
      'Work Completion %'
    ];

    const rows = historicalData.map(data => [
      `${data.currentMonth.month} ${data.currentMonth.year}`,
      data.currentMonth.paymentPercentage || 'N/A',
      data.currentMonth.totalHouseholds || 'N/A',
      data.currentMonth.averageDays || 'N/A',
      data.currentMonth.womenParticipation || 'N/A',
      data.currentMonth.averageWage || 'N/A',
      data.currentMonth.households100Days || 'N/A',
      data.currentMonth.workCompletion || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${districtName}_Historical_Analysis.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="historical-analysis">
      <div className="historical-header">
        <h4 className="historical-title">
          <svg className="historical-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
          Historical Data Analysis
        </h4>
        <div className="historical-controls">
          <button
            className={`compare-toggle ${compareMode ? 'active' : ''}`}
            onClick={() => setCompareMode(!compareMode)}
          >
            {compareMode ? '✓ Compare Mode' : 'Compare Mode'}
          </button>
          {historicalData.length > 0 && (
            <button className="export-btn-small" onClick={exportHistoricalData}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          )}
        </div>
      </div>

      <p className="historical-hint">
        {compareMode 
          ? 'Select up to 3 periods to compare side-by-side'
          : 'Select periods to view detailed historical data'}
      </p>

      <div className="historical-periods-list">
        {availablePeriods.map((period) => {
          const isSelected = selectedPeriods.some(
            p => p.month === period.month && p.year === period.year
          );

          return (
            <button
              key={`${period.month}-${period.year}`}
              className={`historical-period-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handlePeriodToggle(period)}
              disabled={compareMode && selectedPeriods.length >= 3 && !isSelected}
            >
              <span className="period-checkbox"></span>
              <span className="period-label">
                {period.month} {period.year}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="historical-loading">
          <div className="loading-spinner-small" />
          <p>Loading historical data...</p>
        </div>
      )}

      {!loading && historicalData.length > 0 && (
        <div className="historical-data-display">
          <div className="historical-comparison-grid">
            {historicalData.map((data, index) => (
              <div key={index} className="historical-data-card">
                <div className="data-card-header">
                  <h5>{data.currentMonth.month} {data.currentMonth.year}</h5>
                </div>
                <div className="data-card-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Payment %:</span>
                    <span className="metric-value">
                      {data.currentMonth.paymentPercentage?.toFixed(1) || 'N/A'}%
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Households:</span>
                    <span className="metric-value">
                      {data.currentMonth.totalHouseholds?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Avg Days:</span>
                    <span className="metric-value">
                      {data.currentMonth.averageDays?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Women %:</span>
                    <span className="metric-value">
                      {data.currentMonth.womenParticipation?.toFixed(1) || 'N/A'}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalAnalysis;
