import api from './api';

const bookingService = {
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export default bookingService;
