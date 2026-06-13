import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post('http://localhost:5001/api/v1/messages/contact', formData, { headers });
      
      if (response.data.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // If user is logged in, redirect to messages page
        if (token) {
          setTimeout(() => navigate('/my-messages'), 1500);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
              <p className="text-gray-600 mb-6">Have questions? We'd love to hear from you.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How can we help?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Get in Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <div className="font-semibold text-gray-800">Address</div>
                      <div className="text-gray-600">SmartPark Headquarters<br />DLF Cyber City, Gurugram<br />Haryana, India - 122002</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="font-semibold text-gray-800">Phone</div>
                      <div className="text-gray-600">+91 98765 43210 (24/7 Support)<br />+91 98765 43211 (Business)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <div className="font-semibold text-gray-800">Email</div>
                      <div className="text-gray-600">support@smartpark.com<br />business@smartpark.com</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 md:p-8 text-white text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2">Business Hours</h3>
                <p className="mb-4">Monday - Friday: 9:00 AM - 8:00 PM<br />Saturday: 10:00 AM - 6:00 PM<br />Sunday: Closed</p>
                <p className="text-sm opacity-90">✨ 24/7 Emergency Support Available</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
