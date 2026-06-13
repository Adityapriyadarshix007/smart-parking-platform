import { useState } from 'react';
import parkingService from '../services/parkingService';

export const useParkingSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const search = async (lat, lng, radius, vehicleType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await parkingService.getNearby(lat, lng, radius, vehicleType);
      setResults(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { search, results, loading, error };
};
