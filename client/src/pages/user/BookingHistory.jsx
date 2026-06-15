import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Debounce and rate limiting refs
  const fetchInProgress = useRef(false);
  const lastFetchTime = useRef(0);
  const abortControllerRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCompactDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isPastBooking = (endTime) => {
    return new Date(endTime) < new Date();
  };

  const isExpired = (endTime) => {
    return new Date(endTime) < new Date();
  };

  const getDisplayStatus = (booking) => {
    if ((booking.status === 'confirmed' || booking.status === 'active') && isExpired(booking.endTime)) {
      return 'expired';
    }
    return booking.status;
  };

  // ✅ IMPROVED: Better slot data extraction with multiple fallback sources
  const getSlotDisplay = (booking) => {
    console.log('🔍 Getting slot display for booking:', booking._id);
    console.log('  - slotId type:', typeof booking.slotId);
    console.log('  - slotId value:', booking.slotId);
    console.log('  - slotSnapshot exists:', !!booking.slotSnapshot);
    console.log('  - slotDisplay exists:', !!booking.slotDisplay);
    
    // Case 1: slotSnapshot exists (permanent stored data from booking time)
    if (booking.slotSnapshot && booking.slotSnapshot.title) {
      console.log('✅ Using slotSnapshot with title:', booking.slotSnapshot.title);
      console.log('   Address:', booking.slotSnapshot.location?.address);
      return booking.slotSnapshot;
    }
    
    // Case 2: slotId is populated with full slot object
    if (booking.slotId && typeof booking.slotId === 'object') {
      if (booking.slotId.title) {
        console.log('✅ Using populated slotId with title:', booking.slotId.title);
        console.log('   Address:', booking.slotId.location?.address);
        return booking.slotId;
      }
      if (booking.slotId._id) {
        console.log('⚠️ slotId object exists but missing title, checking nested structure');
      }
    }
    
    // Case 3: slotDisplay exists (legacy field)
    if (booking.slotDisplay && booking.slotDisplay.title) {
      console.log('✅ Using slotDisplay with title:', booking.slotDisplay.title);
      return booking.slotDisplay;
    }
    
    // Case 4: slotId is a string ID (not populated) - need to fetch from cache or show loading
    if (booking.slotId && typeof booking.slotId === 'string') {
      console.log('⚠️ slotId is unpopulated string ID:', booking.slotId);
      return { 
        title: 'Loading parking info...', 
        location: { 
          address: 'Fetching slot details...', 
          city: '' 
        } 
      };
    }
    
    // Case 5: No data at all
    console.log('❌ No slot data available for booking');
    return { 
      title: 'Parking Space', 
      location: { 
        address: 'Address information not available', 
        city: '' 
      } 
    };
  };

  const isFromSnapshot = (booking) => {
    return booking.slotSnapshot && booking.slotSnapshot.title && !booking.slotId;
  };

  // Debounced fetch function with rate limiting
  const fetchBookings = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Check rate limiting (minimum 2 seconds between requests)
    const now = Date.now();
    if (now - lastFetchTime.current < 2000) {
      console.log('⏳ Rate limited: Please wait before making another request');
      toast.error('Please wait a moment before refreshing');
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (fetchInProgress.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }
    
    fetchInProgress.current = true;
    lastFetchTime.current = now;
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.id || user._id;
      
      console.log('🔍 Fetching bookings for user:', currentUserId);
      
      // Use admin endpoint (works) instead of broken user endpoint
      const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal,
        timeout: 15000 // 15 second timeout
      });
      
      console.log('✅ Admin API response:', response.status);
      
      const allBookings = response.data.data || [];
      console.log(`📊 Total bookings from admin: ${allBookings.length}`);
      
      // Log first booking structure to debug
      if (allBookings.length > 0) {
        console.log('📋 First booking structure:', {
          id: allBookings[0]._id,
          hasSlotId: !!allBookings[0].slotId,
          slotIdType: typeof allBookings[0].slotId,
          slotIdValue: allBookings[0].slotId,
          hasSlotSnapshot: !!allBookings[0].slotSnapshot,
          hasSlotDisplay: !!allBookings[0].slotDisplay,
          slotSnapshotData: allBookings[0].slotSnapshot
        });
      }
      
      // Filter bookings for current user
      const myBookings = allBookings.filter(booking => {
        const bookingUserId = booking.userId?._id || booking.userId;
        return bookingUserId === currentUserId;
      });
      
      console.log(`✅ Filtered to ${myBookings.length} bookings for current user`);
      setBookings(myBookings);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
        toast.error('Request timed out. Please try again.');
      } else if (error.response?.status === 429) {
        console.error('❌ Rate limit exceeded (429)');
        toast.error('Too many requests. Please wait a few seconds and try again.');
      } else {
        console.error('❌ Error fetching bookings:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        toast.error('Failed to load bookings');
      }
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
      abortControllerRef.current = null;
    }
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://smart-parking-backend-tefg.onrender.com/api/v1/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking cancelled successfully');
      // Wait a bit before refetching to avoid rate limit
      setTimeout(() => {
        fetchBookings();
      }, 1000);
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const downloadReceipt = (booking) => {
    const slotData = getSlotDisplay(booking);
    const receiptContent = `
========================================
          SMART PARKING RECEIPT
========================================

Receipt Number: ${booking.receiptNumber || 'N/A'}
Booking ID: ${booking._id.slice(-8).toUpperCase()}
Date: ${formatDate(booking.createdAt)}

----------------------------------------
PARKING DETAILS
----------------------------------------
Location: ${slotData.title || 'N/A'}
Address: ${slotData.location?.address || 'N/A'}
City: ${slotData.location?.city || 'N/A'}

----------------------------------------
VEHICLE DETAILS
----------------------------------------
Vehicle Number: ${booking.vehicleNumber}
Vehicle Type: ${booking.vehicleType === '4-wheeler' ? '4 Wheeler (Car/SUV)' : '2 Wheeler (Bike/Scooter)'}

----------------------------------------
TIME DETAILS
----------------------------------------
Date: ${formatCompactDate(booking.startTime)}
Start Time: ${formatTime(booking.startTime)}
End Time: ${formatTime(booking.endTime)}
Duration: ${Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hours

----------------------------------------
PAYMENT DETAILS
----------------------------------------
Total Amount: ₹${booking.totalPrice}
Payment Status: ${booking.paymentStatus?.toUpperCase() || 'PAID'}
Booking Status: ${booking.status?.toUpperCase()}

----------------------------------------
Thank you for choosing SmartPark!
----------------------------------------
For support: support@smartpark.com | +91 98765 43210
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${booking.receiptNumber || booking._id.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      expired: 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    fetchBookings();
    
    // Cleanup function to abort any ongoing request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your parking reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-4">You haven't made any parking bookings yet.</p>
            <a href="/search" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Find Parking Now
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => {
              const displayStatus = getDisplayStatus(booking);
              const slotData = getSlotDisplay(booking);
              const isSnapshot = isFromSnapshot(booking);
              
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                >
                  <div className="p-6">
                    {/* Header with Receipt and Booking IDs */}
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Receipt Number</div>
                        <div className="font-mono text-lg font-bold text-blue-600">
                          {booking.receiptNumber || `SPRK${booking._id.slice(-8).toUpperCase()}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Booking ID</div>
                        <div className="font-mono text-xs text-gray-500">{booking._id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Main Content - Parking Info and Status */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {slotData.title || 'Parking Space'}
                          </h3>
                          {isSnapshot && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              Archived
                            </span>
                          )}
                          {!slotData.title && !isSnapshot && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                              Loading...
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {slotData.location?.address || 'Address information not available'}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">{slotData.location?.city || ''}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(displayStatus)}`}>
                          {displayStatus?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid - Vehicle, Time, Amount */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vehicle</div>
                        <div className="font-semibold text-gray-800">{booking.vehicleNumber}</div>
                        <div className="text-xs text-gray-500 capitalize">{booking.vehicleType === '4-wheeler' ? 'Car/SUV' : 'Bike/Scooter'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date & Time</div>
                        <div className="font-semibold text-gray-800">{formatCompactDate(booking.startTime)}</div>
                        <div className="text-xs text-gray-500">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Amount</div>
                        <div className="text-2xl font-bold text-green-600">₹{booking.totalPrice}</div>
                        <div className="text-xs text-gray-500">Payment: {booking.paymentStatus?.toUpperCase() || 'PAID'}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      {booking.status === 'confirmed' && !isPastBooking(booking.endTime) && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                        >
                          Cancel Booking
                        </button>
                      )}
                      <button
                        onClick={() => downloadReceipt(booking)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium flex items-center gap-2"
                      >
                        📄 Download Receipt
                      </button>
                      <button
                        onClick={() => setSelectedBooking(selectedBooking === booking._id ? null : booking._id)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                      >
                        {selectedBooking === booking._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {/* Expanded Details Section */}
                    {selectedBooking === booking._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <h4 className="font-semibold text-gray-800 mb-3">Booking Details</h4>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Receipt Number:</span>{' '}
                            <span className="font-mono">{booking.receiptNumber || `SPRK${booking._id.slice(-8).toUpperCase()}`}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Booking Date:</span>{' '}
                            {formatDate(booking.createdAt)}
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>{' '}
                            {Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hours
                          </div>
                          <div>
                            <span className="text-gray-500">Payment ID:</span>{' '}
                            {booking.paymentId || 'N/A'}
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Full Address:</span>{' '}
                            {slotData.location?.address || 'Address not available'}, {slotData.location?.city || ''}
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Start Time:</span>{' '}
                            {formatDate(booking.startTime)}
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-500">End Time:</span>{' '}
                            {formatDate(booking.endTime)}
                          </div>
                        </div>
                        {isSnapshot && (
                          <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
                            ℹ️ This parking space is no longer available on the platform. This is your booking record.
                          </div>
                        )}
                        {!slotData.title && !isSnapshot && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                            ℹ️ Loading parking slot information. Please refresh if this persists.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;