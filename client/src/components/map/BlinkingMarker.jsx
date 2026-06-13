import React, { useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create user location marker (blue)
const createUserLocationMarker = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #3b82f6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">
        📍
      </div>
    `,
    iconSize: [28, 28],
    popupAnchor: [0, -14],
  });
};

// Create parking marker (red)
const createParkingMarker = () => {
  return L.divIcon({
    className: 'parking-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        P
      </div>
    `,
    iconSize: [36, 36],
    popupAnchor: [0, -18],
  });
};

// Add CSS for marker animations
const addMarkerStyles = () => {
  if (document.getElementById('marker-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'marker-styles';
  style.textContent = `
    .parking-marker div:hover {
      transform: scale(1.15);
      transition: transform 0.2s ease;
    }
    .user-location-marker div {
      animation: pulse-blue 1.5s ease-in-out infinite;
    }
    @keyframes pulse-blue {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
};

const BlinkingMarker = ({ position, slot, onBook, isUserLocation = false }) => {
  // Validate position
  if (!position || !Array.isArray(position) || position.length !== 2) {
    console.warn('Invalid marker position:', position);
    return null;
  }
  
  if (isNaN(position[0]) || isNaN(position[1])) {
    console.warn('Invalid coordinates:', position);
    return null;
  }

  useEffect(() => {
    addMarkerStyles();
  }, []);

  const icon = isUserLocation ? createUserLocationMarker() : createParkingMarker();

  // For user location, show different popup
  if (isUserLocation) {
    return (
      <Marker position={position} icon={icon}>
        <Popup>
          <div className="p-2">
            <h3 className="font-bold text-gray-800 text-sm">📍 Your Location</h3>
            <p className="text-xs text-gray-500 mt-1">{slot.location?.address || 'Current Location'}</p>
          </div>
        </Popup>
      </Marker>
    );
  }

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="p-3 min-w-[200px]">
          <h3 className="font-bold text-gray-800 text-base mb-1">{slot.title}</h3>
          <p className="text-xs text-gray-600 mb-2">{slot.location?.address?.substring(0, 60)}</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-600 font-semibold">₹{slot.pricing?.hourly}/hour</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {slot.availableSlots} spots
            </span>
          </div>
          <button 
            onClick={() => onBook(slot)} 
            className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition font-medium"
          >
            Book Now →
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default BlinkingMarker;
