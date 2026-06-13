import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const features = [
    { icon: '🔍', title: 'Smart Search', desc: 'Find parking spots in seconds using our intelligent location-based search' },
    { icon: '📅', title: 'Instant Booking', desc: 'Reserve your parking spot instantly with real-time availability' },
    { icon: '💳', title: 'Secure Payments', desc: 'Pay securely through our integrated Razorpay payment gateway' },
    { icon: '🗺️', title: 'Live Tracking', desc: 'Navigate to your parking spot with integrated maps' },
    { icon: '🔔', title: 'Smart Reminders', desc: 'Get timely notifications about your upcoming bookings' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your parking history and earnings as an owner' }
  ];

  const stats = [
    { value: '500+', label: 'Parking Locations', icon: '📍' },
    { value: '50K+', label: 'Happy Users', icon: '👥' },
    { value: '10K+', label: 'Daily Bookings', icon: '📅' },
    { value: '98%', label: 'Satisfaction Rate', icon: '⭐' }
  ];

  const team = [
    { role: 'Innovation', desc: 'Cutting-edge technology for seamless parking experience' },
    { role: 'Reliability', desc: '24/7 support and guaranteed parking availability' },
    { role: 'Affordability', desc: 'Best prices with transparent pricing' },
    { role: 'Sustainability', desc: 'Reducing traffic congestion and carbon footprint' }
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white p-8 mb-8 text-center shadow-xl">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-5xl mb-4 shadow-lg"
            >
              🅿️
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">SmartPark</h1>
            <p className="text-xl mb-2 text-blue-100">India's Leading Smart Parking Platform</p>
            <p className="text-blue-200 max-w-2xl mx-auto">Revolutionizing urban parking with technology, making parking effortless and accessible for everyone.</p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-3">🎯 Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize urban mobility by making parking effortless, efficient, and accessible for everyone, 
                while reducing traffic congestion and carbon emissions across Indian cities. We aim to transform 
                the way people find and book parking spaces through innovative technology.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-3">👁️ Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A future where finding parking takes seconds, not minutes, creating smarter and more sustainable cities 
                where every parking space is utilized optimally. We envision a India where parking stress becomes a thing of the past.
              </p>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-center text-white">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs mt-1 opacity-90">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Features Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">✨ What Makes SmartPark Special</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 text-center hover:shadow-md transition"
                >
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <div className="font-semibold text-gray-800 mb-1">{feature.title}</div>
                  <div className="text-sm text-gray-600">{feature.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔄 How SmartPark Works</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2">📍</div>
                <h3 className="font-semibold text-gray-800">1. Search</h3>
                <p className="text-xs text-gray-500">Enter location or use GPS</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2">🔍</div>
                <h3 className="font-semibold text-gray-800">2. Select</h3>
                <p className="text-xs text-gray-500">Choose from available slots</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2">💳</div>
                <h3 className="font-semibold text-gray-800">3. Pay</h3>
                <p className="text-xs text-gray-500">Secure online payment</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2">🚗</div>
                <h3 className="font-semibold text-gray-800">4. Park</h3>
                <p className="text-xs text-gray-500">Navigate & park with ease</p>
              </div>
            </div>
          </motion.div>

          {/* Core Values */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">💎 Our Core Values</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {team.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="font-semibold text-blue-600 mb-1">{item.role}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Innovation Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🚀 The Innovation Behind SmartPark</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-3">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-gray-800">AI-Powered Search</h3>
                <p className="text-sm text-gray-600">Smart algorithms find the best parking spots near you</p>
              </div>
              <div className="text-center p-3">
                <div className="text-3xl mb-2">🗺️</div>
                <h3 className="font-semibold text-gray-800">Real-Time Maps</h3>
                <p className="text-sm text-gray-600">Live tracking and navigation to your parking spot</p>
              </div>
              <div className="text-center p-3">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-800">Secure Platform</h3>
                <p className="text-sm text-gray-600">Bank-grade security for all transactions</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">🚀 Ready to Experience Smart Parking?</h2>
            <p className="mb-5 text-blue-100 max-w-md mx-auto">Join thousands of users who have made parking effortless with SmartPark</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link 
                to="/search" 
                className="px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                🔍 Find Parking Now
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium"
              >
                📝 Register as Owner
              </Link>
              <Link 
                to="/contact" 
                className="px-6 py-2.5 border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium"
              >
                📞 Contact Support
              </Link>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-400 text-sm text-blue-200">
              <p>© 2026 SmartPark | Making parking smarter, one city at a time</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
