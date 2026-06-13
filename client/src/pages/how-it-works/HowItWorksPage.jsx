import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
  const driverSteps = [
    {
      number: '01',
      title: 'Location Discovery',
      description: 'Enter your destination or enable location services to find available parking spots in real-time.',
      icon: '📍',
      details: [
        'Real-time location tracking',
        'Smart radius filtering (1-20 km)',
        'Vehicle type optimization',
        'Price comparison tool'
      ],
      color: 'from-blue-500 to-cyan-500',
      time: '5 seconds'
    },
    {
      number: '02',
      title: 'Smart Selection',
      description: 'Compare and choose from verified parking spaces based on price, distance, and availability.',
      icon: '🔍',
      details: [
        'Instant availability check',
        'Price per hour display',
        'Distance calculation',
        'Slot type preferences'
      ],
      color: 'from-purple-500 to-pink-500',
      time: '10 seconds'
    },
    {
      number: '03',
      title: 'Secure Booking',
      description: 'Reserve your spot instantly with our one-click booking system.',
      icon: '📅',
      details: [
        'Instant confirmation',
        'Digital receipt generation',
        'Booking history tracking',
        'Easy modifications'
      ],
      color: 'from-green-500 to-emerald-500',
      time: '15 seconds'
    },
    {
      number: '04',
      title: 'Seamless Payment',
      description: 'Complete your booking with secure payment through our integrated gateway.',
      icon: '💳',
      details: [
        'Multiple payment options',
        'Secure encryption',
        'Instant verification',
        'Digital invoices'
      ],
      color: 'from-orange-500 to-red-500',
      time: '20 seconds'
    },
    {
      number: '05',
      title: 'Smart Navigation',
      description: 'Get turn-by-turn directions to your reserved parking spot.',
      icon: '🗺️',
      details: [
        'GPS navigation',
        'Live traffic updates',
        'Entry instructions',
        'Support assistance'
      ],
      color: 'from-teal-500 to-cyan-500',
      time: '2 minutes'
    },
    {
      number: '06',
      title: 'Park & Relax',
      description: 'Park with confidence knowing your spot is guaranteed and secure.',
      icon: '🚗',
      details: [
        '24/7 security',
        'CCTV surveillance',
        'Customer support',
        'Feedback system'
      ],
      color: 'from-indigo-500 to-purple-500',
      time: 'Instant'
    }
  ];

  const ownerSteps = [
    {
      number: '01',
      title: 'Quick Registration',
      description: 'Sign up as a parking owner and verify your identity in minutes.',
      icon: '📝',
      stats: 'Under 5 minutes',
      benefits: ['Simple onboarding', 'Identity verification', 'Immediate access']
    },
    {
      number: '02',
      title: 'List Your Space',
      description: 'Add your parking space details, photos, and set your pricing.',
      icon: '🏢',
      stats: '10 minutes setup',
      benefits: ['Multiple listings', 'Photo upload', 'Flexible pricing']
    },
    {
      number: '03',
      title: 'Verification Process',
      description: 'Our team verifies your listing to ensure quality and security.',
      icon: '✓',
      stats: '24-48 hours',
      benefits: ['Quality check', 'Security verification', 'Trust badge']
    },
    {
      number: '04',
      title: 'Start Earning',
      description: 'Receive bookings and earn money from your parking space.',
      icon: '💰',
      stats: 'Instant payouts',
      benefits: ['Weekly settlements', 'Revenue dashboard', 'Customer reviews']
    }
  ];

  const statistics = [
    { value: '98%', label: 'Booking Success Rate', icon: '✅' },
    { value: '<30s', label: 'Average Booking Time', icon: '⚡' },
    { value: '24/7', label: 'Customer Support', icon: '🎧' },
    { value: '100%', label: 'Secure Payments', icon: '🔒' }
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
            How SmartPark Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A seamless, end-to-end parking solution designed for modern urban mobility
          </p>
        </motion.div>

        {/* Statistics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {statistics.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* For Drivers Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">For Drivers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience hassle-free parking in six simple steps
            </p>
          </motion.div>

          <div className="space-y-6">
            {driverSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${step.color} p-4`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{step.icon}</div>
                      <div>
                        <div className="text-sm text-white/80">Step {step.number}</div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
                      {step.time}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* For Owners Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">For Parking Space Owners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Turn your unused space into a profitable business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ownerSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white text-center">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className="text-sm font-bold">Step {step.number}</div>
                  <h3 className="text-lg font-bold mt-1">{step.title}</h3>
                </div>
                <div className="p-5 text-center">
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  <div className="text-blue-600 font-bold text-sm mb-3">{step.stats}</div>
                  <div className="space-y-1">
                    {step.benefits.map((benefit, idx) => (
                      <div key={idx} className="text-xs text-gray-500">{benefit}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">Why Choose SmartPark?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold">Fast & Efficient</div>
              <div className="text-sm text-blue-100">Book parking in under 30 seconds</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <div className="font-semibold">Secure & Reliable</div>
              <div className="text-sm text-blue-100">Bank-grade security and verification</div>
            </div>
            <div>
              <div className="text-3xl mb-2">💪</div>
              <div className="font-semibold">24/7 Support</div>
              <div className="text-sm text-blue-100">Round-the-clock customer assistance</div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied users who have simplified their parking experience
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/search" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                Find Parking Now
              </Link>
              <Link to="/register" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition font-semibold">
                Register as Owner
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
