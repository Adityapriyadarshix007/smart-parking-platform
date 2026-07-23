import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminRevenuePage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgBooking: 0,
    totalBookings: 0
  });

  useEffect(() => {
    const fetchRevenueData = async () => {
      const token = localStorage.getItem('token');
      console.log('🔍 Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No token, redirecting to login');
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // ✅ Use the same API URL as dashboard
        const API_URL = 'http://localhost:5001/api/v1';
        const url = `${API_URL}/admin/bookings`;
        
        console.log('📡 Fetching from URL:', url);
        console.log('📡 Token:', token.substring(0, 20) + '...');
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📊 Full API Response:', data);
        
        if (data && data.success) {
          const bookingsData = data.data || [];
          console.log('✅ Bookings count:', bookingsData.length);
          
          if (bookingsData.length > 0) {
            console.log('✅ First booking:', bookingsData[0]);
          }
          
          setBookings(bookingsData);

          // Calculate revenue
          const total = bookingsData.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
          const avg = bookingsData.length > 0 ? Math.round(total / bookingsData.length) : 0;
          
          console.log('💰 Revenue stats:', { total, avg, count: bookingsData.length });
          
          setStats({
            totalRevenue: total,
            avgBooking: avg,
            totalBookings: bookingsData.length
          });
          
          toast.success(`Revenue data loaded - ₹${total.toLocaleString()}`);
        } else {
          console.error('❌ API returned error:', data);
          setError(data.message || 'Failed to load revenue data');
          toast.error(data.message || 'Failed to load revenue data');
        }
      } catch (error) {
        console.error('❌ Error fetching revenue data:', error);
        setError(error.message);
        toast.error('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'paid' || status === 'PAID') {
      return 'bg-emerald-100 text-emerald-700';
    }
    return 'bg-amber-100 text-amber-700';
  };

  const getBookingStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-500',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Check the console (F12) for more details</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Retry
          </button>
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
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaChartLine /> Revenue Report
            </h1>
            <p className="text-blue-100 mt-1">Platform earnings and transaction analytics</p>
          </div>
          <div className="text-white bg-white/20 px-4 py-2 rounded-full">
            {stats.totalBookings} Bookings
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-4xl font-extrabold text-emerald-600">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-gray-600 font-medium mt-2">Total Revenue</div>
          <div className="text-xs text-gray-400 mt-1">From {stats.totalBookings} bookings</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-4xl font-extrabold text-blue-600">₹{stats.avgBooking.toLocaleString()}</div>
          <div className="text-gray-600 font-medium mt-2">Average Booking Value</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-4xl font-extrabold text-purple-600">{stats.totalBookings}</div>
          <div className="text-gray-600 font-medium mt-2">Total Bookings</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-gray-500" /> Transaction History ({bookings.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parking Slot</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No transactions found</p>
                    <p className="text-xs text-gray-400 mt-1">Transactions will appear here once bookings are made</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <tr key={booking._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{booking.userId?.name || booking.userName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.userId?.email || booking.userEmail || ''}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{booking.slotId?.title || booking.slotSnapshot?.title || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.slotId?.location?.city || booking.slotSnapshot?.location?.city || ''}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-600">₹{booking.totalPrice || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.paymentStatus)}`}>
                        {(booking.paymentStatus || 'PAID').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBookingStatusBadge(booking.status)}`}>
                        {booking.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(booking.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">
          Showing {bookings.length} transactions | Total Revenue: ₹{stats.totalRevenue.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;
