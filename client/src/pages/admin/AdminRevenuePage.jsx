import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminRevenuePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        return;
      }
      
      const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBookings(response.data.data || []);
      } else {
        toast.error('Failed to load revenue data');
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast.error(error.response?.data?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const avgBooking = bookings.length > 0 ? totalRevenue / bookings.length : 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading revenue data...</p>
        </div>
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
            <div className="text-xs text-gray-400 mt-1">From {bookings.length} bookings</div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">₹{Math.round(avgBooking).toLocaleString()}</div>
            <div className="text-gray-600">Average Booking Value</div>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{bookings.length}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">User</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Parking Slot</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Payment Status</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  </td>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm">{booking.userId?.name || 'N/A'}</td>
                      <td className="p-3 text-sm">{booking.slotId?.title || 'N/A'}</td>
                      <td className="p-3 font-semibold text-green-600 text-sm">₹{booking.totalPrice}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {booking.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;
