import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AddressSearch from '../../components/address/AddressSearch';
import PhoneVerificationModal from '../../components/common/PhoneVerificationModal';
import BlinkingMarker from '../../components/map/BlinkingMarker';
import MapController from '../../components/map/MapController';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SearchParking = () => {
  const [searchParams, setSearchParams] = useState({ 
    radius: 10, 
    vehicleType: 'all',
    page: 1
  });
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    startTime: '',
    endTime: '',
    vehicleNumber: '',
    vehicleType: '4-wheeler'
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [mapReady, setMapReady] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const addressSearchRef = useRef(null);
  const navigate = useNavigate();
  
  // Debounce timer refs
  const radiusDebounceRef = useRef(null);
  const vehicleTypeDebounceRef = useRef(null);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const hasPhoneNumber = () => {
    const user = getUser();
    return user && user.phone && user.phone !== '0000000000' && user.phone.length >= 10;
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat}, ${lng}`;
    }
  };

  const getUserLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter([location.lat, location.lng]);
          setMapZoom(12);
          
          const address = await getAddressFromCoordinates(location.lat, location.lng);
          setManualAddress(address);
          
          if (addressSearchRef.current) {
            addressSearchRef.current.setInputValue(address);
          }
          
          await searchParking(location.lat, location.lng);
          setHasSearched(true);
          setIsLocating(false);
          toast.success('📍 Location detected! Showing parking near you.');
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get your location. ';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage += 'Please allow location access.';
          } else {
            errorMessage += 'Please search manually using the address bar.';
          }
          setLocationError(errorMessage);
          setIsLocating(false);
          toast.error(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation not supported. Please search manually using the address bar.');
      setIsLocating(false);
    }
  };

  const searchWithAddress = async (location) => {
    setUserLocation({ lat: location.lat, lng: location.lng });
    setManualAddress(location.address);
    setMapCenter([location.lat, location.lng]);
    setMapZoom(12);
    await searchParking(location.lat, location.lng);
    setHasSearched(true);
    setLocationError(null);
    toast.success(`📍 Showing parking near: ${location.address.substring(0, 50)}...`);
  };

  const searchParking = async (lat, lng) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = 'https://smart-parking-backend-tefg.onrender.com/api/v1/parking/nearby';
      const params = {
        lat,
        lng,
        radius: searchParams.radius,
        page: searchParams.page,
        limit: 50
      };
      
      if (searchParams.vehicleType && searchParams.vehicleType !== 'all') {
        params.vehicleType = searchParams.vehicleType;
      }
      
      const response = await axios.get(url, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setParkingSlots(response.data.data);
        
        if (response.data.data.length > 0) {
          const bounds = [[lat, lng]];
          response.data.data.forEach(slot => {
            if (slot.location && slot.location.coordinates) {
              bounds.push([slot.location.coordinates[1], slot.location.coordinates[0]]);
            }
          });
          
          if (bounds.length > 1) {
            const lats = bounds.map(b => b[0]);
            const lngs = bounds.map(b => b[1]);
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
            setMapCenter([centerLat, centerLng]);
            
            let zoom = 11;
            const maxLatDiff = Math.max(...lats) - Math.min(...lats);
            const maxLngDiff = Math.max(...lngs) - Math.min(...lngs);
            const maxDiff = Math.max(maxLatDiff, maxLngDiff);
            if (maxDiff < 0.1) zoom = 14;
            else if (maxDiff < 0.5) zoom = 13;
            else if (maxDiff < 1) zoom = 12;
            else if (maxDiff < 2) zoom = 11;
            else zoom = 10;
            setMapZoom(zoom);
          }
        } else {
          toast.info('No parking slots found in this area. Try a different location or increase radius.');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching parking slots');
      setParkingSlots([]);
    }
    setLoading(false);
  };

  // Debounced radius change handler
  const handleRadiusChange = (newRadius) => {
    setSearchParams(prev => ({ ...prev, radius: newRadius, page: 1 }));
    
    if (radiusDebounceRef.current) {
      clearTimeout(radiusDebounceRef.current);
    }
    
    radiusDebounceRef.current = setTimeout(() => {
      if (userLocation && hasSearched) {
        searchParking(userLocation.lat, userLocation.lng);
      }
    }, 500);
  };

  // Debounced vehicle type change handler
  const handleVehicleTypeChange = (type) => {
    setSearchParams(prev => ({ ...prev, vehicleType: type, page: 1 }));
    
    if (vehicleTypeDebounceRef.current) {
      clearTimeout(vehicleTypeDebounceRef.current);
    }
    
    vehicleTypeDebounceRef.current = setTimeout(() => {
      if (userLocation && hasSearched) {
        searchParking(userLocation.lat, userLocation.lng);
      }
    }, 500);
  };

  // Calculate total price helper
  const calculateTotalPrice = (slot, startTime, endTime) => {
    if (!slot || !startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const hourlyRate = slot.pricing?.hourly || 30;
    return diffHours * hourlyRate;
  };

  // Check availability before booking
  const checkAvailability = async (slotId, startTime, endTime) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://smart-parking-backend-tefg.onrender.com/api/v1/bookings/check-availability', {
        slotId,
        startTime,
        endTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Availability check error:', error);
      return { available: false, message: 'Could not check availability' };
    }
  };

  // Function to update a single slot's available count locally
  const updateSlotAvailability = (slotId, newAvailableCount) => {
    setParkingSlots(prevSlots => 
      prevSlots.map(slot => 
        slot._id === slotId 
          ? { ...slot, availableSlots: newAvailableCount }
          : slot
      )
    );
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (booking) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway. Please refresh and try again.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const orderResponse = await axios.post('https://smart-parking-backend-tefg.onrender.com/api/v1/payments/create-order', {
        amount: booking.totalPrice,
        currency: 'INR',
        receipt: `booking_${booking._id}`
      }, { headers: { Authorization: `Bearer ${token}` } });

      const { order } = orderResponse.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SmartPark',
        description: `Parking Booking - ${selectedSlot.title}`,
        order_id: order.id,
        handler: async (response) => {
          const verifyResponse = await axios.post('https://smart-parking-backend-tefg.onrender.com/api/v1/payments/verify-payment', {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId: booking._id
          }, { headers: { Authorization: `Bearer ${token}` } });

          if (verifyResponse.data.success) {
            // ✅ FIXED: Send paymentId and orderId to confirmBooking
            await axios.put('https://smart-parking-backend-tefg.onrender.com/api/v1/bookings/confirm', {
              bookingId: booking._id,
              paymentId: response.razorpay_payment_id,  // ✅ Add this
              orderId: response.razorpay_order_id       // ✅ Add this
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success('Payment successful! Booking confirmed.');
            navigate('/my-bookings');
          } else {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || 'Customer',
          email: localStorage.getItem('userEmail') || 'customer@example.com'
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  // FIXED: Added totalPrice and availability check to the booking request
  const handleBooking = async () => {
    if (!hasPhoneNumber()) {
      setShowBookingModal(false);
      setShowPhoneModal(true);
      return;
    }

    if (!bookingDetails.vehicleNumber.trim()) {
      toast.error('Please enter vehicle number');
      return;
    }
    
    if (!bookingDetails.startTime || !bookingDetails.endTime) {
      toast.error('Please select start and end time');
      return;
    }
    
    const start = new Date(bookingDetails.startTime);
    const end = new Date(bookingDetails.endTime);
    
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }
    
    if (start < new Date()) {
      toast.error('Start time cannot be in the past');
      return;
    }
    
    setBookingLoading(true);
    
    // Check availability first
    toast.loading('Checking availability...', { id: 'availabilityCheck' });
    
    const availability = await checkAvailability(selectedSlot._id, bookingDetails.startTime, bookingDetails.endTime);
    
    toast.dismiss('availabilityCheck');
    
    if (!availability.available) {
      toast.error(availability.message || 'This time slot is no longer available. Please choose a different time.');
      setBookingLoading(false);
      return;
    }
    
    if (availability.availableSlots !== undefined && availability.availableSlots <= 0) {
      toast.error('No parking spots available at this location. Please try another location.');
      setBookingLoading(false);
      return;
    }
    
    // Calculate total price
    const totalPrice = calculateTotalPrice(selectedSlot, bookingDetails.startTime, bookingDetails.endTime);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('https://smart-parking-backend-tefg.onrender.com/api/v1/bookings', {
        slotId: selectedSlot._id,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        vehicleNumber: bookingDetails.vehicleNumber.toUpperCase(),
        vehicleType: bookingDetails.vehicleType,
        totalPrice: totalPrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const booking = response.data.data;
        
        // Update the slot's available count locally (decrease by 1)
        updateSlotAvailability(selectedSlot._id, selectedSlot.availableSlots - 1);
        
        // Also update the selectedSlot state
        setSelectedSlot(prev => ({ ...prev, availableSlots: prev.availableSlots - 1 }));
        
        setShowBookingModal(false);
        toast.success('Booking created! Proceeding to payment...');
        await handlePayment(booking);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePhoneVerified = (phone) => {
    toast.success('Phone number saved! You can now book parking.');
    if (selectedSlot) {
      setShowBookingModal(true);
    }
  };

  const getBookingSummary = () => {
    if (!selectedSlot || !bookingDetails.startTime || !bookingDetails.endTime) {
      return { hours: 0, price: 0 };
    }
    const start = new Date(bookingDetails.startTime);
    const end = new Date(bookingDetails.endTime);
    const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const price = hours * (selectedSlot.pricing?.hourly || 30);
    return { hours, price };
  };

  const openBookingModal = (slot) => {
    // Check if slot has available spots before opening modal
    if (slot.availableSlots <= 0) {
      toast.error('No parking spots available at this location');
      return;
    }
    
    if (!hasPhoneNumber()) {
      setSelectedSlot(slot);
      setShowPhoneModal(true);
      return;
    }
    
    setSelectedSlot(slot);
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    
    setBookingDetails({
      startTime: formatForInput(start),
      endTime: formatForInput(end),
      vehicleNumber: '',
      vehicleType: '4-wheeler'
    });
    setShowBookingModal(true);
  };

  const user = getUser();
  const bookingSummary = getBookingSummary();
  
  const markerPositions = parkingSlots
    .filter(slot => slot.location && slot.location.coordinates)
    .map(slot => [slot.location.coordinates[1], slot.location.coordinates[0]]);

  // Cleanup debounce timeouts on unmount
  useEffect(() => {
    return () => {
      if (radiusDebounceRef.current) clearTimeout(radiusDebounceRef.current);
      if (vehicleTypeDebounceRef.current) clearTimeout(vehicleTypeDebounceRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {searchParams.radius} km
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={searchParams.radius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span><span>5 km</span><span>10 km</span><span>15 km</span><span>20 km</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                value={searchParams.vehicleType}
                onChange={(e) => handleVehicleTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🚗 All Vehicles</option>
                <option value="4-wheeler">🚗 4 Wheeler (Car, SUV, etc.)</option>
                <option value="2-wheeler">🏍️ 2 Wheeler (Bike, Scooter, etc.)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={getUserLocation}
                disabled={isLocating}
                className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                {isLocating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">📍</span>
                    <span>Use My Current Location</span>
                  </>
                )}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <div className="text-xs text-gray-500 text-center py-2 bg-gray-100 rounded-lg">
                {parkingSlots.length} parking spots found
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Search by Address / Location
            </label>
            <AddressSearch 
              ref={addressSearchRef}
              onLocationSelect={searchWithAddress}
              placeholder="Enter city, area, or landmark (e.g., Connaught Place, Delhi, MG Road, Bangalore)"
            />
          </div>
          
          {locationError && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 flex items-center gap-2">
                <span>⚠️</span> {locationError}
              </p>
            </div>
          )}
          
          {manualAddress && !locationError && hasSearched && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <span>📍</span> 
                <span>Showing results near: <strong>{manualAddress.length > 80 ? manualAddress.substring(0, 80) + '...' : manualAddress}</strong></span>
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Parking List */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🅿️</span> Available Parking Slots
                <span className="text-sm font-normal text-gray-500">({parkingSlots.length} found)</span>
              </h2>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="spinner"></div>
                  <p className="mt-4 text-gray-500">Finding parking spots...</p>
                </div>
              ) : parkingSlots.length === 0 && hasSearched ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🅿️</div>
                  <p className="text-gray-500 font-medium">No parking slots found</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different location or increase radius</p>
                </div>
              ) : !hasSearched ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📍</div>
                  <p className="text-gray-500 font-medium">Search for parking</p>
                  <p className="text-sm text-gray-400 mt-2">Use the search bar above to find parking near you</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {parkingSlots.map((slot, index) => (
                    <motion.div
                      key={slot._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer bg-white hover:border-blue-300"
                      onClick={() => openBookingModal(slot)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg text-gray-800">{slot.title}</h3>
                            {slot.distance && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                📍 {slot.distance} km away
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{slot.location?.address}</p>
                          <p className="text-gray-500 text-xs mt-1">{slot.location?.city}, {slot.location?.state}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${slot.availableSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              🅿️ {slot.availableSlots}/{slot.totalSlots} spots
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                              💰 ₹{slot.pricing?.hourly}/hour
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (slot.availableSlots <= 0) {
                              toast.error('No spots available at this location');
                              return;
                            }
                            openBookingModal(slot);
                          }}
                          disabled={slot.availableSlots <= 0}
                          className={`ml-4 px-5 py-2 rounded-lg transition-all text-sm font-medium shadow-md ${
                            slot.availableSlots > 0 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {slot.availableSlots > 0 ? 'Book Now →' : 'Full'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>🗺️</span> Map View
              <span className="text-xs text-gray-500">({parkingSlots.length} locations)</span>
            </h2>
            {mapReady ? (
              <MapContainer 
                key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: '500px', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController center={mapCenter} zoom={mapZoom} markers={markerPositions} />
                
                {parkingSlots.map((slot) => (
                  slot.location && slot.location.coordinates && (
                    <BlinkingMarker 
                      key={slot._id} 
                      position={[slot.location.coordinates[1], slot.location.coordinates[0]]}
                      slot={slot}
                      onBook={openBookingModal}
                    />
                  )
                ))}
              </MapContainer>
            ) : (
              <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="spinner mb-3"></div>
                  <p className="text-gray-500">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-xl">
                <h3 className="text-xl font-bold">Book Parking Slot</h3>
                <p className="text-sm text-blue-100 mt-1">{selectedSlot.title}</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">📍 {selectedSlot.location?.address}</p>
                  <p className="text-sm text-gray-600 mt-2">💰 ₹{selectedSlot.pricing?.hourly} per hour</p>
                  <p className="text-sm text-gray-600 mt-1">🅿️ Available: {selectedSlot.availableSlots}/{selectedSlot.totalSlots} spots</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number *</label>
                  <input
                    type="text"
                    value={bookingDetails.vehicleNumber}
                    onChange={(e) => setBookingDetails({...bookingDetails, vehicleNumber: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DL01AB1234"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={bookingDetails.startTime}
                      onChange={(e) => setBookingDetails({...bookingDetails, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {bookingDetails.startTime && (
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(bookingDetails.startTime)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input
                      type="datetime-local"
                      value={bookingDetails.endTime}
                      onChange={(e) => setBookingDetails({...bookingDetails, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {bookingDetails.endTime && (
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(bookingDetails.endTime)}</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="space-y-2">
                    {bookingSummary.hours > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-800">{bookingSummary.hours} hour(s)</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">₹{bookingSummary.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">*Payment via Razorpay</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                  >
                    {bookingLoading ? 'Processing...' : 'Proceed to Pay'}
                  </button>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Phone Verification Modal */}
        <PhoneVerificationModal
          isOpen={showPhoneModal}
          onClose={() => {
            setShowPhoneModal(false);
            setSelectedSlot(null);
          }}
          onComplete={handlePhoneVerified}
          user={user}
        />
      </div>
    </div>
  );
};

export default SearchParking;
