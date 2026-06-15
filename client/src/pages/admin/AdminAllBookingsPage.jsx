import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAllBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const filteredBookings = bookings.filter(booking =>
    booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.slotId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Link to="/admin-dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">All Bookings</h1>
          <p className="text-gray-600 mb-4">Total: {bookings.length} bookings</p>
          
          <input
            type="text"
            placeholder="Search by user, parking slot, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="p-3 text-left">User</th><th className="p-3 text-left">Parking Slot</th><th className="p-3 text-left">Vehicle</th><th className="p-3 text-left">Date & Time</th><th className="p-3 text-left">Amount</th><th className="p-3 text-left">Status</th></tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking._id} className="border-t">
                    <td className="p-3">{booking.userId?.name || 'N/A'}</td>
                    <td className="p-3">{booking.slotId?.title || 'N/A'}</td>
                    <td className="p-3">{booking.vehicleNumber}</td>
                    <td className="p-3">{formatDate(booking.startTime)}<br/><span className="text-xs text-gray-400">to {formatDate(booking.endTime)}</span></td>
                    <td className="p-3 font-semibold text-green-600">₹{booking.totalPrice}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {booking.status}
                      </span>
                    </td>
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

export default AdminAllBookingsPage;
