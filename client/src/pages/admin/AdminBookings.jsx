import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://smart-parking-backend-tefg.onrender.com/api/v1/admin/bookings',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://smart-parking-backend-tefg.onrender.com/api/v1/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Booking ${newStatus} successfully`);
      fetchAllBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.slotId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Bookings</h1>
          <p className="text-gray-600 mb-6">View and manage all parking bookings</p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by user, parking slot, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

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
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <div className="font-medium text-gray-800">{booking.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.userId?.email || 'N/A'}</div>
                     </td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-gray-800">{booking.slotId?.title || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.slotId?.location?.city || 'N/A'}</div>
                     </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-800">{booking.vehicleNumber}</div>
                      <div className="text-xs text-gray-500 capitalize">{booking.vehicleType}</div>
                     </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatDate(booking.startTime)}<br />
                      <span className="text-xs text-gray-400">to {formatDate(booking.endTime)}</span>
                     </td>
                    <td className="p-3">
                      <div className="font-semibold text-green-600">₹{booking.totalPrice}</div>
                      <div className="text-xs text-gray-500 capitalize">{booking.paymentStatus}</div>
                     </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                        {booking.status?.toUpperCase()}
                      </span>
                     </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Complete
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                     </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">No bookings found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
