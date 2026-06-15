import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://smart-parking-backend-tefg.onrender.com/api/v1/admin/parking/all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSlots(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = slots.filter(slot =>
    slot.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">Loading slots...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link to="/admin-dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Parking Slots</h1>
          <p className="text-gray-600 mb-4">Total: {slots.length} slots</p>
          <input
            type="text"
            placeholder="Search by title or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="p-3 text-left">Title</th><th className="p-3 text-left">City</th><th className="p-3 text-left">Total Slots</th><th className="p-3 text-left">Available</th><th className="p-3 text-left">Rate</th><th className="p-3 text-left">Status</th></tr></thead>
              <tbody>
                {filteredSlots.map(slot => (
                  <tr key={slot._id} className="border-t">
                    <td className="p-3">{slot.title || 'N/A'}</td>
                    <td className="p-3">{slot.location?.city || 'N/A'}</td>
                    <td className="p-3">{slot.totalSlots || 0}</td>
                    <td className="p-3">{slot.availableSlots || 0}</td>
                    <td className="p-3">₹{slot.pricing?.hourly || 0}/hr</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${slot.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {slot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  <tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSlotsPage;
