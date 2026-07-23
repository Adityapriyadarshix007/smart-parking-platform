import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSyncAlt, FaCalendarCheck } from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const AdminAllBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0
  });
  const toastShownRef = useRef(false);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Fetching all bookings...');
      const response = await adminApiService.getBookings();
      console.log('📊 Bookings response:', response);

      // ✅ FIX: Access data from response.data
      if (response && response.success) {
        const bookingsData = response.data || [];
        console.log('📊 Bookings count:', bookingsData.length);
        
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);

        setStats({
          total: bookingsData.length,
          confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
          pending: bookingsData.filter(b => b.status === 'pending').length,
          cancelled: bookingsData.filter(b => b.status === 'cancelled').length
        });
        
        if (!toastShownRef.current) {
          toast.success(`Loaded ${bookingsData.length} bookings`);
          toastShownRef.current = true;
        }
      } else {
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = bookings.filter(b => {
      const slotTitle = b.slotId?.title || b.slotSnapshot?.title || '';
      return (
        b.userId?.name?.toLowerCase().includes(search) ||
        slotTitle.toLowerCase().includes(search) ||
        b.vehicleNumber?.toLowerCase().includes(search) ||
        b.userId?.email?.toLowerCase().includes(search)
      );
    });
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

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

  const getSlotDisplay = (booking) => {
    if (booking.slotSnapshot && booking.slotSnapshot.title) {
      return {
        title: booking.slotSnapshot.title,
        city: booking.slotSnapshot.location?.city || '',
        isDeleted: booking.slotSnapshot.isDeleted || false
      };
    }
    if (booking.slotId && typeof booking.slotId === 'object' && booking.slotId.title) {
      return {
        title: booking.slotId.title,
        city: booking.slotId.location?.city || '',
        isDeleted: false
      };
    }
    return {
      title: '📍 Location Removed',
      city: '',
      isDeleted: true
    };
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
      <button 
        onClick={() => navigate('/admin-dashboard')} 
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
      >
        <FaArrowLeft className="text-sm" /> Back to Dashboard
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaCalendarCheck /> All Bookings</h1>
            <p className="text-blue-100 mt-1">View and manage all parking reservations</p>
          </div>
          <button onClick={fetchBookings} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all">
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-4xl font-extrabold text-blue-600">{stats.total}</div>
          <div className="text-gray-600 font-medium mt-1">Total Bookings</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-4xl font-extrabold text-emerald-600">{stats.confirmed}</div>
          <div className="text-gray-600 font-medium mt-1">Confirmed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-4xl font-extrabold text-amber-600">{stats.pending}</div>
          <div className="text-gray-600 font-medium mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-4xl font-extrabold text-red-600">{stats.cancelled}</div>
          <div className="text-gray-600 font-medium mt-1">Cancelled</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by user, parking slot, or vehicle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parking Slot</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-500">No bookings found</td></tr>
              ) : (
                filteredBookings.map((booking) => {
                  const slotData = getSlotDisplay(booking);
                  return (
                    <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4"><div className="font-medium">{booking.userId?.name || 'N/A'}</div><div className="text-xs text-gray-500">{booking.userId?.email || ''}</div></td>
                      <td className="px-5 py-4"><div className={`font-medium ${slotData.isDeleted ? 'text-red-600' : ''}`}>{slotData.title || 'N/A'}{slotData.isDeleted && <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">Deleted</span>}</div><div className="text-xs text-gray-500">{slotData.city || ''}</div></td>
                      <td className="px-5 py-4">{booking.vehicleNumber || 'N/A'}</td>
                      <td className="px-5 py-4"><div>{formatDate(booking.startTime)}</div><div className="text-xs text-gray-400">to {formatDate(booking.endTime)}</div></td>
                      <td className="px-5 py-4 font-bold text-emerald-600">₹{booking.totalPrice || 0}</td>
                      <td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(booking.status)}`}>{getStatusText(booking.status)}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">Showing {filteredBookings.length} of {bookings.length} bookings</div>
      </div>
    </div>
  );
};

export default AdminAllBookingsPage;
