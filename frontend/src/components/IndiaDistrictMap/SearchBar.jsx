import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getHeatmapData } from '../../services/api';
import './SearchBar.css';

const SearchBar = ({ onSelectDistrict }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [allDistricts, setAllDistricts] = useState([]);

  useEffect(() => {
    // Load all districts for search
    const loadDistricts = async () => {
      try {
        const { data } = await getHeatmapData();
        setAllDistricts(data);
      } catch (error) {
        console.error('Failed to load districts for search:', error);
      }
    };
    loadDistricts();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = allDistricts
      .filter(d => 
        d.districtName?.toLowerCase().includes(query.toLowerCase()) ||
        d.stateName?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);

    setSearchResults(results);
    setShowResults(true);
  };

  const handleSelect = (district) => {
    setSearchQuery('');
    setShowResults(false);
    if (onSelectDistrict) {
      onSelectDistrict(district.districtName);
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={t('mapControls.search')}
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {showResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => handleSelect(result)}
              >
                <div className="result-district">{result.districtName}</div>
                <div className="result-state">{result.stateName}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
