import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSyncAlt, FaParking, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const AdminSlotsPage = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toastShownRef = useRef(false);

  const fetchSlots = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Fetching parking slots...');
      const response = await adminApiService.getParkingSlots();
      console.log('📊 Slots response:', response);

      // ✅ FIX: Access data from response.data
      if (response && response.success) {
        const slotsData = response.data || [];
        console.log('📊 Slots count:', slotsData.length);
        
        setSlots(slotsData);
        setFilteredSlots(slotsData);
        
        if (!toastShownRef.current) {
          toast.success(`Loaded ${slotsData.length} parking slots`);
          toastShownRef.current = true;
        }
      } else {
        toast.error('Failed to load parking slots');
      }
    } catch (error) {
      console.error('❌ Error fetching slots:', error);
      toast.error(error.response?.data?.message || 'Failed to load parking slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

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

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSlots(slots);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = slots.filter(s =>
      s.title?.toLowerCase().includes(search) ||
      s.location?.city?.toLowerCase().includes(search) ||
      s.location?.state?.toLowerCase().includes(search)
    );
    setFilteredSlots(filtered);
  }, [searchTerm, slots]);

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
      <button 
        onClick={() => navigate('/admin-dashboard')} 
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
      >
        <FaArrowLeft className="text-sm" /> Back to Dashboard
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div><h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaParking /> Parking Slots Management</h1><p className="text-blue-100 mt-1">View, edit, and manage all parking slots across India</p></div>
          <button onClick={fetchSlots} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all"><FaSyncAlt /> Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-3xl font-extrabold text-blue-600">{slots.length}</div>
          <div className="text-gray-600 font-medium mt-1">Total Slots</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-3xl font-extrabold text-emerald-600">{slots.filter(s => s.isActive).length}</div>
          <div className="text-gray-600 font-medium mt-1">Active Slots</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-3xl font-extrabold text-red-600">{slots.filter(s => !s.isActive).length}</div>
          <div className="text-gray-600 font-medium mt-1">Inactive Slots</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by parking title or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
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
                    <td className="px-5 py-4 font-medium">{slot.title || 'N/A'}</td>
                    <td className="px-5 py-4">{slot.location?.city || 'N/A'}</td>
                    <td className="px-5 py-4 text-center">{slot.totalSlots || 0}</td>
                    <td className={`px-5 py-4 text-center font-semibold ${slot.availableSlots > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{slot.availableSlots || 0}</td>
                    <td className="px-5 py-4 text-center font-semibold text-emerald-600">₹{slot.pricing?.hourly || 0}/hr</td>
                    <td className="px-5 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${slot.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{slot.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => toggleStatus(slot._id, slot.isActive)} className={`px-3 py-1 rounded-lg text-xs text-white ${slot.isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-colors`}>
                        {slot.isActive ? <FaToggleOn className="inline mr-1" /> : <FaToggleOff className="inline mr-1" />}
                        {slot.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">Showing {filteredSlots.length} of {slots.length} parking slots</div>
      </div>
    </div>
  );
};

export default AdminSlotsPage;
