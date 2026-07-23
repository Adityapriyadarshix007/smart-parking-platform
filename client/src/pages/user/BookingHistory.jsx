import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BASE_URL } from '../../config/apiConfig';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [cancelDialog, setCancelDialog] = useState({
    isOpen: false,
    bookingId: null,
    bookingTitle: '',
    reason: '',
    isProcessing: false
  });
  
  const abortControllerRef = useRef(null);

  const API_URL = `${BASE_URL}/api/v1`;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatCompactDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatDateIST = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
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

  const getSlotDisplay = (booking) => {
    if (booking.slotId && typeof booking.slotId === 'object' && booking.slotId.title) {
      return {
        title: booking.slotId.title,
        location: {
          address: booking.slotId.location?.address || 'Address not available',
          city: booking.slotId.location?.city || '',
          state: booking.slotId.location?.state || ''
        },
        pricing: booking.slotId.pricing,
        isFromSnapshot: false,
        isDeleted: false,
        slotExists: true
      };
    }
    
    if (booking.slotSnapshot && booking.slotSnapshot.title) {
      const hasValidSlotId = booking.slotId && typeof booking.slotId !== 'string';
      
      return {
        title: booking.slotSnapshot.title,
        location: {
          address: booking.slotSnapshot.location?.address || 'Address not available',
          city: booking.slotSnapshot.location?.city || '',
          state: booking.slotSnapshot.location?.state || ''
        },
        pricing: booking.slotSnapshot.pricing,
        isFromSnapshot: true,
        isDeleted: (booking.slotSnapshot.isDeleted === true) && !hasValidSlotId,
        slotExists: hasValidSlotId
      };
    }
    
    return {
      title: '📍 Parking Location (Removed)',
      location: {
        address: 'This parking location is no longer available on the platform',
        city: ''
      },
      isFromSnapshot: false,
      isDeleted: true,
      slotExists: false
    };
  };

  // ✅ Fixed: Properly handle AbortController
  const fetchBookings = useCallback(async () => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController
    abortControllerRef.current = new AbortController();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = user.role || 'user';
      
      setUserRole(role);
      console.log('🔍 Fetching bookings for user:', user.email || user.name);
      
      const endpoint = role === 'admin' 
        ? `${API_URL}/admin/bookings` 
        : `${API_URL}/bookings/my-bookings`;
      
      console.log('📡 Using endpoint:', endpoint);
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal,
        timeout: 15000
      });
      
      let myBookings = [];
      
      if (role === 'admin') {
        const allBookings = response.data.data || [];
        const currentUserId = user.id || user._id;
        myBookings = allBookings.filter(booking => {
          const bookingUserId = booking.userId?._id || booking.userId;
          return bookingUserId === currentUserId;
        });
      } else {
        myBookings = response.data.data || [];
      }
      
      console.log(`✅ Loaded ${myBookings.length} bookings`);
      setBookings(myBookings);
      
      // Show toast only once
      if (!dataLoaded && myBookings.length > 0) {
        toast.success(`Loaded ${myBookings.length} bookings`);
        setDataLoaded(true);
      } else if (!dataLoaded) {
        setDataLoaded(true);
      }
      
    } catch (error) {
      // ✅ Skip AbortError - it's just cleanup
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Request was cancelled (cleanup)');
        return;
      }
      console.error('Error fetching bookings:', error);
      if (!dataLoaded) {
        toast.error('Failed to load bookings');
        setDataLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, dataLoaded]);

  // ✅ Fixed: Cleanup on unmount
  useEffect(() => {
    fetchBookings();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBookings]);

  const openCancelDialog = (booking) => {
    const slotData = getSlotDisplay(booking);
    setCancelDialog({
      isOpen: true,
      bookingId: booking._id,
      bookingTitle: slotData.title || 'Parking Slot',
      reason: '',
      isProcessing: false
    });
  };

  const closeCancelDialog = () => {
    setCancelDialog(prev => ({ ...prev, isOpen: false, reason: '', isProcessing: false }));
  };

  const processCancellation = async () => {
    if (!cancelDialog.bookingId) return;
    
    setCancelDialog(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/bookings/${cancelDialog.bookingId}/cancel`, {
        reason: cancelDialog.reason || 'Cancelled by user'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Booking cancelled successfully!');
      closeCancelDialog();
      
      setTimeout(() => {
        fetchBookings();
      }, 1000);
      
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
      setCancelDialog(prev => ({ ...prev, isProcessing: false }));
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
Date: ${formatDateIST(booking.createdAt)}

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
TIME DETAILS (IST)
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
              const isDeleted = slotData.isDeleted;
              
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                >
                  <div className="p-6">
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

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            📍 {slotData.title || 'Parking Location'}
                          </h3>
                          {isDeleted && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              Removed
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDeleted ? 'text-red-500' : 'text-gray-600'}`}>
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

                    <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vehicle</div>
                        <div className="font-semibold text-gray-800">{booking.vehicleNumber}</div>
                        <div className="text-xs text-gray-500 capitalize">{booking.vehicleType === '4-wheeler' ? 'Car/SUV' : 'Bike/Scooter'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date & Time (IST)</div>
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

                    <div className="flex gap-3 flex-wrap">
                      {booking.status === 'confirmed' && !isPastBooking(booking.endTime) && (
                        <button
                          onClick={() => openCancelDialog(booking)}
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
                            <span className="text-gray-500">Booking Date (IST):</span>{' '}
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
                            <span className="text-gray-500">Start Time (IST):</span>{' '}
                            {formatDate(booking.startTime)}
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-500">End Time (IST):</span>{' '}
                            {formatDate(booking.endTime)}
                          </div>
                        </div>
                        {isDeleted && (
                          <div className="mt-3 p-2 bg-red-50 rounded-lg text-xs text-red-700">
                            ⚠️ This parking location has been removed from the platform. This is your permanent booking record.
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

      <AnimatePresence>
        {cancelDialog.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-5 rounded-t-xl">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>⚠️</span> Cancel Booking
                </h3>
                <p className="text-sm text-red-100 mt-1">{cancelDialog.bookingTitle}</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                    <span>❗</span> Are you sure you want to cancel this booking?
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    This action cannot be undone. Cancelled bookings are non-refundable as per our policy.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    value={cancelDialog.reason}
                    onChange={(e) => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Tell us why you're cancelling..."
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={processCancellation}
                    disabled={cancelDialog.isProcessing}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {cancelDialog.isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      'Yes, Cancel Booking'
                    )}
                  </button>
                  <button
                    onClick={closeCancelDialog}
                    disabled={cancelDialog.isProcessing}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    No, Keep It
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingHistory;
