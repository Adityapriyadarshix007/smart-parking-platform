import React, { useEffect, useState } from 'react';
import { formatPrice } from '../../utils/formatters';

const PriceCalculator = ({ slot, startTime, endTime }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [hours, setHours] = useState(0);

  useEffect(() => {
    if (startTime && endTime && slot?.pricing) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffHours = Math.ceil((end - start) / (1000 * 60 * 60));
      setHours(diffHours);
      
      let price = diffHours * (slot.pricing.hourly || 30);
      if (diffHours >= 24) {
        const days = Math.floor(diffHours / 24);
        price = days * (slot.pricing.daily || 150) + (diffHours % 24) * (slot.pricing.hourly || 30);
      }
      setTotalPrice(price);
    }
  }, [slot, startTime, endTime]);

  if (!slot) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold mb-2">Price Breakdown</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Hourly Rate:</span>
          <span>{formatPrice(slot.pricing?.hourly || 30)}/hour</span>
        </div>
        {hours >= 24 && (
          <div className="flex justify-between">
            <span>Daily Rate:</span>
            <span>{formatPrice(slot.pricing?.daily || 150)}/day</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
          <span>Total ({hours} hours):</span>
          <span className="text-green-600">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
