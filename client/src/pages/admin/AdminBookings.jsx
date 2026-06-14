import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const AdminBookings = () => {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching bookings with token:', token ? 'Yes' : 'No');
        
        const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API Response:', response.data);
        setBookings(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <Link to="/admin-dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      
      <h1 className="text-2xl font-bold mt-4">
        {statusFilter === 'confirmed' ? 'Confirmed Bookings' : 
         statusFilter === 'pending' ? 'Pending Bookings' : 
         statusFilter === 'cancelled' ? 'Cancelled Bookings' : 'All Bookings'}
      </h1>
      
      <p className="text-gray-600 mb-4">Total: {filteredBookings.length} bookings found in database</p>
      
      {filteredBookings.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded text-center">
          No {statusFilter} bookings found in database.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Parking Slot</th>
                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Date & Time</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{booking.userId?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{booking.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="p-3">
                    <div>{booking.slotId?.title || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{booking.slotId?.location?.city || 'N/A'}</div>
                  </td>
                  <td className="p-3">{booking.vehicleNumber}</td>
                  <td className="p-3">
                    {new Date(booking.startTime).toLocaleString()}<br />
                    <span className="text-xs text-gray-400">to {new Date(booking.endTime).toLocaleString()}</span>
                  </td>
                  <td className="p-3 font-semibold text-green-600">₹{booking.totalPrice}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-gray-50 text-sm text-gray-500">
            Showing {filteredBookings.length} of {bookings.length} total bookings
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
