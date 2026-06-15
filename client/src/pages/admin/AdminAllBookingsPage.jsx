import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAllBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
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
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBookings = bookings.filter(booking =>
    booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.slotId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading bookings...</p>
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">All Bookings</h1>
          <p className="text-gray-600 mb-4">Total: {bookings.length} bookings found</p>
          
          <input
            type="text"
            placeholder="Search by user, parking slot, or vehicle number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">User</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Parking Slot</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Vehicle</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Date & Time</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-gray-800 text-sm">{booking.userId?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.userId?.email || 'N/A'}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-800">{booking.slotId?.title || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.slotId?.location?.city || ''}</div>
                       </td>
                      <td className="p-3 text-sm">{booking.vehicleNumber}</td>
                      <td className="p-3 text-sm">
                        {formatDate(booking.startTime)}<br />
                        <span className="text-xs text-gray-400">to {formatDate(booking.endTime)}</span>
                      </td>
                      <td className="p-3 font-semibold text-green-600 text-sm">₹{booking.totalPrice}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
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

export default AdminAllBookingsPage;
