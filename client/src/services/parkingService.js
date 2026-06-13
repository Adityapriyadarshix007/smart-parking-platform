import api from './api';

const parkingService = {
  getNearby: async (lat, lng, radius = 3, vehicleType = null) => {
    const params = { lat, lng, radius };
    if (vehicleType) params.vehicleType = vehicleType;
    const response = await api.get('/parking/nearby', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/parking/${id}`);
    return response.data;
  },
  
  create: async (slotData) => {
    const response = await api.post('/parking', slotData);
    return response.data;
  },
  
  checkAvailability: async (slotId, startTime, endTime) => {
    const response = await api.get('/parking/availability', {
      params: { slotId, startTime, endTime }
    });
    return response.data;
  },
};

export default parkingService;
