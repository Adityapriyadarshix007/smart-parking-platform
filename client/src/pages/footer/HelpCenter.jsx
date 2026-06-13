import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs = [
    { category: 'booking', question: 'How do I book a parking slot?', answer: 'Search for your location using the map, select an available parking slot, choose your preferred time slot, and confirm your booking. You\'ll receive an instant confirmation via email and SMS.' },
    { category: 'booking', question: 'Can I modify my booking after confirmation?', answer: 'Yes, you can modify your booking up to 2 hours before the start time. Log into your account, go to "My Bookings", select the booking, and click "Modify".' },
    { category: 'payment', question: 'What payment methods are accepted?', answer: 'We accept all major credit/debit cards (Visa, MasterCard, RuPay), UPI (Google Pay, PhonePe, Paytm), NetBanking (all major banks), and digital wallets.' },
    { category: 'payment', question: 'Is it safe to save my card details?', answer: 'Yes, we use industry-standard encryption and PCI-DSS compliant payment gateways. Your card details are tokenized and never stored on our servers.' },
    { category: 'cancellation', question: 'What is your cancellation policy?', answer: 'Free cancellation up to 2 hours before booking start time. Cancellations within 2 hours: 50% refund. No-shows: No refund. For monthly bookings, cancellation requires 7 days notice.' },
    { category: 'cancellation', question: 'How long do refunds take?', answer: 'Refunds are processed within 5-7 business days. The time to reflect in your account depends on your bank/payment provider.' },
    { category: 'account', question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page, enter your registered email, and follow the instructions in the reset link sent to your inbox.' },
    { category: 'account', question: 'How do I delete my account?', answer: 'Contact our support team at support@smartpark.com with your account details, and we will assist you with account deletion within 48 hours.' }
  ];

  const categories = ['all', 'booking', 'payment', 'cancellation', 'account'];
  const filteredFaqs = activeCategory === 'all' ? faqs : faqs.filter(f => f.category === activeCategory);
  const searchedFaqs = searchQuery ? filteredFaqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase())) : filteredFaqs;

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Help Center</h1>
            <p className="text-lg text-gray-600">How can we help you today?</p>
          </div>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full capitalize transition ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            {searchedFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
            {searchedFaqs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No results found. Try a different search term or <Link to="/contact" className="text-blue-600 hover:underline">contact our support team</Link>.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700">Still need help? <Link to="/contact" className="text-blue-600 font-semibold hover:underline">Contact our 24/7 support team</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;
