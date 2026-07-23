import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSyncAlt, FaCheckCircle, FaTimes, FaParking, FaUser, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const VerifyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const toastShownRef = useRef(false);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://smart-parking-backend-tefg.onrender.com/api/v1'
    : 'http://localhost:5001/api/v1';

  const fetchListings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await adminApiService.getPendingListings();
      console.log('📊 Listings response:', response);

      if (response && response.success) {
        setListings(response.data || []);
        if (!toastShownRef.current) {
          toast.success(`Loaded ${response.data?.length || 0} pending listings`);
          toastShownRef.current = true;
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      if (!toastShownRef.current) {
        toast.error('Failed to load listings');
        toastShownRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleVerify = async (listingId) => {
    try {
      const response = await adminApiService.verifyListing(listingId);
      if (response && response.success) {
        toast.success('Listing verified successfully!');
        fetchListings();
      }
    } catch (error) {
      console.error('Error verifying listing:', error);
      toast.error('Failed to verify listing');
    }
  };

  const handleReject = async (listingId) => {
    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/reject-listing/${listingId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success('Listing rejected successfully');
        fetchListings();
      } else {
        toast.error('Failed to reject listing');
      }
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast.error('Failed to reject listing');
    }
  };

  const viewDetails = (listing) => {
    setSelectedListing(listing);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <button onClick={() => navigate('/admin-dashboard')} className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100">
        <FaArrowLeft className="text-sm" /> Back to Dashboard
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaParking /> Verify Listings</h1>
            <p className="text-blue-100 mt-1">Verify and approve pending parking listings</p>
          </div>
          <button onClick={fetchListings} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all"><FaSyncAlt /> Refresh</button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending Listings</h3>
          <p className="text-gray-500">All parking listings have been verified</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{listing.location?.address}</p>
                  <p className="text-gray-500 text-xs mt-1">{listing.location?.city}, {listing.location?.state}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">₹{listing.pricing?.hourly}/hour</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{listing.totalSlots} spots</span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs flex items-center gap-1"><FaClock className="text-xs" /> Pending</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <FaUser className="text-xs" /> {listing.ownerId?.name || 'Unknown Owner'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleVerify(listing._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                  >
                    <FaCheckCircle /> Verify
                  </button>
                  <button
                    onClick={() => handleReject(listing._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2"
                  >
                    <FaTimes /> Reject
                  </button>
                  <button
                    onClick={() => viewDetails(listing)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaParking /> Listing Details
            </h3>
            <div className="space-y-4">
              <div><label className="font-semibold">Title:</label> <span>{selectedListing.title}</span></div>
              <div><label className="font-semibold">Description:</label> <p className="text-gray-600 mt-1">{selectedListing.description || 'No description'}</p></div>
              <div><label className="font-semibold">Address:</label> <span>{selectedListing.location?.address}</span></div>
              <div><label className="font-semibold">City:</label> <span>{selectedListing.location?.city}</span></div>
              <div><label className="font-semibold">State:</label> <span>{selectedListing.location?.state}</span></div>
              <div><label className="font-semibold">Total Slots:</label> <span>{selectedListing.totalSlots}</span></div>
              <div><label className="font-semibold">Hourly Rate:</label> <span>₹{selectedListing.pricing?.hourly}</span></div>
              <div><label className="font-semibold">Slot Type:</label> <span className="capitalize">{selectedListing.slotType}</span></div>
              <div><label className="font-semibold">Vehicle Types:</label> <span>{selectedListing.vehicleTypes?.join(', ')}</span></div>
              <div className="border-t pt-4">
                <label className="font-semibold">Owner Details:</label>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><FaUser /> {selectedListing.ownerId?.name}</div>
                  <div className="flex items-center gap-2"><FaEnvelope /> {selectedListing.ownerId?.email}</div>
                  <div className="flex items-center gap-2"><FaPhone /> {selectedListing.ownerId?.phone || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowDetailsModal(false); setSelectedListing(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyListings;
