import api from './api';

const adminService = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  verifyListing: async (listingId) => {
    const response = await api.put(`/admin/listings/${listingId}/verify`);
    return response.data;
  },
};

export default adminService;
