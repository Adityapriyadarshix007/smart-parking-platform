export const calculateHours = (startTime, endTime) => {
  const diff = new Date(endTime) - new Date(startTime);
  return Math.ceil(diff / (1000 * 60 * 60));
};

export const getTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};
