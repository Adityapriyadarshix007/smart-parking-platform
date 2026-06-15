import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminRevenuePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const avgBooking = bookings.length > 0 ? totalRevenue / bookings.length : 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Link to="/admin-dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-gray-600">Total Revenue</div>
            <div className="text-xs text-gray-400">From {bookings.length} bookings</div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">₹{Math.round(avgBooking).toLocaleString()}</div>
            <div className="text-gray-600">Average Booking</div>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{bookings.length}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Slot</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id} className="border-t">
                    <td className="p-3">{booking.userId?.name || 'N/A'}</td>
                    <td className="p-3">{booking.slotId?.title || 'N/A'}</td>
                    <td className="p-3 font-semibold text-green-600">₹{booking.totalPrice}</td>
                    <td className="p-3">{booking.status}</td>
                    <td className="p-3">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;
