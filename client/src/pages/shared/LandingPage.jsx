import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [stats, setStats] = useState({ users: 0, locations: 0, bookings: 0 });
  
  useEffect(() => {
    const animateStats = () => {
      const targets = { users: 10000, locations: 500, bookings: 50000 };
      const duration = 2000;
      const stepTime = 20;
      const steps = duration / stepTime;
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setStats({
          users: Math.min(targets.users, Math.floor(targets.users * (currentStep / steps))),
          locations: Math.min(targets.locations, Math.floor(targets.locations * (currentStep / steps))),
          bookings: Math.min(targets.bookings, Math.floor(targets.bookings * (currentStep / steps))),
        });
        if (currentStep >= steps) clearInterval(interval);
      }, stepTime);
    };
    animateStats();
  }, []);

  const features = [
    { icon: '🔍', title: 'Easy Search', desc: 'Find available parking spots near your destination with real-time availability' },
    { icon: '📅', title: 'Instant Booking', desc: 'Reserve your spot in seconds and get instant confirmation' },
    { icon: '💰', title: 'Best Prices', desc: 'Compare rates and choose the most affordable parking option' },
    { icon: '🗺️', title: 'Live Tracking', desc: 'Real-time navigation to your parking spot' },
    { icon: '🔒', title: 'Secure Payment', desc: 'Safe and secure online payments' },
    { icon: '⭐', title: '24/7 Support', desc: 'Round-the-clock customer support' },
  ];

  const steps = [
    { number: '01', title: 'Search Location', desc: 'Enter your destination or use current location', icon: '📍' },
    { number: '02', title: 'Choose & Book', desc: 'Select available slot and confirm booking', icon: '🎯' },
    { number: '03', title: 'Park & Go', desc: 'Navigate to your spot and park with ease', icon: '🚗' },
  ];

  const testimonials = [
    { name: 'Rahul Sharma', role: 'Regular User', content: 'Amazing app! Found parking near metro station in seconds. Saved so much time!', rating: 5, avatar: 'R' },
    { name: 'Priya Patel', role: 'Parking Owner', content: 'As a parking owner, I\'ve earned extra income easily. Platform is very user-friendly.', rating: 5, avatar: 'P' },
    { name: 'Amit Kumar', role: 'Business Professional', content: 'Great service! Real-time availability saved me from driving around searching for parking.', rating: 4, avatar: 'A' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Smart Parking Made
                <span className="text-blue-300 block"> Effortless</span>
              </h1>
              <p className="text-lg mb-8 text-blue-100">Find, reserve, and manage parking slots in seconds. Save time, reduce stress, and park smarter with India's leading parking platform.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-center">
                  Get Started Free
                </Link>
                <Link to="/search" className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-center">
                  Find Parking
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (<div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center"><span className="text-xs text-gray-700 font-bold">U{i}</span></div>))}
                </div>
                <div className="text-sm text-blue-100"><span className="font-bold text-white">10,000+</span> happy users</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:w-1/2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&h=400&fit=crop" alt="Parking App Demo" className="rounded-xl w-full" />
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-blue-100 text-sm">Available spots near you</p>
                      <p className="text-2xl font-bold text-white">15 parking spots</p>
                    </div>
                    <div className="bg-blue-500 px-3 py-1 rounded-full text-sm text-white animate-pulse">Live</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="stat-card">
              <div className="stat-number">{stats.locations}+</div>
              <div className="stat-label">Parking Locations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.users.toLocaleString()}+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.bookings.toLocaleString()}+</div>
              <div className="stat-label">Bookings Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose SmartPark?</h2>
            <p className="text-lg text-gray-600">Everything you need for hassle-free parking</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -5 }} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to park smartly</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.2 }} className="text-center">
                <div className="relative mb-6">
                  <div className="w-28 h-28 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Trusted by thousands of drivers daily</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="testimonial-card">
                <div className="flex text-yellow-500 mb-4">
                  {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="cta-section">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Park Smarter?</h2>
            <p className="text-lg mb-8 text-blue-100">Join thousands of users who save time and money with SmartPark</p>
            <Link to="/register" className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105">
              Sign Up Now - It's Free!
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
