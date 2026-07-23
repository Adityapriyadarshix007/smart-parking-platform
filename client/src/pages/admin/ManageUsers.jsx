import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSyncAlt, FaUsers, FaTrash, FaEdit, FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';
import { adminApiService } from '../../services/adminApiService';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: ''
  });
  const toastShownRef = useRef(false);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://smart-parking-backend-tefg.onrender.com/api/v1'
    : 'http://localhost:5001/api/v1';

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await adminApiService.getUsers();
      
      if (response && response.success) {
        const usersData = response.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
        
        if (!toastShownRef.current) {
          toast.success(`Loaded ${usersData.length} users`);
          toastShownRef.current = true;
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      if (!toastShownRef.current) {
        toast.error('Failed to load users');
        toastShownRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = users.filter(u =>
      u.name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.phone?.toLowerCase().includes(search) ||
      u.role?.toLowerCase().includes(search)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // ✅ Add new user
  const handleAddUser = async () => {
    if (!editForm.name || !editForm.email || !editForm.password) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          password: editForm.password,
          phone: editForm.phone || '',
          role: editForm.role
        })
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success('User added successfully!');
        setShowAddModal(false);
        setEditForm({ name: '', email: '', phone: '', role: 'user', password: '' });
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  // ✅ Edit user
  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      password: ''
    });
  };

  // ✅ Save edit
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First update role
      const roleResponse = await fetch(`${API_URL}/admin/users/${editingUser}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: editForm.role })
      });
      const roleData = await roleResponse.json();

      if (roleData && roleData.success) {
        toast.success('User updated successfully!');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(roleData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  // ✅ Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success('User deleted successfully!');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      owner: 'bg-orange-100 text-orange-700',
      user: 'bg-blue-100 text-blue-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin-dashboard')} 
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
      >
        <FaArrowLeft className="text-sm" /> Back to Dashboard
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaUsers /> Manage Users</h1>
            <p className="text-blue-100 mt-1">View and manage all platform users</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all"
            >
              <FaUserPlus /> Add User
            </button>
            <button onClick={fetchUsers} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all">
              <FaSyncAlt /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email, phone or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Verified</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-500">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium">
                      {editingUser === user._id ? (
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="border rounded px-2 py-1 w-full" />
                      ) : (
                        user.name || 'N/A'
                      )}
                    </td>
                    <td className="px-5 py-4">{user.email || 'N/A'}</td>
                    <td className="px-5 py-4">
                      {editingUser === user._id ? (
                        <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="border rounded px-2 py-1 w-full" />
                      ) : (
                        user.phone || 'N/A'
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {editingUser === user._id ? (
                        <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="border rounded px-2 py-1">
                          <option value="user">User</option>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                          {user.role?.toUpperCase() || 'USER'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isVerified ? '✅ Yes' : '❌ No'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {editingUser === user._id ? (
                          <>
                            <button onClick={handleSaveEdit} className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 flex items-center gap-1">
                              <FaSave /> Save
                            </button>
                            <button onClick={() => setEditingUser(null)} className="bg-gray-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-600 flex items-center gap-1">
                              <FaTimes /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(user)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 flex items-center gap-1">
                              <FaEdit /> Edit
                            </button>
                            <button onClick={() => handleDelete(user._id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 flex items-center gap-1">
                              <FaTrash /> Delete
                            </button>
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
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">Showing {filteredUsers.length} of {users.length} users</div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserPlus /> Add New User
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password *"
                value={editForm.password}
                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="user">User</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddUser} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Add User</button>
              <button onClick={() => { setShowAddModal(false); setEditForm({ name: '', email: '', phone: '', role: 'user', password: '' }); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
