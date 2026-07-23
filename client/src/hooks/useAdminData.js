import { useState, useEffect, useCallback } from 'react';
import { adminApiService } from '../services/adminApiService';
import toast from 'react-hot-toast';

export const useAdminData = (fetchFn, successMessage, errorMessage) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFn();
      console.log('📊 Data response:', response);

      if (response && response.success) {
        const resultData = response.data || [];
        setData(resultData);
        if (!dataLoaded && resultData.length > 0) {
          toast.success(`${successMessage} ${resultData.length}`);
          setDataLoaded(true);
        } else if (!dataLoaded) {
          toast.success(`No ${successMessage.toLowerCase()} found`);
          setDataLoaded(true);
        }
      } else {
        if (!dataLoaded) {
          toast.error(errorMessage || 'Failed to load data');
          setDataLoaded(true);
        }
        setError(response?.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      if (!dataLoaded) {
        toast.error(err.response?.data?.message || errorMessage || 'Failed to load data');
        setDataLoaded(true);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, successMessage, errorMessage, dataLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, fetchData, setData };
};

export default useAdminData;
