import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        return;
      }
      
      const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/admin/parking/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSlots(response.data.data || []);
      } else {
        toast.error('Failed to load slots');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error(error.response?.data?.message || 'Failed to load parking slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const filteredSlots = slots.filter(slot =>
    slot.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading parking slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Link to="/admin-dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Parking Slots</h1>
          <p className="text-gray-600 mb-4">Total: {slots.length} slots across India</p>
          
          <input
            type="text"
            placeholder="Search by title or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          
          {filteredSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No parking slots found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Title</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">City</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Total Slots</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Available</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Hourly Rate</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map(slot => (
                    <tr key={slot._id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm">{slot.title || 'N/A'}</td>
                      <td className="p-3 text-sm">{slot.location?.city || 'N/A'}</td>
                      <td className="p-3 text-sm">{slot.totalSlots || 0}</td>
                      <td className="p-3 text-sm">{slot.availableSlots || 0}</td>
                      <td className="p-3 text-sm">₹{slot.pricing?.hourly || 0}/hr</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${slot.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {slot.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSlotsPage;
