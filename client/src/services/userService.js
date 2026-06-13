import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
  
  addVehicle: async (vehicleData) => {
    const response = await api.post('/user/vehicles', vehicleData);
    return response.data;
  },
  
  getVehicles: async () => {
    const response = await api.get('/user/vehicles');
    return response.data;
  },
};

export default userService;
