import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ districts, onDistrictSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search with fuzzy matching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredDistricts([]);
        setShowDropdown(false);
        return;
      }

      // Fuzzy matching: filter districts that contain the search term (case-insensitive)
      const searchLower = searchTerm.toLowerCase();
      const matches = districts.filter(district => 
        district.toLowerCase().includes(searchLower)
      );

      // Sort by relevance: exact matches first, then starts-with, then contains
      matches.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        if (aLower === searchLower) return -1;
        if (bLower === searchLower) return 1;
        if (aLower.startsWith(searchLower)) return -1;
        if (bLower.startsWith(searchLower)) return 1;
        return 0;
      });

      setFilteredDistricts(matches.slice(0, 10)); // Limit to 10 results
      setShowDropdown(matches.length > 0);
      setSelectedIndex(-1);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, districts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDistrictClick = (district) => {
    setSearchTerm(district);
    setShowDropdown(false);
    if (onDistrictSelect) {
      onDistrictSelect(district);
    }
    navigate(`/district/${encodeURIComponent(district)}`);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredDistricts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredDistricts.length) {
          handleDistrictClick(filteredDistricts[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredDistricts([]);
    setShowDropdown(false);
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for your district..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setShowDropdown(filteredDistricts.length > 0)}
        />
        {searchTerm && (
          <button 
            className="clear-button" 
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      
      {showDropdown && (
        <ul className="search-dropdown">
          {filteredDistricts.map((district, index) => (
            <li
              key={district}
              className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleDistrictClick(district)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {district}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
