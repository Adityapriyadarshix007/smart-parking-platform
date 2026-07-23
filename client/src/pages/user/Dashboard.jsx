import React, { useEffect, useState, useCallback } from 'react';
import { BASE_URL } from '../../config/apiConfig';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const API_URL = `${BASE_URL}/api/v1`;

  const getSlotDisplay = (booking) => {
    if (booking.slotSnapshot && booking.slotSnapshot.title) {
      return {
        title: booking.slotSnapshot.title,
        location: booking.slotSnapshot.location,
        isDeleted: booking.slotSnapshot.isDeleted || false,
        isFromSnapshot: true
      };
    }
    
    if (booking.slotId && typeof booking.slotId === 'object' && booking.slotId.title) {
      return {
        title: booking.slotId.title,
        location: booking.slotId.location,
        isDeleted: false,
        isFromSnapshot: false
      };
    }
    
    return {
      title: '📍 Location Removed',
      location: {
        address: 'This parking location is no longer available',
        city: '',
        state: ''
      },
      isDeleted: true,
      isFromSnapshot: false
    };
  };

  // ✅ FIXED: Wrapped fetchDashboardData in useCallback
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const bookingsResponse = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookings = bookingsResponse.data.data;
      const now = new Date();
      const upcoming = bookings.filter(b => new Date(b.startTime) > now && b.status === 'confirmed');
      const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
      
      setStats({
        totalBookings: bookings.length,
        upcomingBookings: upcoming.length,
        totalSpent: totalSpent
      });
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [API_URL]);

  // ✅ FIXED: Added fetchDashboardData to dependency array
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white p-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-blue-100">Find and reserve parking slots near you instantly with SmartPark.</p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Upcoming Bookings</p>
                <p className="text-3xl font-bold text-green-600">{stats.upcomingBookings}</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-purple-600">₹{stats.totalSpent}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to="/search" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔍</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Find Parking</h3>
                <p className="text-gray-500 text-sm">Search and book parking slots near you</p>
              </div>
            </div>
          </Link>
          <Link to="/my-bookings" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📅</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">My Bookings</h3>
                <p className="text-gray-500 text-sm">View and manage your reservations</p>
              </div>
            </div>
          </Link>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How SmartPark Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-3">📍</div>
              <h3 className="font-semibold text-gray-800">1. Search Location</h3>
              <p className="text-sm text-gray-500">Enter your destination or use current location</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-2xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-800">2. Choose Slot</h3>
              <p className="text-sm text-gray-500">Select from available parking spaces</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-2xl mb-3">💳</div>
              <h3 className="font-semibold text-gray-800">3. Pay Securely</h3>
              <p className="text-sm text-gray-500">Complete payment via Razorpay</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-2xl mb-3">🚗</div>
              <h3 className="font-semibold text-gray-800">4. Park & Go</h3>
              <p className="text-sm text-gray-500">Navigate and park with ease</p>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
            <div className="space-y-3">
              {recentBookings.map((booking) => {
                const slotData = getSlotDisplay(booking);
                const isDeleted = slotData.isDeleted;
                const hasAddress = slotData.location?.address && slotData.location.address !== 'This parking location is no longer available';
                
                return (
                  <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${isDeleted ? 'text-red-600' : 'text-gray-800'}`}>
                          {slotData.title}
                        </p>
                        {isDeleted && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Removed
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isDeleted ? 'text-red-500' : 'text-gray-500'}`}>
                        {hasAddress ? slotData.location.address : '📍 No location available'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{booking.totalPrice}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/my-bookings" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              View all bookings →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
