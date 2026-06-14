import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // HARDCODED URL - NO VARIABLES, NO DUPLICATE /api/v1
  const HARDCODED_URL = 'https://smart-parking-backend-tefg.onrender.com/api/v1/messages/my-messages';

  // Fetch unread message count from server with retry logic
  const fetchUnreadCount = async (retryCount = 0) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, retrying in 1 second...');
        if (retryCount < 5) {
          setTimeout(() => fetchUnreadCount(retryCount + 1), 1000);
        }
        return;
      }
      
      console.log('🔍 Fetching unread count for user:', user.email);
      console.log('📡 URL:', HARDCODED_URL);
      
      const response = await axios.get(HARDCODED_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const messages = response.data.data || [];
      // Count unread messages where admin has replied and user hasn't read
      const unread = messages.filter(msg => msg.status === 'replied' && msg.userRead === false).length;
      
      console.log('📬 Unread count:', unread);
      setUnreadMessageCount(unread);
      localStorage.setItem('unreadMessageCount', unread);
      
      // Also dispatch event for any other components
      window.dispatchEvent(new CustomEvent('unreadCountUpdate', { detail: { count: unread } }));
      
    } catch (error) {
      console.error('❌ Error fetching unread count:', error.response?.status, error.response?.data?.message);
      if (error.response?.status === 401 && retryCount < 3) {
        console.log('Retrying fetch due to 401...');
        setTimeout(() => fetchUnreadCount(retryCount + 1), 2000);
      }
    }
  };

  // Setup WebSocket for real-time notifications
  useEffect(() => {
    if (user && user.id) {
      // Initial fetch
      fetchUnreadCount();
      
      // Connect to Socket.io for real-time updates
      const API_URL = 'https://smart-parking-backend-tefg.onrender.com';
      const newSocket = io(API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      setSocket(newSocket);
      
      // Join user's room for private messages
      newSocket.on('connect', () => {
        console.log('🔌 Socket connected, joining user room:', user.id);
        newSocket.emit('join-user', user.id);
      });
      
      // Listen for new message replies
      newSocket.on('new-message-reply', (data) => {
        console.log('🔔 Received new message reply:', data);
        // Immediately fetch updated count
        fetchUnreadCount();
      });
      
      // Handle socket errors
      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
      });
      
      // Poll every 10 seconds as fallback
      const interval = setInterval(() => fetchUnreadCount(), 10000);
      
      return () => {
        clearInterval(interval);
        if (newSocket) {
          newSocket.disconnect();
          newSocket.close();
        }
      };
    } else if (user && !user.id) {
      console.log('Waiting for user ID to be available...');
      // Retry after a delay if user exists but no ID
      const timer = setTimeout(() => {
        if (user && user.id) {
          fetchUnreadCount();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Listen for custom event from MyMessages page
  useEffect(() => {
    const handleUnreadUpdate = (event) => {
      if (event.detail && typeof event.detail.count === 'number') {
        console.log('🔄 Unread count updated via event:', event.detail.count);
        setUnreadMessageCount(event.detail.count);
        localStorage.setItem('unreadMessageCount', event.detail.count);
      }
    };
    
    window.addEventListener('unreadCountUpdate', handleUnreadUpdate);
    
    // Also check localStorage on mount
    const storedCount = localStorage.getItem('unreadMessageCount');
    if (storedCount && !isNaN(parseInt(storedCount))) {
      console.log('📦 Stored unread count from localStorage:', parseInt(storedCount));
      setUnreadMessageCount(parseInt(storedCount));
    }
    
    return () => window.removeEventListener('unreadCountUpdate', handleUnreadUpdate);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-2xl">
              🅿️
            </motion.div>
            <span className="text-xl font-bold tracking-wide">SmartPark</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/search" className="hover:text-blue-200 transition">Find Parking</Link>
              <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
              <Link to="/my-bookings" className="hover:text-blue-200 transition">My Bookings</Link>
              
              {/* Messages with Notification Badge */}
              <Link to="/my-messages" className="hover:text-blue-200 transition relative">
                Messages
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 animate-pulse shadow-lg ring-2 ring-white">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </Link>
              
              <Link to="/features" className="hover:text-blue-200 transition">Features</Link>
              <Link to="/how-it-works" className="hover:text-blue-200 transition">How It Works</Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white">{user.name}</span>
                </Link>
                {user.role === 'owner' && (
                  <Link to="/owner-dashboard" className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm">
                    Owner
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-sm">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link to="/login" className="px-4 py-2 text-white border-2 border-white rounded-md hover:bg-white hover:text-blue-600 transition">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md bg-white/10 hover:bg-white/20 transition"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/20"
          >
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link to="/search" className="px-4 py-2 hover:bg-white/10 rounded-md">Find Parking</Link>
                  <Link to="/dashboard" className="px-4 py-2 hover:bg-white/10 rounded-md">Dashboard</Link>
                  <Link to="/my-bookings" className="px-4 py-2 hover:bg-white/10 rounded-md">My Bookings</Link>
                  <Link to="/my-messages" className="px-4 py-2 hover:bg-white/10 rounded-md relative flex items-center gap-2">
                    Messages
                    {unreadMessageCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ml-1">
                        {unreadMessageCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/features" className="px-4 py-2 hover:bg-white/10 rounded-md">Features</Link>
                  <Link to="/how-it-works" className="px-4 py-2 hover:bg-white/10 rounded-md">How It Works</Link>
                  {user.role === 'owner' && (
                    <Link to="/owner-dashboard" className="px-4 py-2 bg-orange-500 rounded-md text-center">Owner Panel</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin-dashboard" className="px-4 py-2 bg-purple-500 rounded-md text-center">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="px-4 py-2 bg-red-500 rounded-md text-center">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-center border-2 border-white rounded-md">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-center bg-orange-500 rounded-md">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Header;