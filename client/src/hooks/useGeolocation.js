import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState({ lat: null, lng: null, error: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ error: 'Geolocation not supported' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null
        });
        setLoading(false);
      },
      (error) => {
        setLocation({ error: error.message });
        setLoading(false);
      }
    );
  }, []);

  return { location, loading };
};
