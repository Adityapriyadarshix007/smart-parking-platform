import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MonitorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const response = await api.get('/admin/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
    setLoading(false);
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      fetchAllBookings();
    } catch (error) {
      alert('Error updating status');
    }
  };

  if (loading) return <div className="text-center py-8">Loading bookings...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Monitor Bookings</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr><th className="p-3">User</th><th>Slot</th><th>Vehicle</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b">
                <td className="p-3">{booking.userId?.name}</td>
                <td className="p-3">{booking.slotId?.title}</td>
                <td className="p-3">{booking.vehicleNumber}</td>
                <td className="p-3">₹{booking.totalPrice}</td>
                <td className="p-3">
                  <select value={booking.status} onChange={(e) => updateStatus(booking._id, e.target.value)} className="border rounded px-2 py-1">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-3">
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonitorBookings;
