import React from 'react';
import { formatDate } from '../../utils/formatters';
import './ReportCardHeader.css';

const ReportCardHeader = ({ 
  districtName, 
  stateName, 
  month, 
  year, 
  lastUpdated, 
  onBackClick 
}) => {
  return (
    <header className="report-header-minimalist" role="banner">
      {/* Navigation */}
      <nav className="header-navigation" aria-label="Breadcrumb navigation">
        <button 
          className="back-to-map-link" 
          onClick={onBackClick}
          aria-label="Go back to district map"
          type="button"
        >
          <span className="back-arrow" aria-hidden="true">←</span>
          <span className="back-text">Back to Map</span>
        </button>
      </nav>
      
      {/* Main Header Content */}
      <div className="header-content">
        <h1 className="district-title" id="main-heading">
          District Report: <span className="district-name">{districtName}</span>
        </h1>
        <p className="report-subtitle">
          Data for: <strong>{month} {year}</strong> 
          <span className="separator" aria-hidden="true">|</span>
          Last Updated: <strong>{formatDate(lastUpdated)}</strong>
        </p>
      </div>
    </header>
  );
};

export default ReportCardHeader;