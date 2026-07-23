import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSyncAlt, FaFilter } from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const AdminBookingsFilteredPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'all';
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toastShownRef = useRef(false);

  const statusTitles = {
    confirmed: '✅ Confirmed Bookings',
    pending: '⏳ Pending Bookings',
    cancelled: '❌ Cancelled Bookings'
  };

  const statusSubtitles = {
    confirmed: 'Successfully completed & paid bookings',
    pending: 'Awaiting confirmation',
    cancelled: 'Refunded / Rejected bookings'
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

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      console.log(`🔄 Fetching ${status} bookings...`);
      const response = await adminApiService.getBookings();
      console.log('📊 Bookings response:', response);

      if (response && response.success) {
        const allBookings = response.data || [];
        const filtered = allBookings.filter(b => b.status === status);
        setBookings(allBookings);
        setFilteredBookings(filtered);
        
        if (!toastShownRef.current) {
          if (filtered.length > 0) {
            toast.success(`Loaded ${filtered.length} ${status} bookings`);
          } else {
            toast.success(`No ${status} bookings found`);
          }
          toastShownRef.current = true;
        }
      } else {
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [status]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings.filter(b => b.status === status));
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = bookings.filter(b => {
      if (b.status !== status) return false;
      return (
        b.userId?.name?.toLowerCase().includes(search) ||
        b.slotId?.title?.toLowerCase().includes(search) ||
        b.vehicleNumber?.toLowerCase().includes(search)
      );
    });
    setFilteredBookings(filtered);
  }, [searchTerm, bookings, status]);

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
          <div><h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaFilter /> {statusTitles[status] || 'Bookings'}</h1><p className="text-blue-100 mt-1">{statusSubtitles[status] || 'View filtered bookings'}</p></div>
          <button onClick={fetchBookings} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all"><FaSyncAlt /> Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by user or parking slot..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
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
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-8 text-center text-gray-500">No {status} bookings found</td></tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4"><div className="font-medium">{booking.userId?.name || 'N/A'}</div><div className="text-xs text-gray-500">{booking.userId?.email || ''}</div></td>
                    <td className="px-5 py-4"><div className="font-medium">{booking.slotId?.title || booking.slotSnapshot?.title || 'N/A'}</div><div className="text-xs text-gray-500">{booking.slotId?.location?.city || booking.slotSnapshot?.location?.city || ''}</div></td>
                    <td className="px-5 py-4">{booking.vehicleNumber || 'N/A'}</td>
                    <td className="px-5 py-4"><div>{formatDate(booking.startTime)}</div><div className="text-xs text-gray-400">to {formatDate(booking.endTime)}</div></td>
                    <td className="px-5 py-4 font-bold text-emerald-600">₹{booking.totalPrice || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">Showing {filteredBookings.length} {status} bookings</div>
      </div>
    </div>
  );
};

export default AdminBookingsFilteredPage;
