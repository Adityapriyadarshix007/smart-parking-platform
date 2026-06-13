import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageParking = () => {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    hourlyRate: 0,
    totalSlots: 0,
    address: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    fetchAllParking();
  }, []);

  const fetchAllParking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/admin/parking/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setParkingSlots(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching parking:', error);
      toast.error('Failed to load parking data');
    }
    setLoading(false);
  };

  const handleDeleteClick = (slot) => {
    setSlotToDelete(slot);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5001/api/v1/admin/parking/${slotToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Parking slot deleted successfully');
        setShowDeleteModal(false);
        setSlotToDelete(null);
        fetchAllParking();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete parking slot');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (slot) => {
    setSelectedSlot(slot);
    setEditForm({
      title: slot.title,
      hourlyRate: slot.pricing?.hourly || 0,
      totalSlots: slot.totalSlots,
      address: slot.location?.address || '',
      city: slot.location?.city || '',
      state: slot.location?.state || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5001/api/v1/admin/parking/${selectedSlot._id}`, {
        title: editForm.title,
        pricing: { hourly: editForm.hourlyRate },
        totalSlots: editForm.totalSlots,
        location: {
          ...selectedSlot.location,
          address: editForm.address,
          city: editForm.city,
          state: editForm.state
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Parking slot updated successfully');
        setShowEditModal(false);
        fetchAllParking();
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update parking slot');
    }
  };

  const toggleSlotStatus = async (slot) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5001/api/v1/admin/parking/${slot._id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAllParking();
      }
    } catch (error) {
      console.error('Status toggle error:', error);
      toast.error('Failed to update slot status');
    }
  };

  const cities = ['all', ...new Set(parkingSlots.map(slot => slot.location?.city).filter(Boolean))];

  const filteredSlots = parkingSlots.filter(slot => {
    const matchesSearch = slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          slot.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === 'all' || slot.location?.city === filterCity;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && slot.isActive) ||
                         (filterStatus === 'inactive' && !slot.isActive);
    return matchesSearch && matchesCity && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Parking Slots</h1>
          <p className="text-gray-600 mb-6">Full control over all parking locations across India</p>

          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by title or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city === 'all' ? 'All Cities' : city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
              <div className="text-sm text-gray-500 py-2">
                Total: {filteredSlots.length} slots
              </div>
            </div>
          </div>

          {/* Parking Slots Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Title</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Location</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Owner</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Slots</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Rate</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot, index) => (
                  <tr key={slot._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-800">{slot.title}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {slot.location?.city}, {slot.location?.state}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {slot.ownerId?.name || 'Unknown'}
                    </td>
                    <td className="p-3 text-sm">
                      <span className="font-medium">{slot.availableSlots}</span>
                      <span className="text-gray-400"> / {slot.totalSlots}</span>
                    </td>
                    <td className="p-3 text-sm font-semibold text-green-600">
                      ₹{slot.pricing?.hourly}/hr
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slot.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {slot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleSlotStatus(slot)}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                        >
                          {slot.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEditClick(slot)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(slot)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSlots.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🅿️</div>
              <p className="text-gray-500">No parking slots found</p>
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
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
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

      {/* Edit Modal */}
      {showEditModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Parking Slot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
                  <input
                    type="number"
                    value={editForm.totalSlots}
                    onChange={(e) => setEditForm({...editForm, totalSlots: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={editForm.hourlyRate}
                    onChange={(e) => setEditForm({...editForm, hourlyRate: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParking;
