export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const VEHICLE_TYPES = {
  TWO_WHEELER: '2-wheeler',
  FOUR_WHEELER: '4-wheeler',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const USER_ROLES = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin',
};
