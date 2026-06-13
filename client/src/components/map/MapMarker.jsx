import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createParkingIcon = (isAvailable) => {
  const color = isAvailable ? '#22c55e' : '#ef4444';
  return L.divIcon({
    className: 'custom-parking-marker',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">P</div>`,
    iconSize: [32, 32],
    popupAnchor: [0, -16],
  });
};

const MapMarker = ({ slot, onBook }) => {
  const isAvailable = slot.availableSlots > 0;
  const position = [slot.location.coordinates[1], slot.location.coordinates[0]];

  return (
    <Marker position={position} icon={createParkingIcon(isAvailable)}>
      <Popup>
        <div className="min-w-[200px]">
          <h3 className="font-bold text-lg">{slot.title}</h3>
          <p className="text-sm text-gray-600">{slot.location?.address}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              Available: <span className={isAvailable ? 'text-green-600' : 'text-red-600'}>
                {slot.availableSlots}/{slot.totalSlots}
              </span>
            </p>
            <p className="text-sm">Rate: ₹{slot.pricing?.hourly}/hour</p>
          </div>
          <button
            onClick={() => onBook(slot)}
            disabled={!isAvailable}
            className="mt-3 w-full bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAvailable ? 'Book Now' : 'Full'}
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
