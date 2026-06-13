const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User.model');
const ParkingSlot = require('../models/ParkingSlot.model');

// Synthetic parking data for multiple cities
const parkingLocations = [
  // Delhi NCR Locations
  { name: "Connaught Place Metro Parking", lat: 28.6325, lng: 77.2196, address: "Connaught Place, New Delhi", city: "Delhi", slots: 45, price: 40 },
  { name: "Cyber Hub Parking", lat: 28.4948, lng: 77.0889, address: "DLF Cyber City, Gurugram", city: "Gurugram", slots: 120, price: 50 },
  { name: "Select Citywalk Mall", lat: 28.5254, lng: 77.2156, address: "Saket, New Delhi", city: "Delhi", slots: 80, price: 60 },
  { name: "Ambience Mall Parking", lat: 28.4562, lng: 77.0923, address: "NH-8, Gurugram", city: "Gurugram", slots: 200, price: 45 },
  { name: "Rajiv Chowk Metro Station", lat: 28.6325, lng: 77.2196, address: "Connaught Place", city: "Delhi", slots: 30, price: 35 },
  { name: "Huda City Centre Metro", lat: 28.4595, lng: 77.0744, address: "Sector 29, Gurugram", city: "Gurugram", slots: 25, price: 30 },
  
  // Mumbai Locations
  { name: "Bandra Kurla Complex", lat: 19.0648, lng: 72.8663, address: "BKC, Bandra East", city: "Mumbai", slots: 150, price: 70 },
  { name: "Andheri Station Parking", lat: 19.1197, lng: 72.8454, address: "Andheri West", city: "Mumbai", slots: 40, price: 35 },
  { name: "Phoenix Market City", lat: 19.1136, lng: 72.8653, address: "Kurla, Mumbai", city: "Mumbai", slots: 100, price: 55 },
  { name: "Nariman Point", lat: 18.9263, lng: 72.8221, address: "Nariman Point, Mumbai", city: "Mumbai", slots: 60, price: 80 },
  
  // Bangalore Locations
  { name: "MG Road Metro Station", lat: 12.9753, lng: 77.6060, address: "MG Road, Bangalore", city: "Bangalore", slots: 35, price: 45 },
  { name: "Electronic City", lat: 12.8455, lng: 77.6602, address: "Electronic City Phase 1", city: "Bangalore", slots: 90, price: 40 },
  { name: "Indiranagar Metro", lat: 12.9784, lng: 77.6408, address: "Indiranagar, Bangalore", city: "Bangalore", slots: 28, price: 35 },
  
  // Chennai Locations
  { name: "T Nagar Shopping Complex", lat: 13.0426, lng: 80.2424, address: "T Nagar, Chennai", city: "Chennai", slots: 55, price: 40 },
  { name: "Chennai Central Station", lat: 13.0822, lng: 80.2750, address: "Park Town, Chennai", city: "Chennai", slots: 45, price: 35 },
  
  // Hyderabad Locations
  { name: "Hitech City Metro", lat: 17.4474, lng: 78.3752, address: "Hitech City, Hyderabad", city: "Hyderabad", slots: 65, price: 45 },
  { name: "Gachibowli IT Park", lat: 17.4406, lng: 78.3472, address: "Gachibowli, Hyderabad", city: "Hyderabad", slots: 85, price: 50 },
  
  // Pune Locations
  { name: "Hinjewadi IT Park", lat: 18.5914, lng: 73.7380, address: "Phase 3, Hinjewadi", city: "Pune", slots: 110, price: 40 },
  { name: "MG Road Parking", lat: 18.5204, lng: 73.8567, address: "MG Road, Pune", city: "Pune", slots: 35, price: 35 },
];

const vehicleTypes = ['2-wheeler', '4-wheeler'];
const slotTypes = ['covered', 'open', 'basement'];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create Admin User
    const adminExists = await User.findOne({ email: 'admin@smartpark.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@smartpark.com',
        password: hashedPassword,
        phone: '9999999999',
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created');
    }
    
    // Create Owner Users and Parking Slots
    for (let i = 1; i <= 10; i++) {
      const ownerEmail = `owner${i}@smartpark.com`;
      let owner = await User.findOne({ email: ownerEmail });
      
      if (!owner) {
        const hashedPassword = await bcrypt.hash('Owner@123', 10);
        owner = await User.create({
          name: `Parking Owner ${i}`,
          email: ownerEmail,
          password: hashedPassword,
          phone: `999999990${i}`,
          role: 'owner',
          isVerified: true
        });
        console.log(`✅ Owner ${i} created`);
      }
      
      // Create 2-3 parking slots per owner
      const numSlots = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < numSlots && parkingLocations.length > 0; j++) {
        const location = parkingLocations.pop();
        if (!location) break;
        
        const totalSlots = location.slots;
        const availableSlots = Math.floor(Math.random() * (totalSlots - 5)) + 5;
        const hourlyRate = location.price;
        
        const slot = await ParkingSlot.create({
          ownerId: owner._id,
          title: location.name,
          description: `Secure parking facility near ${location.name}. CCTV surveillance, 24/7 security.`,
          location: {
            type: 'Point',
            coordinates: [location.lng, location.lat],
            address: location.address,
            city: location.city,
            landmark: `Near ${location.name}`
          },
          images: [],
          slotType: slotTypes[Math.floor(Math.random() * slotTypes.length)],
          vehicleTypes: [vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]],
          totalSlots: totalSlots,
          availableSlots: availableSlots,
          pricing: {
            hourly: hourlyRate,
            daily: hourlyRate * 8,
            monthly: hourlyRate * 8 * 25
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
        console.log(`✅ Created slot: ${slot.title} in ${slot.location.city}`);
      }
    }
    
    // Create Regular Users
    for (let i = 1; i <= 20; i++) {
      const userEmail = `user${i}@example.com`;
      const userExists = await User.findOne({ email: userEmail });
      
      if (!userExists) {
        const hashedPassword = await bcrypt.hash('User@123', 10);
        await User.create({
          name: `User ${i}`,
          email: userEmail,
          password: hashedPassword,
          phone: `888888880${i}`,
          role: 'user',
          isVerified: true
        });
      }
    }
    
    const totalSlots = await ParkingSlot.countDocuments();
    const totalUsers = await User.countDocuments();
    console.log('\n🎉 Database Seeding Complete!');
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`📊 Total Parking Slots: ${totalSlots}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@smartpark.com / Admin@123');
    console.log('Owner: owner1@smartpark.com / Owner@123');
    console.log('User: user1@example.com / User@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
