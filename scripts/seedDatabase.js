const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../server/.env' });

const User = require('../server/src/models/User.model');
const ParkingSlot = require('../server/src/models/ParkingSlot.model');

const sampleSlots = [
  {
    title: "Metro Station Parking",
    description: "Near metro station entrance",
    location: {
      coordinates: [77.2090, 28.6139],
      address: "Near Metro Station, Connaught Place",
      city: "Delhi"
    },
    vehicleTypes: ["4-wheeler"],
    totalSlots: 20,
    availableSlots: 15,
    pricing: { hourly: 30, daily: 150 },
    isVerified: true,
    isActive: true
  },
  {
    title: "Office Complex Parking",
    description: "Secure parking with CCTV",
    location: {
      coordinates: [77.2290, 28.6239],
      address: "Cyber City, Gurgaon",
      city: "Gurgaon"
    },
    vehicleTypes: ["4-wheeler", "2-wheeler"],
    totalSlots: 50,
    availableSlots: 30,
    pricing: { hourly: 40, daily: 200 },
    isVerified: true,
    isActive: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const adminExists = await User.findOne({ email: 'admin@smartparking.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@smartparking.com',
        password: 'admin123',
        phone: '9999999999',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created');
    }
    
    const owner = await User.findOne({ role: 'owner' });
    if (owner) {
      for (const slot of sampleSlots) {
        const existing = await ParkingSlot.findOne({ title: slot.title });
        if (!existing) {
          await ParkingSlot.create({ ...slot, ownerId: owner._id });
          console.log(`Created slot: ${slot.title}`);
        }
      }
    }
    
    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
