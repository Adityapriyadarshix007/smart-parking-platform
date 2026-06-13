import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  const heroFeatures = [
    {
      icon: '🎯',
      title: 'Smart Parking Intelligence',
      description: 'AI-powered parking discovery that learns your preferences and predicts available spots before you arrive.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⚡',
      title: 'Instant Booking System',
      description: 'Reserve your parking spot in under 30 seconds with our streamlined one-click booking process.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🔒',
      title: 'Enterprise-Grade Security',
      description: 'Bank-level encryption and secure payment processing with PCI-DSS compliance.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const coreFeatures = [
    {
      icon: '🗺️',
      title: 'Real-Time Location Intelligence',
      description: 'Leverage advanced geospatial technology to find the nearest available parking spots instantly.',
      benefits: ['Live availability tracking', 'Smart radius filtering', 'Predictive parking suggestions'],
      color: 'bg-blue-500'
    },
    {
      icon: '💳',
      title: 'Seamless Payment Integration',
      description: 'Multiple payment options with instant confirmation and digital receipts for every transaction.',
      benefits: ['Razorpay integration', 'Multiple payment methods', 'Instant digital receipts'],
      color: 'bg-green-500'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics Dashboard',
      description: 'Gain valuable insights into your parking patterns and optimize your parking strategy.',
      benefits: ['Booking history', 'Spending analytics', 'Usage patterns'],
      color: 'bg-purple-500'
    },
    {
      icon: '🔔',
      title: 'Smart Notification System',
      description: 'Stay informed with real-time alerts about your bookings, reminders, and special offers.',
      benefits: ['Booking confirmations', 'Time reminders', 'Exclusive deals'],
      color: 'bg-orange-500'
    },
    {
      icon: '👥',
      title: 'Multi-User Support',
      description: 'Manage multiple vehicles and family members under a single account with ease.',
      benefits: ['Multiple vehicles', 'Family accounts', 'Usage tracking'],
      color: 'bg-indigo-500'
    },
    {
      icon: '📱',
      title: 'Cross-Platform Accessibility',
      description: 'Access your parking bookings seamlessly across all devices with our responsive platform.',
      benefits: ['Mobile responsive', 'Desktop optimized', 'Tablet friendly'],
      color: 'bg-teal-500'
    }
  ];

  const ownerFeatures = [
    {
      icon: '🏢',
      title: 'Monetize Your Space',
      description: 'Transform unused parking spaces into a steady revenue stream.',
      stats: 'Earn up to ₹50,000/month',
      benefits: ['Zero setup cost', 'Flexible pricing', 'Instant payouts']
    },
    {
      icon: '📈',
      title: 'Dynamic Pricing Engine',
      description: 'Optimize your earnings with AI-driven pricing recommendations based on demand.',
      stats: 'Increase revenue by 40%',
      benefits: ['Demand-based pricing', 'Peak hour optimization', 'Competitive analysis']
    },
    {
      icon: '🤝',
      title: 'Verified Customer Base',
      description: 'Connect with thousands of verified drivers looking for reliable parking.',
      stats: '50,000+ active users',
      benefits: ['User verification', 'Rating system', 'Secure transactions']
    },
    {
      icon: '📊',
      title: 'Owner Dashboard',
      description: 'Comprehensive analytics and management tools for your parking business.',
      stats: 'Real-time insights',
      benefits: ['Occupancy tracking', 'Revenue reports', 'Customer feedback']
    }
  ];

  const technologyStack = [
    { name: 'React.js', icon: '⚛️', desc: 'Modern frontend framework' },
    { name: 'Node.js', icon: '🚀', desc: 'Scalable backend' },
    { name: 'MongoDB', icon: '🍃', desc: 'Cloud database' },
    { name: 'Razorpay', icon: '💳', desc: 'Secure payments' },
    { name: 'Leaflet', icon: '🗺️', desc: 'Interactive maps' },
    { name: 'Socket.io', icon: '🔌', desc: 'Real-time updates' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Enterprise-Grade Parking Solution
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming urban mobility with cutting-edge technology and seamless parking experiences
          </p>
        </motion.div>

        {/* Hero Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {heroFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-20 h-20 mx-auto bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Core Features Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Powerful Core Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for a seamless parking experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className={`${feature.color} p-4 text-white`}>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Owner Features */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">For Parking Space Owners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Maximize your property's potential with our comprehensive owner tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ownerFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 text-center border border-gray-100"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <div className="text-blue-600 font-bold text-sm mb-3">{feature.stats}</div>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <div className="space-y-1">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="text-xs text-gray-500">{benefit}</div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Powered By Modern Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologyStack.map((tech, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="font-semibold text-gray-800 text-sm">{tech.name}</div>
                <div className="text-xs text-gray-500">{tech.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-10 text-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Parking Experience?</h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied users who have made parking effortless with SmartPark
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/search" className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold">
              Find Parking Now
            </Link>
            <Link to="/register" className="px-6 py-3 border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold">
              List Your Space
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesPage;
