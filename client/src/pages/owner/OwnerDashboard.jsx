import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalSlots: 0,
    totalBookings: 0,
    totalEarnings: 0,
    availableSlots: 0,
    pendingVerification: 0
  });
  
  const [newSlot, setNewSlot] = useState({
    title: '',
    description: '',
    location: {
      coordinates: null,
      address: '',
      city: '',
      state: ''
    },
    vehicleTypes: ['4-wheeler'],
    totalSlots: 5,
    slotType: 'open',
    pricing: { hourly: 30, daily: 150, monthly: 3000 }
  });

  // ✅ Helper to get slot display from snapshot or slotId
  const getSlotDisplay = (booking) => {
    // Priority 1: slotSnapshot (permanent storage from booking time)
    if (booking.slotSnapshot && booking.slotSnapshot.title) {
      return {
        title: booking.slotSnapshot.title,
        location: {
          address: booking.slotSnapshot.location?.address || 'Address not available',
          city: booking.slotSnapshot.location?.city || '',
          state: booking.slotSnapshot.location?.state || ''
        },
        isDeleted: booking.slotSnapshot.isDeleted || false,
        isFromSnapshot: true
      };
    }
    
    // Priority 2: slotId populated (if not deleted)
    if (booking.slotId && typeof booking.slotId === 'object' && booking.slotId.title) {
      return {
        title: booking.slotId.title,
        location: {
          address: booking.slotId.location?.address || 'Address not available',
          city: booking.slotId.location?.city || '',
          state: booking.slotId.location?.state || ''
        },
        isDeleted: false,
        isFromSnapshot: false
      };
    }
    
    // Priority 3: Fallback - Show meaningful message
    return {
      title: '📍 Parking Location (No Longer Available)',
      location: {
        address: 'This parking location has been removed by the owner',
        city: '',
        state: ''
      },
      isDeleted: true,
      isFromSnapshot: false
    };
  };

  // Geocode full address to get coordinates
  const geocodeAddress = async () => {
    const { address, city, state } = newSlot.location;
    const fullAddress = `${address}, ${city}, ${state}, India`;
    
    if (!address || !city || !state) {
      toast.error('Please enter address, city, and state first');
      return false;
    }
    
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1&addressdetails=1&countrycodes=in`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        setNewSlot(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [lon, lat]
          }
        }));
        toast.success('✓ Location coordinates detected!');
        return true;
      } else {
        toast.error('Could not find coordinates for this address. Please be more specific.');
        return false;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Error finding location. Please check address.');
      return false;
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [slotsRes, bookingsRes, earningsRes] = await Promise.all([
        axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/owner/my-slots', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/owner/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/owner/earnings', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setSlots(slotsRes.data.data);
      setBookings(bookingsRes.data.data);
      setEarnings(earningsRes.data.data.totalEarnings);
      
      const totalAvailable = slotsRes.data.data.reduce((sum, slot) => sum + slot.availableSlots, 0);
      const pendingCount = slotsRes.data.data.filter(slot => !slot.isVerified).length;
      
      setStats({
        totalSlots: slotsRes.data.data.length,
        totalBookings: bookingsRes.data.data.length,
        totalEarnings: earningsRes.data.data.totalEarnings,
        availableSlots: totalAvailable,
        pendingVerification: pendingCount
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    }
    setLoading(false);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    
    if (!newSlot.title || !newSlot.location.address || !newSlot.location.city || !newSlot.location.state || !newSlot.totalSlots) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Check if coordinates are detected
    if (!newSlot.location.coordinates) {
      toast.error('Please click "Detect Location" button first');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://smart-parking-backend-tefg.onrender.com/api/v1/owner/slots', newSlot, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Parking slot submitted for admin verification!');
        setShowAddForm(false);
        setNewSlot({
          title: '',
          description: '',
          location: { coordinates: null, address: '', city: '', state: '' },
          vehicleTypes: ['4-wheeler'],
          totalSlots: 5,
          slotType: 'open',
          pricing: { hourly: 30, daily: 150, monthly: 3000 }
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error(error.response?.data?.message || 'Failed to add parking slot');
    }
  };

  const confirmDelete = (slot) => {
    setSlotToDelete(slot);
    setShowDeleteModal(true);
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://smart-parking-backend-tefg.onrender.com/api/v1/owner/slots/${slotToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Parking slot deleted successfully');
      setShowDeleteModal(false);
      setSlotToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete parking slot');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white p-6 mb-8">
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="text-blue-100 mt-1">Welcome back, {user?.name}! Manage your parking slots.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSlots}</div>
            <div className="text-gray-600 text-sm">Total Slots</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalBookings}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">₹{stats.totalEarnings.toLocaleString()}</div>
            <div className="text-gray-600 text-sm">Total Earnings</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.availableSlots}</div>
            <div className="text-gray-600 text-sm">Available Spots</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</div>
            <div className="text-gray-600 text-sm">Pending Verification</div>
            {stats.pendingVerification > 0 && (
              <div className="text-xs text-yellow-500 mt-1">Awaiting Admin Approval</div>
            )}
          </div>
        </div>

        {/* Add Slot Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add New Parking Slot
          </button>
        </div>

        {/* Add Slot Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Parking Slot</h2>
            <p className="text-sm text-gray-500 mb-4">Your slot will be reviewed by admin before appearing to users.</p>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Connaught Place Parking"
                    value={newSlot.title}
                    onChange={(e) => setNewSlot({...newSlot, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    placeholder="Street address, area, landmark"
                    value={newSlot.location.address}
                    onChange={(e) => setNewSlot({...newSlot, location: {...newSlot.location, address: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    placeholder="e.g., Kolkata, Mumbai, Delhi"
                    value={newSlot.location.city}
                    onChange={(e) => setNewSlot({...newSlot, location: {...newSlot.location, city: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g., West Bengal, Maharashtra, Delhi"
                    value={newSlot.location.state}
                    onChange={(e) => setNewSlot({...newSlot, location: {...newSlot.location, state: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Slots *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newSlot.totalSlots}
                    onChange={(e) => setNewSlot({...newSlot, totalSlots: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parking Type</label>
                  <select
                    value={newSlot.slotType}
                    onChange={(e) => setNewSlot({...newSlot, slotType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="open">Open Parking</option>
                    <option value="covered">Covered Parking</option>
                    <option value="basement">Basement Parking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={newSlot.vehicleTypes[0]}
                    onChange={(e) => setNewSlot({...newSlot, vehicleTypes: [e.target.value]})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="4-wheeler">4 Wheeler (Car/SUV)</option>
                    <option value="2-wheeler">2 Wheeler (Bike/Scooter)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹) *</label>
                  <input
                    type="number"
                    min="10"
                    value={newSlot.pricing.hourly}
                    onChange={(e) => setNewSlot({...newSlot, pricing: {...newSlot.pricing, hourly: parseInt(e.target.value)}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (Optional)</label>
                  <input
                    type="number"
                    value={newSlot.pricing.daily}
                    onChange={(e) => setNewSlot({...newSlot, pricing: {...newSlot.pricing, daily: parseInt(e.target.value)}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              {/* Detect Location Button */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-gray-600">📍 Location Detection</p>
                    <p className="text-xs text-gray-500">Click the button to automatically detect coordinates from your address</p>
                  </div>
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    disabled={geocoding || !newSlot.location.address || !newSlot.location.city || !newSlot.location.state}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                  >
                    {geocoding ? 'Detecting...' : 'Detect Location'}
                  </button>
                </div>
                {newSlot.location.coordinates && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ Coordinates detected: {newSlot.location.coordinates[1]}, {newSlot.location.coordinates[0]}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe your parking facility..."
                  value={newSlot.description}
                  onChange={(e) => setNewSlot({...newSlot, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!newSlot.location.coordinates || geocoding}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  Submit for Verification
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Parking Slots */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Parking Slots</h2>
          
          {slots.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🅿️</div>
              <p className="text-gray-500">No parking slots added yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                + Add Your First Slot
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {slots.map((slot) => (
                <div key={slot._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-gray-800">{slot.title}</h3>
                        {!slot.isVerified && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">
                            Pending Verification
                          </span>
                        )}
                        {slot.isVerified && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{slot.location?.address}</p>
                      <p className="text-gray-500 text-xs mt-1">{slot.location?.city}, {slot.location?.state}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          🅿️ {slot.availableSlots}/{slot.totalSlots} available
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          ₹{slot.pricing?.hourly}/hour
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                          {slot.slotType} parking
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => confirmDelete(slot)}
                      className="text-red-500 hover:text-red-700 transition text-xl px-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-gray-500">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 10).map((booking) => {
                const slotData = getSlotDisplay(booking);
                const isDeleted = slotData.isDeleted;
                
                return (
                  <div key={booking._id} className="border-b pb-3 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-800">
                          {slotData.title}
                        </div>
                        {isDeleted && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Removed
                          </span>
                        )}
                        {slotData.isFromSnapshot && !isDeleted && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${isDeleted ? 'text-red-500' : 'text-gray-600'}`}>
                        {slotData.location.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.userId?.name || 'Unknown User'} • {booking.vehicleNumber || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₹{booking.totalPrice}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && slotToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🗑️</div>
              <h3 className="text-xl font-bold text-gray-800">Delete Parking Slot?</h3>
              <p className="text-gray-500 text-sm mt-2">
                Are you sure you want to delete "{slotToDelete.title}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteSlot}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSlotToDelete(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;