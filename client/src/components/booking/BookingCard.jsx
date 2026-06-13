import React from 'react';
import { formatPrice, formatDateTime } from '../../utils/formatters';

const BookingCard = ({ booking, onCancel, onViewDetails }) => {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{booking.slotId?.title}</h3>
          <p className="text-gray-600 text-sm">{booking.slotId?.location?.address}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
          </p>
          <p className="text-lg font-bold text-green-600 mt-2">
            {formatPrice(booking.totalPrice)}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2 py-1 rounded text-xs ${statusColors[booking.status] || 'bg-gray-100'}`}>
            {booking.status?.toUpperCase()}
          </span>
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onCancel(booking._id)}
              className="block mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onViewDetails(booking._id)}
            className="block mt-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
