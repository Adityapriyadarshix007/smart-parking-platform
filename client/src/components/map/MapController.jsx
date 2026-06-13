import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

const MapController = ({ center, zoom, markers }) => {
  const map = useMap();
  const isMounted = useRef(true);
  const viewSet = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Set initial view
  useEffect(() => {
    if (!map || viewSet.current || !center || center.length !== 2) return;
    
    const timer = setTimeout(() => {
      if (map && isMounted.current) {
        try {
          map.setView(center, zoom || 13);
          viewSet.current = true;
        } catch (err) {
          console.warn('Map setView error:', err);
        }
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [map, center, zoom]);

  // Fit bounds for markers
  useEffect(() => {
    if (!map || !markers || markers.length === 0 || !viewSet.current) return;
    
    const timer = setTimeout(() => {
      if (!map || !isMounted.current) return;
      
      try {
        const validMarkers = markers.filter(m => 
          m && m.length === 2 && !isNaN(m[0]) && !isNaN(m[1])
        );
        
        if (validMarkers.length > 0) {
          const bounds = L.latLngBounds(validMarkers);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      } catch (err) {
        console.warn('Map fitBounds error:', err);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [map, markers]);

  return null;
};

export default MapController;
