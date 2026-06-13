import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VerifyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/admin/pending-listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(response.data.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load pending listings');
    }
    setLoading(false);
  };

  const handleVerify = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://smart-parking-backend-tefg.onrender.com/api/v1/admin/listings/${listingId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Listing verified! It will now appear to users.');
      fetchListings();
    } catch (error) {
      toast.error('Failed to verify listing');
    }
  };

  const handleReject = async (listingId) => {
    if (!window.confirm('Reject this listing? This will delete it permanently.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://smart-parking-backend-tefg.onrender.com/api/v1/admin/listings/${listingId}/reject`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Listing rejected and removed');
      fetchListings();
    } catch (error) {
      toast.error('Failed to reject listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Parking Listings</h1>
          <p className="text-gray-600 mb-6">Review and approve pending parking slot listings submitted by owners</p>
          
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-gray-800">No Pending Listings</h3>
              <p className="text-gray-500 mt-1">All parking listings have been verified</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-5 hover:shadow-md transition bg-yellow-50 border-yellow-300"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{listing.title}</h3>
                        <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs">Pending</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{listing.description}</p>
                      <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">📍 Address:</span>
                          <p className="text-gray-800">{listing.location?.address}</p>
                          <span className="text-gray-500">🏙️ City:</span>
                          <p className="text-gray-800">{listing.location?.city}, {listing.location?.state}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">👤 Owner:</span>
                          <p className="text-gray-800">{listing.ownerId?.name}</p>
                          <span className="text-gray-500">📧 Email:</span>
                          <p className="text-gray-800">{listing.ownerId?.email}</p>
                          <span className="text-gray-500">📞 Phone:</span>
                          <p className="text-gray-800">{listing.ownerId?.phone}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          🅿️ {listing.totalSlots} Slots
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          💰 ₹{listing.pricing?.hourly}/hour
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {listing.slotType} Parking
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(listing._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        ✅ Approve & Publish
                      </button>
                      <button
                        onClick={() => handleReject(listing._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyListings;
