import React, { useState } from 'react';

const LocationSearch = ({ onLocationSelect, placeholder = "Enter location..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Location search error:', error);
    }
    setLoading(false);
  };

  const handleSelect = (location) => {
    setQuery(location.display_name);
    onLocationSelect({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: location.display_name,
    });
    setSuggestions([]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location',
          });
          setQuery('Current Location');
        },
        (error) => alert('Unable to get location: ' + error.message)
      );
    } else {
      alert('Geolocation not supported');
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchLocation(e.target.value);
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          title="Use current location"
        >
          📍
        </button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
            >
              <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
              <div className="text-xs text-gray-500">{suggestion.display_name}</div>
            </button>
          ))}
        </div>
      )}
      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
