import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Debounce timer ref
  const fetchDebounceRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // HARDCODED URL - NO VARIABLES, NO DUPLICATE /api/v1
  const HARDCODED_URL = 'https://smart-parking-backend-tefg.onrender.com/api/v1/messages/my-messages';

  // Get user ID (works with both id and _id)
  const getUserId = () => {
    if (user?.id) return user.id;
    if (user?._id) return user._id;
    return null;
  };

  // Fetch unread message count from server with debouncing and rate limiting
  const fetchUnreadCount = useCallback(async (retryCount = 0) => {
    if (!user) return;
    
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }
    
    // Rate limiting: minimum 2 seconds between requests
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) {
      console.log('⏳ Rate limited, skipping fetch...');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, retrying in 1 second...');
        if (retryCount < 5) {
          setTimeout(() => fetchUnreadCount(retryCount + 1), 1000);
        }
        return;
      }
      
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;
      
      console.log('🔍 Fetching unread count for user:', user.email || user.name);
      console.log('📡 URL:', HARDCODED_URL);
      
      const response = await axios.get(HARDCODED_URL, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
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
      if (error.response?.status === 429) {
        console.log('Rate limit hit, will retry later');
      } else if (error.response?.status === 401 && retryCount < 3) {
        console.log('Retrying fetch due to 401...');
        setTimeout(() => fetchUnreadCount(retryCount + 1), 2000);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [user]);

  // Debounced version of fetchUnreadCount
  const debouncedFetchUnreadCount = useCallback(() => {
    if (fetchDebounceRef.current) {
      clearTimeout(fetchDebounceRef.current);
    }
    fetchDebounceRef.current = setTimeout(() => {
      fetchUnreadCount();
    }, 1000);
  }, [fetchUnreadCount]);

  // Setup WebSocket for real-time notifications
  useEffect(() => {
    const userId = getUserId();
    
    if (user && userId) {
      console.log('✅ User found, userId:', userId);
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
        console.log('🔌 Socket connected, joining user room:', userId);
        newSocket.emit('join-user', userId);
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
      
      // Poll every 5 SECONDS with debounce (increased from 3 seconds)
      const interval = setInterval(() => debouncedFetchUnreadCount(), 5000);
      
      // Also fetch when page becomes visible (user returns to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log('📱 Page became visible, fetching unread count...');
          fetchUnreadCount();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(interval);
        if (fetchDebounceRef.current) {
          clearTimeout(fetchDebounceRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (newSocket) {
          newSocket.disconnect();
          newSocket.close();
        }
      };
    } else if (user && !userId) {
      console.log('⚠️ User exists but no ID. User object:', user);
      console.log('Waiting for user ID to be available...');
    } else {
      console.log('No user logged in');
    }
  }, [user, fetchUnreadCount, debouncedFetchUnreadCount]);

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
      <nav className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xl sm:text-2xl">
              🅿️
            </motion.div>
            <span className="text-base sm:text-xl font-bold tracking-wide">SmartPark</span>
          </Link>

          {/* Desktop Navigation - Now using 'lg' instead of 'md' for better tablet support */}
          {user && (
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/search" className="hover:text-blue-200 transition text-sm xl:text-base whitespace-nowrap">Find Parking</Link>
              <Link to="/dashboard" className="hover:text-blue-200 transition text-sm xl:text-base whitespace-nowrap">Dashboard</Link>
              <Link to="/my-bookings" className="hover:text-blue-200 transition text-sm xl:text-base whitespace-nowrap">My Bookings</Link>
              
              {/* Messages with Notification Badge */}
              <Link to="/my-messages" className="hover:text-blue-200 transition relative whitespace-nowrap text-sm xl:text-base">
                Messages
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse shadow-lg ring-2 ring-white">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </Link>
              
              <Link to="/features" className="hover:text-blue-200 transition text-sm xl:text-base whitespace-nowrap">Features</Link>
              <Link to="/how-it-works" className="hover:text-blue-200 transition text-sm xl:text-base whitespace-nowrap">How It Works</Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {user ? (
              <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
                <Link to="/profile" className="flex items-center space-x-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm hidden xl:inline">{user.name}</span>
                </Link>
                {user.role === 'owner' && (
                  <Link to="/owner-dashboard" className="px-2.5 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-xs whitespace-nowrap">
                    Owner
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" className="px-2.5 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-xs whitespace-nowrap">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex space-x-2">
                <Link to="/login" className="px-3 py-1.5 text-white border-2 border-white rounded-md hover:bg-white hover:text-blue-600 transition text-sm whitespace-nowrap">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm whitespace-nowrap">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Now shows on medium screens too */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-md bg-white/10 hover:bg-white/20 transition text-base sm:text-xl"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Shows on smaller than lg */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden py-3 border-t border-white/20"
          >
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link to="/search" className="px-3 py-2 hover:bg-white/10 rounded-md text-sm" onClick={() => setMobileMenuOpen(false)}>Find Parking</Link>
                  <Link to="/dashboard" className="px-3 py-2 hover:bg-white/10 rounded-md text-sm" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/my-bookings" className="px-3 py-2 hover:bg-white/10 rounded-md text-sm" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
                  <Link to="/my-messages" className="px-3 py-2 hover:bg-white/10 rounded-md text-sm flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    Messages
                    {unreadMessageCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadMessageCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/features" className="px-3 py-2 hover:bg-white/10 rounded-md text-sm" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                  <Link to="/how-it-works" className="px-3 py-2 hover:bg-white/10 rounded-md text-sm" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                  {user.role === 'owner' && (
                    <Link to="/owner-dashboard" className="px-3 py-2 bg-orange-500 rounded-md text-sm text-center" onClick={() => setMobileMenuOpen(false)}>Owner Panel</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin-dashboard" className="px-3 py-2 bg-purple-500 rounded-md text-sm text-center" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="px-3 py-2 bg-red-500 rounded-md text-sm text-center">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 text-center border-2 border-white rounded-md text-sm" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="px-3 py-2 text-center bg-orange-500 rounded-md text-sm" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
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