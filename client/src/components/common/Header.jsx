import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import axios from 'axios';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('${API_BASE_URL}/api/v1/messages/my-messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Count messages that have adminReply and user hasn't read them
      const unread = response.data.data.filter(msg => msg.status === 'replied' && !msg.userRead).length;
      setUnreadMessageCount(unread);
      localStorage.setItem('unreadMessageCount', unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Listen for custom event from MyMessages page
  useEffect(() => {
    fetchUnreadCount();
    
    // Listen for unread count updates
    const handleUnreadUpdate = (event) => {
      if (event.detail && typeof event.detail.count === 'number') {
        setUnreadMessageCount(event.detail.count);
      }
    };
    
    window.addEventListener('unreadCountUpdate', handleUnreadUpdate);
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('unreadCountUpdate', handleUnreadUpdate);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always visible */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-2xl">
              🅿️
            </motion.div>
            <span className="text-xl font-bold tracking-wide">SmartPark</span>
          </Link>

          {/* Desktop Navigation - Only show when logged in */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/search" className="hover:text-blue-200 transition">Find Parking</Link>
              <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
              <Link to="/my-bookings" className="hover:text-blue-200 transition">My Bookings</Link>
              <Link to="/my-messages" className="hover:text-blue-200 transition relative">
                Messages
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadMessageCount}
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
                  <Link to="/my-messages" className="px-4 py-2 hover:bg-white/10 rounded-md relative">
                    Messages
                    {unreadMessageCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadMessageCount} new
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
                  <Link to="/features" className="px-4 py-2 hover:bg-white/10 rounded-md">Features</Link>
                  <Link to="/how-it-works" className="px-4 py-2 hover:bg-white/10 rounded-md">How It Works</Link>
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
