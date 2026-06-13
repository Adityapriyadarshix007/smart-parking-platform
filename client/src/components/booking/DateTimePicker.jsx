import React from 'react';

const DateTimePicker = ({ startTime, endTime, onStartChange, onEndChange, minDate }) => {
  const minDateTime = minDate || new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => onStartChange(e.target.value)}
          min={minDateTime}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => onEndChange(e.target.value)}
          min={startTime || minDateTime}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );
};

export default DateTimePicker;
