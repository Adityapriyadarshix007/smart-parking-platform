import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    memberSince: ''
  });

  // Validate phone number
  const validatePhone = (phone) => {
    const cleanNumber = phone.replace(/\D/g, '');
    
    if (!cleanNumber) return true;
    
    if (cleanNumber.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    
    const invalidPatterns = [
      '1111111111', '2222222222', '3333333333', '4444444444', '5555555555',
      '6666666666', '7777777777', '8888888888', '9999999999', '0000000000',
      '1234567890', '9876543210'
    ];
    
    if (invalidPatterns.includes(cleanNumber)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    
    const validPattern = /^[6-9]\d{9}$/;
    if (!validPattern.test(cleanNumber)) {
      setPhoneError('Mobile number must start with 6, 7, 8, or 9');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '2024';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      };
      setFormData(userData);
      setOriginalData(userData);
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('${API_BASE_URL}/api/v1/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookings = response.data.data;
      const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
      
      setStats({
        totalBookings: bookings.length,
        totalSpent: totalSpent,
        memberSince: user?.createdAt ? formatDate(user.createdAt) : '2024'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'phone') {
      validatePhone(value);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setPhoneError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error(phoneError);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('${API_BASE_URL}/api/v1/auth/profile', 
        { name: formData.name, phone: formData.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setOriginalData(formData);
        setIsEditing(false);
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.name = formData.name;
        storedUser.phone = formData.phone;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return '👤';
  };

  const getAccountTypeBadge = () => {
    if (user?.role === 'admin') {
      return 'bg-purple-100 text-purple-700';
    } else if (user?.role === 'owner') {
      return 'bg-orange-100 text-orange-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  const getAccountTypeName = () => {
    if (user?.role === 'admin') {
      return 'ADMINISTRATOR';
    } else if (user?.role === 'owner') {
      return 'PARKING OWNER';
    }
    return 'REGULAR USER';
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white p-8 mb-8 text-center"
          >
            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center text-4xl mb-4 font-bold">
              {getUserInitial()}
            </div>
            <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
            <p className="text-blue-100 mt-1">{user?.email || ''}</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
              <div className="text-gray-600 text-sm">Total Bookings</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-green-600">₹{stats.totalSpent.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Total Spent</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-orange-600">Member</div>
              <div className="text-gray-600 text-sm">Since {stats.memberSince}</div>
            </motion.div>
          </div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter 10-digit mobile number"
                />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                <p className="text-xs text-gray-500 mt-1">Enter valid Indian mobile number (starts with 6,7,8,9)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeBadge()}`}>
                    {getAccountTypeName()}
                  </span>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        💾 Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-500 text-white py-2.5 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {!isEditing && (
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
