import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, FaUsers, FaParking, FaCalendarCheck, 
  FaMoneyBillWave, FaArrowRight, FaUserCog, FaEnvelope,
  FaCheckCircle, FaClock, FaTimesCircle
} from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalOwners: 0,
    totalSlots: 0,
    totalBookings: 0,
    totalEarnings: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toastShownRef = useRef(false);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ Check if user is admin
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('👤 User role:', user.role);
          if (user.role !== 'admin') {
            setError('You do not have admin access. Please contact the administrator.');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }

      try {
        console.log('🔄 Fetching admin dashboard data...');
        
        const [statsResponse, bookingsResponse] = await Promise.all([
          adminApiService.getStats(),
          adminApiService.getBookings()
        ]);

        console.log('📊 Stats response:', statsResponse);
        console.log('📊 Bookings response:', bookingsResponse);

        if (statsResponse && statsResponse.success) {
          const statsData = statsResponse.data || {};
          setStats({
            totalUsers: statsData.totalUsers || 0,
            totalAdmins: statsData.totalAdmins || 0,
            totalOwners: statsData.totalOwners || 0,
            totalSlots: statsData.totalSlots || 0,
            totalBookings: statsData.totalBookings || 0,
            totalEarnings: statsData.totalEarnings || 0,
            confirmed: statsData.confirmedBookings || 0,
            pending: statsData.pendingBookings || 0,
            cancelled: statsData.cancelledBookings || 0
          });
        }

        if (bookingsResponse && bookingsResponse.success) {
          const bookings = bookingsResponse.data || [];
          if (stats.confirmed === 0 && stats.pending === 0 && stats.cancelled === 0 && bookings.length > 0) {
            setStats(prev => ({
              ...prev,
              confirmed: bookings.filter(b => b.status === 'confirmed').length,
              pending: bookings.filter(b => b.status === 'pending').length,
              cancelled: bookings.filter(b => b.status === 'cancelled').length
            }));
          }
        }

        if (!toastShownRef.current) {
          toast.success('Dashboard loaded successfully');
          toastShownRef.current = true;
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        
        // ✅ Better error handling - show specific error message
        if (error.userMessage) {
          setError(error.userMessage);
        } else if (error.response?.status === 403) {
          setError('You do not have admin access. Please contact the administrator.');
        } else if (error.response?.status === 401) {
          setError('Your session has expired. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else if (error.message?.includes('Network Error') || error.code === 'ECONNABORTED') {
          setError('Cannot connect to server. Please check your network connection.');
        } else {
          setError(error.response?.data?.message || 'Failed to load dashboard data');
        }
        
        if (!toastShownRef.current) {
          toast.error(error.userMessage || 'Failed to load dashboard');
          toastShownRef.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // ✅ Retry function
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    dataFetchedRef.current = false;
    toastShownRef.current = false;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Try refreshing the page or logging in again.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 mb-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaChartLine /> Admin Dashboard</h1>
        <p className="text-blue-100 mt-1">Complete analytics and control over the platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => navigate('/admin/users')} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:-translate-y-1">
          <div className="flex justify-center mb-3"><FaUsers className="text-4xl text-blue-500" /></div>
          <div className="text-3xl font-extrabold text-gray-800">{stats.totalUsers}</div>
          <div className="text-gray-600 font-medium mt-1">Total Users</div>
          <div className="text-xs text-gray-400 mt-1">{stats.totalAdmins} Admins, {stats.totalOwners} Owners</div>
        </div>
        <div onClick={() => navigate('/admin/slots')} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:-translate-y-1">
          <div className="flex justify-center mb-3"><FaParking className="text-4xl text-purple-500" /></div>
          <div className="text-3xl font-extrabold text-gray-800">{stats.totalSlots}</div>
          <div className="text-gray-600 font-medium mt-1">Parking Slots</div>
          <div className="text-xs text-gray-400 mt-1">Across India</div>
        </div>
        <div onClick={() => navigate('/admin/all-bookings')} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:-translate-y-1">
          <div className="flex justify-center mb-3"><FaCalendarCheck className="text-4xl text-emerald-500" /></div>
          <div className="text-3xl font-extrabold text-gray-800">{stats.totalBookings}</div>
          <div className="text-gray-600 font-medium mt-1">Total Bookings</div>
          <div className="text-xs text-gray-400 mt-1">All time</div>
        </div>
        <div onClick={() => navigate('/admin/revenue')} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:-translate-y-1">
          <div className="flex justify-center mb-3"><FaMoneyBillWave className="text-4xl text-amber-500" /></div>
          <div className="text-3xl font-extrabold text-gray-800">₹{(stats.totalEarnings || 0).toLocaleString()}</div>
          <div className="text-gray-600 font-medium mt-1">Total Revenue</div>
          <div className="text-xs text-gray-400 mt-1">Platform earnings</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div onClick={() => navigate('/admin/bookings/filtered?status=confirmed')} className="bg-emerald-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:-translate-y-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Confirmed Bookings</h3>
            <FaCheckCircle className="text-emerald-500 text-2xl" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-500 mt-2">Successfully completed & paid</div>
          <div className="text-sm text-blue-600 font-semibold mt-4 flex items-center gap-2">Click to view all <FaArrowRight className="text-xs" /></div>
        </div>
        <div onClick={() => navigate('/admin/bookings/filtered?status=pending')} className="bg-amber-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:-translate-y-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pending Bookings</h3>
            <FaClock className="text-amber-500 text-2xl" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-gray-500 mt-2">Awaiting confirmation</div>
          <div className="text-sm text-blue-600 font-semibold mt-4 flex items-center gap-2">Click to view all <FaArrowRight className="text-xs" /></div>
        </div>
        <div onClick={() => navigate('/admin/bookings/filtered?status=cancelled')} className="bg-red-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:-translate-y-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Cancelled Bookings</h3>
            <FaTimesCircle className="text-red-500 text-2xl" />
          </div>
          <div className="text-3xl font-extrabold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-500 mt-2">Refunded / Rejected</div>
          <div className="text-sm text-blue-600 font-semibold mt-4 flex items-center gap-2">Click to view all <FaArrowRight className="text-xs" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 hover:border-blue-300">
            <div className="bg-blue-500 text-white p-3 rounded-xl"><FaUserCog className="text-2xl" /></div>
            <div className="text-left"><div className="font-semibold text-gray-800">Manage Users</div><div className="text-xs text-gray-500">View and manage all users</div></div>
          </button>
          <button onClick={() => navigate('/admin/messages')} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 hover:border-blue-300">
            <div className="bg-purple-500 text-white p-3 rounded-xl"><FaEnvelope className="text-2xl" /></div>
            <div className="text-left"><div className="font-semibold text-gray-800">Manage Messages</div><div className="text-xs text-gray-500">View and reply to messages</div></div>
          </button>
          <button onClick={() => navigate('/admin/listings')} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 hover:border-blue-300">
            <div className="bg-emerald-500 text-white p-3 rounded-xl"><FaCheckCircle className="text-2xl" /></div>
            <div className="text-left"><div className="font-semibold text-gray-800">Verify Listings</div><div className="text-xs text-gray-500">Verify parking listings</div></div>
          </button>
          <button onClick={() => navigate('/admin/monitor-bookings')} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 hover:border-blue-300">
            <div className="bg-amber-500 text-white p-3 rounded-xl"><FaCalendarCheck className="text-2xl" /></div>
            <div className="text-left"><div className="font-semibold text-gray-800">Monitor Bookings</div><div className="text-xs text-gray-500">Real-time booking monitoring</div></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
