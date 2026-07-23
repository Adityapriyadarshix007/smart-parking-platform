import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

const AddressSearch = forwardRef(({ onLocationSelect, placeholder = "Search for a location..." }, ref) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  useImperativeHandle(ref, () => ({
    setInputValue: (value) => {
      setQuery(value);
      setSelectedAddress(value);
    },
    getValue: () => query
  }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchAddress = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim() || searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1&countrycodes=in`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Address search error:', error);
        setSuggestions([]);
      }
      setLoading(false);
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedAddress('');
    searchAddress(value);
  };

  const handleSelectLocation = (location) => {
    const address = location.display_name;
    setQuery(address);
    setSelectedAddress(address);
    setSuggestions([]);
    
    console.log('Selected location:', {
      lat: location.lat,
      lon: location.lon,
      address: address
    });
    
    onLocationSelect({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: address,
      city: location.address?.city || location.address?.town || location.address?.village || '',
      state: location.address?.state || '',
      country: location.address?.country || 'India'
    });
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={placeholder}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0"
              >
                <div className="font-medium text-gray-800 text-sm">
                  {suggestion.display_name.split(',')[0]}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {suggestion.display_name}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedAddress && (
        <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Selected: {selectedAddress.length > 80 ? selectedAddress.substring(0, 80) + '...' : selectedAddress}</span>
        </div>
      )}
    </div>
  );
});

AddressSearch.displayName = 'AddressSearch';

export default AddressSearch;
