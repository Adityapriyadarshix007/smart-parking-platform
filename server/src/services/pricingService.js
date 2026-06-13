const calculatePrice = (slot, startTime, endTime) => {
  const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  const roundedHours = Math.ceil(hours);
  
  let total = 0;
  
  if (roundedHours <= 1) {
    total = slot.pricing.hourly;
  } else if (roundedHours <= 24) {
    const days = Math.floor(roundedHours / 24);
    const remainingHours = roundedHours % 24;
    total = (days * slot.pricing.daily) + (remainingHours * slot.pricing.hourly);
  } else {
    const months = Math.floor(roundedHours / (24 * 30));
    const remainingDays = Math.floor((roundedHours % (24 * 30)) / 24);
    const remainingHours = roundedHours % 24;
    total = (months * slot.pricing.monthly) + (remainingDays * slot.pricing.daily) + (remainingHours * slot.pricing.hourly);
  }
  
  return total;
};

const getPeakHourMultiplier = (date) => {
  const hour = date.getHours();
  // Peak hours: 9-11 AM and 5-7 PM
  if ((hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19)) {
    return 1.5;
  }
  return 1;
};

module.exports = { calculatePrice, getPeakHourMultiplier };
