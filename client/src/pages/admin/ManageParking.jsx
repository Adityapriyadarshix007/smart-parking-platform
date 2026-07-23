import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSyncAlt, FaParking, FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const ManageParking = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const toastShownRef = useRef(false);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://smart-parking-backend-tefg.onrender.com/api/v1'
    : 'http://localhost:5001/api/v1';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: { address: '', city: '', state: '' },
    totalSlots: 10,
    pricing: { hourly: 30 },
    slotType: 'open',
    vehicleTypes: ['4-wheeler'],
    isActive: true
  });

  const fetchSlots = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await adminApiService.getParkingSlots();
      
      if (response && response.success) {
        const slotsData = response.data || [];
        setSlots(slotsData);
        setFilteredSlots(slotsData);
        
        if (!toastShownRef.current) {
          toast.success(`Loaded ${slotsData.length} parking slots`);
          toastShownRef.current = true;
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      if (!toastShownRef.current) {
        toast.error('Failed to load parking slots');
        toastShownRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSlots(slots);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = slots.filter(s =>
      s.title?.toLowerCase().includes(search) ||
      s.location?.city?.toLowerCase().includes(search)
    );
    setFilteredSlots(filtered);
  }, [searchTerm, slots]);

  // ✅ Add new slot
  const handleAddSlot = async () => {
    if (!formData.title || !formData.location.address || !formData.location.city) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/parking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success('Parking slot added successfully!');
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          location: { address: '', city: '', state: '' },
          totalSlots: 10,
          pricing: { hourly: 30 },
          slotType: 'open',
          vehicleTypes: ['4-wheeler'],
          isActive: true
        });
        fetchSlots();
      } else {
        toast.error(data.message || 'Failed to add parking slot');
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add parking slot');
    }
  };

  // ✅ Edit slot
  const handleEdit = (slot) => {
    setEditingSlot(slot._id);
    setFormData({
      title: slot.title || '',
      description: slot.description || '',
      location: slot.location || { address: '', city: '', state: '' },
      totalSlots: slot.totalSlots || 10,
      pricing: slot.pricing || { hourly: 30 },
      slotType: slot.slotType || 'open',
      vehicleTypes: slot.vehicleTypes || ['4-wheeler'],
      isActive: slot.isActive !== undefined ? slot.isActive : true
    });
  };

  // ✅ Save edit
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/parking/${editingSlot}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success('Parking slot updated successfully!');
        setEditingSlot(null);
        fetchSlots();
      } else {
        toast.error(data.message || 'Failed to update parking slot');
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error('Failed to update parking slot');
    }
  };

  // ✅ Delete slot
  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this parking slot? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/parking/${slotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success('Parking slot deleted successfully!');
        fetchSlots();
      } else {
        toast.error(data.message || 'Failed to delete parking slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete parking slot');
    }
  };

  // ✅ Toggle status
  const toggleStatus = async (slotId, currentStatus) => {
    try {
      const response = await adminApiService.toggleSlotStatus(slotId);
      if (response && response.success) {
        toast.success(`Parking slot ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        fetchSlots();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading parking slots...</p>
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
          <div><h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaParking /> Manage Parking Slots</h1><p className="text-blue-100 mt-1">Add, edit, and manage all parking slots</p></div>
          <div className="flex gap-3">
            <button onClick={() => setShowAddModal(true)} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all"><FaPlus /> Add Slot</button>
            <button onClick={fetchSlots} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all"><FaSyncAlt /> Refresh</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by title or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">City</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Available</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-8 text-center text-gray-500">No parking slots found</td></tr>
              ) : (
                filteredSlots.map((slot) => (
                  <tr key={slot._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium">
                      {editingSlot === slot._id ? (
                        <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="border rounded px-2 py-1 w-full" />
                      ) : (
                        slot.title || 'N/A'
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {editingSlot === slot._id ? (
                        <input type="text" value={formData.location.city} onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})} className="border rounded px-2 py-1 w-full" />
                      ) : (
                        slot.location?.city || 'N/A'
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {editingSlot === slot._id ? (
                        <input type="number" value={formData.totalSlots} onChange={(e) => setFormData({...formData, totalSlots: parseInt(e.target.value)})} className="border rounded px-2 py-1 w-16 text-center" />
                      ) : (
                        slot.totalSlots || 0
                      )}
                    </td>
                    <td className={`px-5 py-4 text-center font-semibold ${slot.availableSlots > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{slot.availableSlots || 0}</td>
                    <td className="px-5 py-4 text-center font-semibold text-emerald-600">
                      {editingSlot === slot._id ? (
                        <input type="number" value={formData.pricing.hourly} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, hourly: parseInt(e.target.value)}})} className="border rounded px-2 py-1 w-20 text-center" />
                      ) : (
                        `₹${slot.pricing?.hourly || 0}/hr`
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {editingSlot === slot._id ? (
                        <select value={formData.isActive ? 'true' : 'false'} onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})} className="border rounded px-2 py-1">
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${slot.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {slot.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {editingSlot === slot._id ? (
                          <>
                            <button onClick={handleSaveEdit} className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 flex items-center gap-1"><FaSave /> Save</button>
                            <button onClick={() => setEditingSlot(null)} className="bg-gray-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-600 flex items-center gap-1"><FaTimes /> Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(slot)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 flex items-center gap-1"><FaEdit /> Edit</button>
                            <button onClick={() => toggleStatus(slot._id, slot.isActive)} className={`px-3 py-1 rounded-lg text-xs text-white ${slot.isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                              {slot.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => handleDelete(slot._id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 flex items-center gap-1"><FaTrash /> Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">Showing {filteredSlots.length} of {slots.length} parking slots</div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FaPlus /> Add Parking Slot</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Title *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows="2" />
              <input type="text" placeholder="Address *" value={formData.location.address} onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="City *" value={formData.location.city} onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="State" value={formData.location.state} onChange={(e) => setFormData({...formData, location: {...formData.location, state: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" />
              <input type="number" placeholder="Total Slots" value={formData.totalSlots} onChange={(e) => setFormData({...formData, totalSlots: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              <input type="number" placeholder="Hourly Rate (₹)" value={formData.pricing.hourly} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, hourly: parseInt(e.target.value)}})} className="w-full px-4 py-2 border rounded-lg" />
              <select value={formData.slotType} onChange={(e) => setFormData({...formData, slotType: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="open">Open</option>
                <option value="covered">Covered</option>
                <option value="basement">Basement</option>
              </select>
              <select value={formData.isActive ? 'true' : 'false'} onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full px-4 py-2 border rounded-lg">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddSlot} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Add Slot</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParking;
