import React from 'react';
import { motion } from 'framer-motion';

const Refund = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Refund Policy</h1>
            <p className="text-gray-500 text-sm mb-6">Last updated: June 1, 2024</p>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Cancellation Window</h2>
                <p className="text-gray-600">Free cancellation up to 2 hours before scheduled start time. Cancellations within 2 hours: 50% refund. No-shows: No refund.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Monthly Bookings</h2>
                <p className="text-gray-600">For monthly bookings, cancellation requires 7 days notice. Refund will be prorated for unused days minus a 10% processing fee.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Technical Issues</h2>
                <p className="text-gray-600">If technical issues prevent you from using your booking, contact us immediately for a full refund. Screenshots or error logs may be required.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Time</h2>
                <p className="text-gray-600">Refunds are processed within 5-7 business days. Time to appear in your account depends on your bank/payment provider.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">How to Request a Refund</h2>
                <p className="text-gray-600">Go to "My Bookings", select the booking, click "Request Refund", and follow instructions. You'll receive email confirmation.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Disputes</h2>
                <p className="text-gray-600">If you disagree with a refund decision, contact support within 7 days. We'll review your case within 48 hours.</p>
              </section>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-gray-700">Questions? Contact us at <a href="mailto:refunds@smartpark.com" className="text-blue-600 hover:underline">refunds@smartpark.com</a> or call <a href="tel:+919876543210" className="text-blue-600 hover:underline">+91 98765 43210</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Refund;
