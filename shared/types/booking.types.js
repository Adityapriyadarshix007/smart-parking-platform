const BookingTypes = {
  STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded'
  }
};

module.exports = BookingTypes;
