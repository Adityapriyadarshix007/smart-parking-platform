import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSyncAlt, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const MonitorBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastShown, setToastShown] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://smart-parking-backend-tefg.onrender.com/api/v1'
    : 'http://localhost:5001/api/v1';

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await adminApiService.getBookings();
      
      if (response && response.success) {
        setBookings(response.data || []);
        setFilteredBookings(response.data || []);
        if (!toastShown) {
          toast.success(`Loaded ${response.data?.length || 0} bookings`);
          setToastShown(true);
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      if (!toastShown) {
        toast.error('Failed to load bookings');
        setToastShown(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Apply filters and search
  useEffect(() => {
    let result = bookings;

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(b => b.status === filter);
    }

    // Apply search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.userId?.name?.toLowerCase().includes(search) ||
        b.slotId?.title?.toLowerCase().includes(search) ||
        b.vehicleNumber?.toLowerCase().includes(search) ||
        b.slotSnapshot?.title?.toLowerCase().includes(search)
      );
    }

    setFilteredBookings(result);
  }, [bookings, filter, searchTerm]);

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-500',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaEye className="text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const viewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // ✅ Update booking status
  const updateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this booking status to ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success(`Booking status updated to ${newStatus}`);
        fetchBookings();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <button onClick={() => navigate('/admin-dashboard')} className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100">
        <FaArrowLeft className="text-sm" /> Back to Dashboard
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaEye /> Monitor Bookings</h1>
            <p className="text-blue-100 mt-1">Real-time booking monitoring and management</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchBookings} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all"><FaSyncAlt /> Refresh</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              All ({bookings.length})
            </button>
            <button onClick={() => setFilter('confirmed')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
            </button>
            <button onClick={() => setFilter('expired')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'expired' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Expired ({bookings.filter(b => b.status === 'expired').length})
            </button>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by user, slot, or vehicle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parking Slot</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr><td colSpan="8" className="px-5 py-8 text-center text-gray-500">No bookings found</td></tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{booking.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.userId?.email || ''}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{booking.slotId?.title || booking.slotSnapshot?.title || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.slotId?.location?.city || booking.slotSnapshot?.location?.city || ''}</div>
                    </td>
                    <td className="px-5 py-4 text-sm">{booking.vehicleNumber || 'N/A'}</td>
                    <td className="px-5 py-4 text-sm">
                      <div>{formatDate(booking.startTime)}</div>
                      <div className="text-xs text-gray-400">to {formatDate(booking.endTime)}</div>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-emerald-600">₹{booking.totalPrice || 0}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => viewDetails(booking)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">View</button>
                        {booking.status === 'pending' && (
                          <button onClick={() => updateStatus(booking._id, 'confirmed')} className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">Confirm</button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button onClick={() => updateStatus(booking._id, 'cancelled')} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-100 flex justify-between">
          <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
          <span>Total: ₹{bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaEye /> Booking Details
            </h3>
            <div className="space-y-3">
              <div><label className="font-semibold">Booking ID:</label> <span className="font-mono">{selectedBooking._id}</span></div>
              <div><label className="font-semibold">User:</label> <span>{selectedBooking.userId?.name}</span></div>
              <div><label className="font-semibold">Email:</label> <span>{selectedBooking.userId?.email}</span></div>
              <div><label className="font-semibold">Parking Slot:</label> <span>{selectedBooking.slotId?.title || selectedBooking.slotSnapshot?.title}</span></div>
              <div><label className="font-semibold">Vehicle:</label> <span>{selectedBooking.vehicleNumber}</span></div>
              <div><label className="font-semibold">Start Time:</label> <span>{formatDate(selectedBooking.startTime)}</span></div>
              <div><label className="font-semibold">End Time:</label> <span>{formatDate(selectedBooking.endTime)}</span></div>
              <div><label className="font-semibold">Amount:</label> <span className="font-bold text-emerald-600">₹{selectedBooking.totalPrice}</span></div>
              <div><label className="font-semibold">Payment Status:</label> <span>{selectedBooking.paymentStatus?.toUpperCase()}</span></div>
              <div><label className="font-semibold">Booking Status:</label> <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(selectedBooking.status)}`}>{selectedBooking.status?.toUpperCase()}</span></div>
              {selectedBooking.cancellationReason && (
                <div><label className="font-semibold">Cancellation Reason:</label> <p className="text-gray-600">{selectedBooking.cancellationReason}</p></div>
              )}
              <div><label className="font-semibold">Created:</label> <span>{formatDate(selectedBooking.createdAt)}</span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowDetailsModal(false); setSelectedBooking(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorBookings;
