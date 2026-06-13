const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from server directory
const envPath = path.join(__dirname, '../../.env');
console.log('📂 Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env:', result.error.message);
  process.exit(1);
}

console.log('✅ .env loaded');
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

const User = require('../models/User.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const Booking = require('../models/Booking.model');

// 50+ Parking Locations Across India (All slots <= 100)
const parkingLocations = [
  // Delhi NCR
  { name: "Connaught Place Parking Hub", lat: 28.6325, lng: 77.2196, address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi", slots: 45, price: 40, type: "covered" },
  { name: "Cyber City Parking Complex", lat: 28.4948, lng: 77.0889, address: "DLF Cyber City, Gurugram", city: "Gurugram", state: "Haryana", slots: 80, price: 50, type: "covered" },
  { name: "Select Citywalk Mall Parking", lat: 28.5254, lng: 77.2156, address: "Saket, New Delhi", city: "Delhi", state: "Delhi", slots: 80, price: 60, type: "covered" },
  { name: "Ambience Mall Parking", lat: 28.4562, lng: 77.0923, address: "NH-8, Gurugram", city: "Gurugram", state: "Haryana", slots: 90, price: 45, type: "covered" },
  { name: "Rajiv Chowk Metro Parking", lat: 28.6325, lng: 77.2196, address: "Connaught Place", city: "Delhi", state: "Delhi", slots: 30, price: 35, type: "open" },
  { name: "Huda City Centre Metro", lat: 28.4595, lng: 77.0744, address: "Sector 29, Gurugram", city: "Gurugram", state: "Haryana", slots: 25, price: 30, type: "covered" },
  { name: "Noida Sector 18 Parking", lat: 28.5712, lng: 77.3212, address: "Sector 18, Noida", city: "Noida", state: "Uttar Pradesh", slots: 60, price: 35, type: "open" },
  { name: "World Trade Centre Parking", lat: 28.5500, lng: 77.1950, address: "Nehru Place, New Delhi", city: "Delhi", state: "Delhi", slots: 90, price: 55, type: "covered" },
  
  // Mumbai
  { name: "Bandra Kurla Complex Parking", lat: 19.0648, lng: 72.8663, address: "BKC, Bandra East", city: "Mumbai", state: "Maharashtra", slots: 95, price: 70, type: "covered" },
  { name: "Andheri Station Parking", lat: 19.1197, lng: 72.8454, address: "Andheri West", city: "Mumbai", state: "Maharashtra", slots: 40, price: 35, type: "open" },
  { name: "Phoenix Market City", lat: 19.1136, lng: 72.8653, address: "Kurla, Mumbai", city: "Mumbai", state: "Maharashtra", slots: 85, price: 55, type: "covered" },
  { name: "Nariman Point Parking", lat: 18.9263, lng: 72.8221, address: "Nariman Point, Mumbai", city: "Mumbai", state: "Maharashtra", slots: 60, price: 80, type: "covered" },
  { name: "Powai IT Park Parking", lat: 19.1173, lng: 72.9045, address: "Powai, Mumbai", city: "Mumbai", state: "Maharashtra", slots: 85, price: 45, type: "covered" },
  { name: "Thane Station Parking", lat: 19.1976, lng: 72.9768, address: "Thane West", city: "Thane", state: "Maharashtra", slots: 35, price: 30, type: "open" },
  { name: "Pune Station Parking", lat: 18.5204, lng: 73.8567, address: "Pune Station", city: "Pune", state: "Maharashtra", slots: 50, price: 40, type: "open" },
  
  // Bangalore
  { name: "MG Road Metro Station", lat: 12.9753, lng: 77.6060, address: "MG Road, Bangalore", city: "Bangalore", state: "Karnataka", slots: 35, price: 45, type: "covered" },
  { name: "Electronic City Parking", lat: 12.8455, lng: 77.6602, address: "Electronic City Phase 1", city: "Bangalore", state: "Karnataka", slots: 90, price: 40, type: "open" },
  { name: "Indiranagar Metro Parking", lat: 12.9784, lng: 77.6408, address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", slots: 28, price: 35, type: "covered" },
  { name: "Koramangala Parking Hub", lat: 12.9279, lng: 77.6271, address: "Koramangala, Bangalore", city: "Bangalore", state: "Karnataka", slots: 55, price: 45, type: "covered" },
  { name: "Whitefield IT Park", lat: 12.9698, lng: 77.7499, address: "Whitefield, Bangalore", city: "Bangalore", state: "Karnataka", slots: 85, price: 50, type: "covered" },
  
  // Chennai
  { name: "T Nagar Shopping Complex", lat: 13.0426, lng: 80.2424, address: "T Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", slots: 55, price: 40, type: "covered" },
  { name: "Chennai Central Station", lat: 13.0822, lng: 80.2750, address: "Park Town, Chennai", city: "Chennai", state: "Tamil Nadu", slots: 45, price: 35, type: "open" },
  { name: "OMR IT Corridor Parking", lat: 12.9000, lng: 80.2300, address: "OMR, Chennai", city: "Chennai", state: "Tamil Nadu", slots: 75, price: 45, type: "covered" },
  
  // Kolkata
  { name: "Park Street Parking", lat: 22.5542, lng: 88.3561, address: "Park Street, Kolkata", city: "Kolkata", state: "West Bengal", slots: 40, price: 45, type: "covered" },
  { name: "Howrah Station Parking", lat: 22.5800, lng: 88.3400, address: "Howrah, Kolkata", city: "Kolkata", state: "West Bengal", slots: 60, price: 35, type: "open" },
  { name: "Salt Lake Sector V", lat: 22.5800, lng: 88.4300, address: "Salt Lake City", city: "Kolkata", state: "West Bengal", slots: 85, price: 40, type: "covered" },
  
  // Hyderabad
  { name: "Hitech City Metro", lat: 17.4474, lng: 78.3752, address: "Hitech City, Hyderabad", city: "Hyderabad", state: "Telangana", slots: 65, price: 45, type: "covered" },
  { name: "Gachibowli IT Park", lat: 17.4406, lng: 78.3472, address: "Gachibowli, Hyderabad", city: "Hyderabad", state: "Telangana", slots: 85, price: 50, type: "covered" },
  { name: "Charminar Parking", lat: 17.3616, lng: 78.4747, address: "Charminar, Hyderabad", city: "Hyderabad", state: "Telangana", slots: 25, price: 30, type: "open" },
  
  // Ahmedabad
  { name: "CG Road Parking", lat: 23.0225, lng: 72.5714, address: "CG Road, Ahmedabad", city: "Ahmedabad", state: "Gujarat", slots: 45, price: 35, type: "covered" },
  { name: "SG Highway Parking", lat: 23.0300, lng: 72.5300, address: "SG Highway, Ahmedabad", city: "Ahmedabad", state: "Gujarat", slots: 70, price: 40, type: "covered" },
  
  // Jaipur
  { name: "MI Road Parking", lat: 26.9124, lng: 75.7873, address: "MI Road, Jaipur", city: "Jaipur", state: "Rajasthan", slots: 35, price: 35, type: "open" },
  { name: "Jawahar Circle Parking", lat: 26.8500, lng: 75.7900, address: "Jawahar Circle, Jaipur", city: "Jaipur", state: "Rajasthan", slots: 50, price: 30, type: "open" },
  
  // Chandigarh
  { name: "Sector 17 Plaza Parking", lat: 30.7353, lng: 76.7844, address: "Sector 17, Chandigarh", city: "Chandigarh", state: "Punjab", slots: 55, price: 35, type: "covered" },
  { name: "Elante Mall Parking", lat: 30.7100, lng: 76.8000, address: "Industrial Area, Chandigarh", city: "Chandigarh", state: "Punjab", slots: 90, price: 40, type: "covered" },
  
  // Kochi
  { name: "MG Road Parking", lat: 9.9667, lng: 76.2833, address: "MG Road, Kochi", city: "Kochi", state: "Kerala", slots: 40, price: 35, type: "covered" },
  { name: "Lulu Mall Parking", lat: 10.0200, lng: 76.3300, address: "Edapally, Kochi", city: "Kochi", state: "Kerala", slots: 85, price: 45, type: "covered" },
  
  // Bhopal
  { name: "MP Nagar Parking", lat: 23.2078, lng: 77.4050, address: "MP Nagar, Bhopal", city: "Bhopal", state: "Madhya Pradesh", slots: 45, price: 30, type: "open" },
  
  // Lucknow
  { name: "Hazratganj Parking", lat: 26.8600, lng: 80.9500, address: "Hazratganj, Lucknow", city: "Lucknow", state: "Uttar Pradesh", slots: 50, price: 35, type: "covered" },
  
  // Visakhapatnam
  { name: "RK Beach Parking", lat: 17.7900, lng: 83.3600, address: "RK Beach, Vizag", city: "Visakhapatnam", state: "Andhra Pradesh", slots: 35, price: 30, type: "open" },
  
  // Patna
  { name: "Patna Junction Parking", lat: 25.6000, lng: 85.1400, address: "Patna Junction", city: "Patna", state: "Bihar", slots: 40, price: 30, type: "open" },
  
  // Bhubaneswar
  { name: "Master Canteen Parking", lat: 20.2700, lng: 85.8400, address: "Master Canteen, Bhubaneswar", city: "Bhubaneswar", state: "Odisha", slots: 35, price: 30, type: "open" }
];

async function seedDatabase() {
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Clear existing data
    await ParkingSlot.deleteMany({});
    console.log('🗑️ Cleared existing parking slots');
    
    // Create Admin User
    let admin = await User.findOne({ email: 'admin@smartpark.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@smartpark.com',
        password: await bcrypt.hash('Admin@123', 10),
        phone: '9999999999',
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created: admin@smartpark.com / Admin@123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create Owner User
    let owner = await User.findOne({ email: 'owner@smartpark.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Parking Owner',
        email: 'owner@smartpark.com',
        password: await bcrypt.hash('Owner@123', 10),
        phone: '8888888888',
        role: 'owner',
        isVerified: true
      });
      console.log('✅ Owner user created: owner@smartpark.com / Owner@123');
    } else {
      console.log('✅ Owner user already exists');
    }
    
    // Create Regular Test User
    let testUser = await User.findOne({ email: 'user@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'user@example.com',
        password: await bcrypt.hash('123456', 10),
        phone: '7777777777',
        role: 'user',
        isVerified: true
      });
      console.log('✅ Test user created: user@example.com / 123456');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Create Parking Slots
    let slotCount = 0;
    for (const location of parkingLocations) {
      const totalSlots = Math.min(location.slots, 100);
      const availableSlots = Math.max(5, Math.floor(Math.random() * totalSlots));
      const vehicleTypes = Math.random() > 0.3 ? ['4-wheeler'] : ['4-wheeler', '2-wheeler'];
      
      await ParkingSlot.create({
        ownerId: owner._id,
        title: location.name,
        description: `Secure parking facility at ${location.name}. CCTV surveillance, 24/7 security, well-lit area.`,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
          address: location.address,
          city: location.city,
          state: location.state
        },
        images: [],
        slotType: location.type,
        vehicleTypes: vehicleTypes,
        totalSlots: totalSlots,
        availableSlots: availableSlots,
        pricing: {
          hourly: location.price,
          daily: location.price * 8,
          monthly: location.price * 8 * 25
        },
        availabilitySchedule: [
          { dayOfWeek: 1, startTime: "00:00", endTime: "23:59", isOpen: true },
          { dayOfWeek: 2, startTime: "00:00", endTime: "23:59", isOpen: true },
          { dayOfWeek: 3, startTime: "00:00", endTime: "23:59", isOpen: true },
          { dayOfWeek: 4, startTime: "00:00", endTime: "23:59", isOpen: true },
          { dayOfWeek: 5, startTime: "00:00", endTime: "23:59", isOpen: true },
          { dayOfWeek: 6, startTime: "00:00", endTime: "23:59", isOpen: true },
          { dayOfWeek: 0, startTime: "00:00", endTime: "23:59", isOpen: true }
        ],
        isVerified: true,
        isActive: true,
        status: 'active'
      });
      slotCount++;
      if (slotCount % 10 === 0) console.log(`📦 Created ${slotCount} parking slots...`);
    }
    
    const totalSlots = await ParkingSlot.countDocuments();
    const totalUsers = await User.countDocuments();
    
    console.log('\n🎉 ========================================');
    console.log('   DATABASE SEEDING COMPLETE!');
    console.log('========================================');
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`📊 Total Parking Slots: ${totalSlots}`);
    console.log(`📊 Locations Across: ${new Set(parkingLocations.map(p => p.state)).size} States`);
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('========================================');
    console.log('👑 Admin:    admin@smartpark.com / Admin@123');
    console.log('🏪 Owner:    owner@smartpark.com / Owner@123');
    console.log('👤 User:     user@example.com / 123456');
    console.log('\n✅ Your Smart Parking Platform is ready!');
    console.log('🚀 Start the backend: npm run dev');
    console.log('🎨 Start the frontend: cd client && npm start');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
