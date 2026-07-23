const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Phone number validation function
const validatePhoneNumber = (phone) => {
  const cleanNumber = phone.toString().replace(/\D/g, '');
  
  if (cleanNumber.length !== 10) {
    return { valid: false, message: 'Phone number must be exactly 10 digits' };
  }
  
  const repeatingPattern = /^(\d)\1{9}$/;
  if (repeatingPattern.test(cleanNumber)) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  
  const sequentialAsc = '1234567890';
  const sequentialDesc = '9876543210';
  if (cleanNumber === sequentialAsc || cleanNumber === sequentialDesc) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  
  const invalidPatterns = [
    '1234567890', '9876543210', '1111111111', '2222222222', '3333333333',
    '4444444444', '5555555555', '6666666666', '7777777777', '8888888888',
    '9999999999', '0000000000'
  ];
  
  if (invalidPatterns.includes(cleanNumber)) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  
  const validPattern = /^[6-9]\d{9}$/;
  if (!validPattern.test(cleanNumber)) {
    return { valid: false, message: 'Mobile number must start with 6, 7, 8, or 9' };
  }
  
  return { valid: true, cleanNumber };
};

// Regular Registration
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }
    
    if (phone && phone !== '0000000000') {
      const validation = validatePhoneNumber(phone);
      if (!validation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: validation.message 
        });
      }
    }
    
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '0000000000',
      role: role || 'user',
      isVerified: true
    });
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Regular Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ PRIMARY Google verification - JWT decode (NO external API calls)
const googleVerify = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        message: 'No credential provided' 
      });
    }

    console.log('🔄 Decoding Google JWT token locally...');

    // Decode the JWT to get the payload
    const parts = credential.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('✅ JWT decoded successfully for:', payload.email);
    console.log('✅ Google ID:', payload.sub);
    console.log('✅ Email verified:', payload.email_verified);
    console.log('✅ Audience (aud):', payload.aud);

    const { email, name, picture, sub: googleId, email_verified, aud } = payload;

    // Verify that the audience matches our client ID
    const expectedAudience = process.env.GOOGLE_CLIENT_ID;
    if (aud !== expectedAudience) {
      console.log('❌ Audience mismatch. Expected:', expectedAudience, 'Got:', aud);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token audience' 
      });
    }

    if (!email_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email not verified with Google' 
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        password: Math.random().toString(36).slice(-12),
        phone: '0000000000',
        role: 'user',
        isVerified: true,
        profileImage: picture || null,
        googleId: googleId
      });
      console.log(`✅ New user created via Google: ${email}`);
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      console.log(`✅ Existing user logged in: ${email}`);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        profileImage: user.profileImage || picture
      }
    });

  } catch (error) {
    console.error('❌ Google verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed. Please try again.' 
    });
  }
};

// ✅ Google verification with external API (fallback - uses fetch)
const googleVerifyWithAPI = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        message: 'No credential provided' 
      });
    }

    console.log('🔄 Verifying Google token with API...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', response.status, errorText);
      throw new Error(`Google API returned ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    console.log('✅ Google token verified for:', payload.email);

    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email not verified with Google' 
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        password: Math.random().toString(36).slice(-12),
        phone: '0000000000',
        role: 'user',
        isVerified: true,
        profileImage: picture || null,
        googleId: googleId
      });
      console.log(`✅ New user created via Google: ${email}`);
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        profileImage: user.profileImage || picture
      }
    });

  } catch (error) {
    console.error('❌ Google API verification error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'Google verification timed out. Please check your internet connection and try again.'
      });
    }
    
    if (error.message.includes('ETIMEDOUT') || error.message.includes('connect') || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'Network timeout. Please check your internet connection and try again.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed. Please try again.' 
    });
  }
};

// ✅ Alias for googleVerify (for backward compatibility)
const googleVerifySimple = googleVerify;

// ✅ Alias for googleVerify (for backward compatibility)
const googleVerifyManual = googleVerify;

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (phone) {
      const validation = validatePhoneNumber(phone);
      if (!validation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: validation.message 
        });
      }
      user.phone = validation.cleanNumber;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No user found with this email' 
      });
    }
    
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset link sent',
      resetLink
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid or expired reset link' 
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Invalid or expired reset link' 
    });
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  googleVerify,
  googleVerifySimple,
  googleVerifyManual,
  googleVerifyWithAPI,
  forgotPassword,
  resetPassword,
  updateProfile
};
