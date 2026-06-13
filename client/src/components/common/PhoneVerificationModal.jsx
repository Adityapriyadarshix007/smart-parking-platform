import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const PhoneVerificationModal = ({ isOpen, onClose, onComplete, user }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Advanced phone number validation
  const validatePhoneNumber = (number) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check length
    if (cleanNumber.length !== 10) {
      return { valid: false, message: 'Phone number must be exactly 10 digits' };
    }
    
    // Check for repeating digits (1111111111, 2222222222, etc.)
    const repeatingPattern = /^(\d)\1{9}$/;
    if (repeatingPattern.test(cleanNumber)) {
      return { valid: false, message: 'Please enter a valid phone number (repeating digits not allowed)' };
    }
    
    // Check for sequential digits (1234567890, 9876543210)
    const sequentialAsc = '1234567890';
    const sequentialDesc = '9876543210';
    if (cleanNumber === sequentialAsc || cleanNumber === sequentialDesc) {
      return { valid: false, message: 'Please enter a valid phone number (sequential digits not allowed)' };
    }
    
    // Check for common patterns
    const invalidPatterns = [
      '1234567890', '9876543210', '1111111111', '2222222222', '3333333333',
      '4444444444', '5555555555', '6666666666', '7777777777', '8888888888',
      '9999999999', '0000000000', '1212121212', '1231231231', '1122334455'
    ];
    
    if (invalidPatterns.includes(cleanNumber)) {
      return { valid: false, message: 'Please enter a valid phone number' };
    }
    
    // Check if starts with valid Indian mobile prefixes
    const validPrefixes = ['6', '7', '8', '9'];
    const firstDigit = cleanNumber[0];
    if (!validPrefixes.includes(firstDigit)) {
      return { valid: false, message: 'Mobile number must start with 6, 7, 8, or 9' };
    }
    
    // Check for valid Indian mobile number pattern
    // Indian mobile numbers: 6,7,8,9 followed by 9 digits
    const validPattern = /^[6-9]\d{9}$/;
    if (!validPattern.test(cleanNumber)) {
      return { valid: false, message: 'Please enter a valid Indian mobile number (starts with 6-9)' };
    }
    
    return { valid: true, cleanNumber };
  };

  const handleSavePhone = async () => {
    const validation = validatePhoneNumber(phone);
    
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('https://smart-parking-backend-tefg.onrender.com/api/v1/auth/profile',
        { name: user?.name, phone: validation.cleanNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update user in localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.phone = validation.cleanNumber;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        toast.success('Phone number saved successfully! You can now book parking.');
        onComplete(validation.cleanNumber);
        onClose();
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to save phone number');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📞</div>
          <h2 className="text-2xl font-bold text-gray-800">Phone Number Required</h2>
          <p className="text-gray-500 text-sm mt-1">
            Please enter your valid 10-digit mobile number
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="10"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a valid 10-digit Indian mobile number (starts with 6,7,8,9)
            </p>
            <div className="mt-2 text-xs text-gray-400">
              <p>❌ Invalid: 1111111111, 1234567890, 0000000000</p>
              <p>✅ Valid: 9876543210, 8765432109, 7654321098</p>
            </div>
          </div>
          
          <button
            onClick={handleSavePhone}
            disabled={loading || phone.length !== 10}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
          
          <button
            onClick={() => {
              onClose();
              setPhone('');
            }}
            className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneVerificationModal;
