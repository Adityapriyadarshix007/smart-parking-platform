import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const ParkingMap = ({ parkingSlots, center, zoom = 13, onMarkerClick }) => {
  const defaultCenter = center || [28.6139, 77.2090];

  return (
    <MapContainer center={defaultCenter} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapController center={defaultCenter} zoom={zoom} />
      {parkingSlots?.map((slot) => (
        <Marker
          key={slot._id}
          position={[slot.location.coordinates[1], slot.location.coordinates[0]]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{slot.title}</h3>
              <p className="text-sm text-gray-600">{slot.location?.address}</p>
              <p className="text-green-600 font-semibold mt-1">₹{slot.pricing?.hourly}/hour</p>
              <button
                onClick={() => onMarkerClick?.(slot)}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm w-full"
              >
                Book Now
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ParkingMap;
