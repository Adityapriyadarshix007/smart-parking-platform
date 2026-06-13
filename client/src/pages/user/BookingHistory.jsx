import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Format date to readable format: 15 June 2024, 10:30 AM
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

  // Format date for display in compact format: 15 Jun 2024
  const formatCompactDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time only: 10:30 AM
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    }
    setLoading(false);
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/v1/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const downloadReceipt = (booking) => {
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
Location: ${booking.slotId?.title || 'N/A'}
Address: ${booking.slotId?.location?.address || 'N/A'}
City: ${booking.slotId?.location?.city || 'N/A'}

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
      expired: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
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
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="p-6">
                  {/* Receipt Number Header */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b">
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

                  {/* Main Content */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.slotId?.title}</h3>
                      <p className="text-gray-600 text-sm">{booking.slotId?.location?.address}</p>
                      <p className="text-gray-500 text-xs mt-1">{booking.slotId?.location?.city}, {booking.slotId?.location?.state}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vehicle</div>
                      <div className="font-semibold text-gray-800">{booking.vehicleNumber}</div>
                      <div className="text-xs text-gray-500 capitalize">{booking.vehicleType}</div>
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
                  <div className="flex gap-3">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                    <button
                      onClick={() => downloadReceipt(booking)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm flex items-center gap-2"
                    >
                      📄 Download Receipt
                    </button>
                    <button
                      onClick={() => setSelectedBooking(selectedBooking === booking._id ? null : booking._id)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                    >
                      {selectedBooking === booking._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {selectedBooking === booking._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t"
                    >
                      <h4 className="font-semibold text-gray-800 mb-3">Booking Details</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-500">Receipt Number:</span> <span className="font-mono">{booking.receiptNumber || `SPRK${booking._id.slice(-8).toUpperCase()}`}</span></div>
                        <div><span className="text-gray-500">Booking Date:</span> {formatDate(booking.createdAt)}</div>
                        <div><span className="text-gray-500">Duration:</span> {Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hours</div>
                        <div><span className="text-gray-500">Payment ID:</span> {booking.paymentId || 'N/A'}</div>
                        <div><span className="text-gray-500">Start Time:</span> {formatDate(booking.startTime)}</div>
                        <div><span className="text-gray-500">End Time:</span> {formatDate(booking.endTime)}</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
