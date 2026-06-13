import api from './api';

const ownerService = {
  getMySlots: async () => {
    const response = await api.get('/owner/my-slots');
    return response.data;
  },
  
  createSlot: async (slotData) => {
    const response = await api.post('/owner/slots', slotData);
    return response.data;
  },
  
  updateSlot: async (id, slotData) => {
    const response = await api.put(`/owner/slots/${id}`, slotData);
    return response.data;
  },
  
  deleteSlot: async (id) => {
    const response = await api.delete(`/owner/slots/${id}`);
    return response.data;
  },
  
  getBookings: async () => {
    const response = await api.get('/owner/bookings');
    return response.data;
  },
  
  getEarnings: async () => {
    const response = await api.get('/owner/earnings');
    return response.data;
  },
};

export default ownerService;
