const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User.model');
const ParkingSlot = require('../models/ParkingSlot.model');

// Complete parking dataset for all Indian states (max 100 slots)
const parkingLocations = [
  // North Zone
  { name: "Jammu City Center Parking", lat: 32.7266, lng: 74.8570, address: "Jammu City Center, Jammu", city: "Jammu", state: "Jammu & Kashmir", slots: 45, price: 35, type: "covered" },
  { name: "Srinagar Dal Lake Parking", lat: 34.0837, lng: 74.7973, address: "Dal Lake, Srinagar", city: "Srinagar", state: "Jammu & Kashmir", slots: 30, price: 40, type: "open" },
  { name: "Gulmarg Parking Plaza", lat: 34.0481, lng: 74.3807, address: "Gulmarg, Baramulla", city: "Gulmarg", state: "Jammu & Kashmir", slots: 25, price: 45, type: "covered" },
  
  { name: "Shimla Mall Road Parking", lat: 31.1048, lng: 77.1734, address: "Mall Road, Shimla", city: "Shimla", state: "Himachal Pradesh", slots: 35, price: 40, type: "covered" },
  { name: "Manali Parking Hub", lat: 32.2432, lng: 77.1897, address: "Mall Road, Manali", city: "Manali", state: "Himachal Pradesh", slots: 28, price: 35, type: "open" },
  { name: "Dharamshala Parking", lat: 32.2190, lng: 76.3234, address: "McLeod Ganj, Dharamshala", city: "Dharamshala", state: "Himachal Pradesh", slots: 22, price: 30, type: "covered" },
  
  { name: "Chandigarh Sector 17 Plaza", lat: 30.7353, lng: 76.7844, address: "Sector 17, Chandigarh", city: "Chandigarh", state: "Punjab", slots: 60, price: 35, type: "covered" },
  { name: "Amritsar Golden Temple Parking", lat: 31.6200, lng: 74.8766, address: "Golden Temple, Amritsar", city: "Amritsar", state: "Punjab", slots: 50, price: 30, type: "open" },
  { name: "Ludhiana Mall Road Parking", lat: 30.9010, lng: 75.8573, address: "Mall Road, Ludhiana", city: "Ludhiana", state: "Punjab", slots: 40, price: 35, type: "covered" },
  
  { name: "Dehradun Paltan Bazar Parking", lat: 30.3165, lng: 78.0322, address: "Paltan Bazar, Dehradun", city: "Dehradun", state: "Uttarakhand", slots: 35, price: 30, type: "open" },
  { name: "Nainital Mall Road Parking", lat: 29.3919, lng: 79.4542, address: "Mall Road, Nainital", city: "Nainital", state: "Uttarakhand", slots: 25, price: 40, type: "covered" },
  { name: "Rishikesh Triveni Ghat Parking", lat: 30.0869, lng: 78.2676, address: "Triveni Ghat, Rishikesh", city: "Rishikesh", state: "Uttarakhand", slots: 30, price: 35, type: "open" },
  
  // East Zone
  { name: "Patna Junction Parking", lat: 25.5941, lng: 85.1376, address: "Patna Junction, Patna", city: "Patna", state: "Bihar", slots: 45, price: 30, type: "open" },
  { name: "Bodh Gaya Parking", lat: 24.6961, lng: 84.9869, address: "Mahabodhi Temple, Bodh Gaya", city: "Bodh Gaya", state: "Bihar", slots: 28, price: 25, type: "covered" },
  
  { name: "Ranchi Main Road Parking", lat: 23.3441, lng: 85.3096, address: "Main Road, Ranchi", city: "Ranchi", state: "Jharkhand", slots: 35, price: 30, type: "open" },
  { name: "Jamshedpur Jubilee Park", lat: 22.8046, lng: 86.2029, address: "Jubilee Park, Jamshedpur", city: "Jamshedpur", state: "Jharkhand", slots: 30, price: 35, type: "covered" },
  
  { name: "Bhubaneswar Master Canteen", lat: 20.2961, lng: 85.8245, address: "Master Canteen Square, Bhubaneswar", city: "Bhubaneswar", state: "Odisha", slots: 40, price: 30, type: "open" },
  { name: "Puri Jagannath Temple Parking", lat: 19.8076, lng: 85.8225, address: "Jagannath Temple, Puri", city: "Puri", state: "Odisha", slots: 50, price: 35, type: "covered" },
  { name: "Cuttack Choudhury Bazar", lat: 20.4649, lng: 85.8796, address: "Choudhury Bazar, Cuttack", city: "Cuttack", state: "Odisha", slots: 35, price: 30, type: "open" },
  
  { name: "Kolkata Park Street", lat: 22.5542, lng: 88.3561, address: "Park Street, Kolkata", city: "Kolkata", state: "West Bengal", slots: 45, price: 45, type: "covered" },
  { name: "Howrah Station Parking", lat: 22.5800, lng: 88.3400, address: "Howrah Station, Howrah", city: "Howrah", state: "West Bengal", slots: 60, price: 35, type: "open" },
  { name: "Siliguri Tenzing Norgay Bus Terminus", lat: 26.7271, lng: 88.3946, address: "Hill Cart Road, Siliguri", city: "Siliguri", state: "West Bengal", slots: 40, price: 30, type: "covered" },
  
  // West Zone
  { name: "Ahmedabad CG Road", lat: 23.0225, lng: 72.5714, address: "CG Road, Ahmedabad", city: "Ahmedabad", state: "Gujarat", slots: 55, price: 35, type: "covered" },
  { name: "Surat City Light Parking", lat: 21.1702, lng: 72.8311, address: "City Light Road, Surat", city: "Surat", state: "Gujarat", slots: 40, price: 30, type: "open" },
  { name: "Vadodara Alkapuri Parking", lat: 22.3072, lng: 73.1812, address: "Alkapuri, Vadodara", city: "Vadodara", state: "Gujarat", slots: 45, price: 35, type: "covered" },
  
  { name: "Indore MG Road Parking", lat: 22.7196, lng: 75.8577, address: "MG Road, Indore", city: "Indore", state: "Madhya Pradesh", slots: 50, price: 35, type: "covered" },
  { name: "Bhopal MP Nagar Parking", lat: 23.2078, lng: 77.4050, address: "MP Nagar, Bhopal", city: "Bhopal", state: "Madhya Pradesh", slots: 45, price: 30, type: "open" },
  { name: "Gwalior City Center", lat: 26.2183, lng: 78.1828, address: "City Center, Gwalior", city: "Gwalior", state: "Madhya Pradesh", slots: 35, price: 35, type: "covered" },
  
  { name: "Mumbai Bandra Kurla Complex", lat: 19.0648, lng: 72.8663, address: "BKC, Bandra East", city: "Mumbai", state: "Maharashtra", slots: 80, price: 70, type: "covered" },
  { name: "Pune FC Road Parking", lat: 18.5204, lng: 73.8567, address: "FC Road, Pune", city: "Pune", state: "Maharashtra", slots: 60, price: 45, type: "open" },
  { name: "Nagpur Dharampeth Parking", lat: 21.1458, lng: 79.0882, address: "Dharampeth, Nagpur", city: "Nagpur", state: "Maharashtra", slots: 40, price: 35, type: "covered" },
  { name: "Nashik College Road", lat: 19.9975, lng: 73.7898, address: "College Road, Nashik", city: "Nashik", state: "Maharashtra", slots: 35, price: 30, type: "open" },
  
  // South Zone
  { name: "Hyderabad Hitech City", lat: 17.4474, lng: 78.3752, address: "Hitech City, Hyderabad", city: "Hyderabad", state: "Telangana", slots: 85, price: 50, type: "covered" },
  { name: "Warangal Kazipet Parking", lat: 17.9784, lng: 79.5998, address: "Kazipet, Warangal", city: "Warangal", state: "Telangana", slots: 30, price: 30, type: "open" },
  
  { name: "Bengaluru MG Road", lat: 12.9753, lng: 77.6060, address: "MG Road, Bangalore", city: "Bangalore", state: "Karnataka", slots: 55, price: 45, type: "covered" },
  { name: "Mysore Palace Parking", lat: 12.3052, lng: 76.6552, address: "Mysore Palace, Mysore", city: "Mysore", state: "Karnataka", slots: 60, price: 40, type: "open" },
  { name: "Mangalore Hampankatta", lat: 12.9141, lng: 74.8560, address: "Hampankatta, Mangalore", city: "Mangalore", state: "Karnataka", slots: 40, price: 35, type: "covered" },
  
  { name: "Chennai T Nagar", lat: 13.0426, lng: 80.2424, address: "T Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", slots: 65, price: 40, type: "covered" },
  { name: "Coimbatore RS Puram", lat: 11.0168, lng: 76.9558, address: "RS Puram, Coimbatore", city: "Coimbatore", state: "Tamil Nadu", slots: 45, price: 35, type: "open" },
  { name: "Madurai Meenakshi Temple", lat: 9.9196, lng: 78.1193, address: "Meenakshi Temple, Madurai", city: "Madurai", state: "Tamil Nadu", slots: 50, price: 35, type: "covered" },
  
  { name: "Kochi MG Road", lat: 9.9667, lng: 76.2833, address: "MG Road, Kochi", city: "Kochi", state: "Kerala", slots: 45, price: 45, type: "covered" },
  { name: "Thiruvananthapuram Statue", lat: 8.5063, lng: 76.9564, address: "Statue, Thiruvananthapuram", city: "Thiruvananthapuram", state: "Kerala", slots: 40, price: 40, type: "open" },
  { name: "Kozhikode Mavoor Road", lat: 11.2588, lng: 75.7804, address: "Mavoor Road, Kozhikode", city: "Kozhikode", state: "Kerala", slots: 35, price: 35, type: "covered" },
  
  // Central Zone
  { name: "Lucknow Hazratganj", lat: 26.8467, lng: 80.9462, address: "Hazratganj, Lucknow", city: "Lucknow", state: "Uttar Pradesh", slots: 55, price: 35, type: "covered" },
  { name: "Agra Taj Mahal Parking", lat: 27.1751, lng: 78.0421, address: "Taj Mahal, Agra", city: "Agra", state: "Uttar Pradesh", slots: 80, price: 45, type: "open" },
  { name: "Varanasi Godowlia Parking", lat: 25.3176, lng: 82.9739, address: "Godowlia, Varanasi", city: "Varanasi", state: "Uttar Pradesh", slots: 40, price: 35, type: "covered" },
  { name: "Noida Sector 18", lat: 28.5712, lng: 77.3212, address: "Sector 18, Noida", city: "Noida", state: "Uttar Pradesh", slots: 60, price: 40, type: "covered" },
  
  { name: "Jaipur MI Road", lat: 26.9124, lng: 75.7873, address: "MI Road, Jaipur", city: "Jaipur", state: "Rajasthan", slots: 50, price: 40, type: "covered" },
  { name: "Jodhpur Sardar Market", lat: 26.2866, lng: 73.0231, address: "Sardar Market, Jodhpur", city: "Jodhpur", state: "Rajasthan", slots: 35, price: 35, type: "open" },
  { name: "Udaipur City Palace", lat: 24.5785, lng: 73.6829, address: "City Palace, Udaipur", city: "Udaipur", state: "Rajasthan", slots: 40, price: 45, type: "covered" },
  
  // North-East Zone
  { name: "Guwahati GS Road", lat: 26.1445, lng: 91.7362, address: "GS Road, Guwahati", city: "Guwahati", state: "Assam", slots: 45, price: 35, type: "covered" },
  { name: "Dibrugarh AMC Parking", lat: 27.4728, lng: 94.9120, address: "AMC Market, Dibrugarh", city: "Dibrugarh", state: "Assam", slots: 30, price: 30, type: "open" },
  
  { name: "Shillong Police Bazar", lat: 25.5788, lng: 91.8933, address: "Police Bazar, Shillong", city: "Shillong", state: "Meghalaya", slots: 30, price: 35, type: "covered" },
  { name: "Agartala Motor Stand", lat: 23.8315, lng: 91.2868, address: "Motor Stand, Agartala", city: "Agartala", state: "Tripura", slots: 25, price: 30, type: "open" },
  { name: "Kohima Main Town", lat: 25.6766, lng: 94.1089, address: "Main Town, Kohima", city: "Kohima", state: "Nagaland", slots: 20, price: 30, type: "covered" },
  { name: "Aizawl Zarkawt", lat: 23.7271, lng: 92.7176, address: "Zarkawt, Aizawl", city: "Aizawl", state: "Mizoram", slots: 22, price: 28, type: "open" },
  { name: "Imphal Paona Bazar", lat: 24.8170, lng: 93.9368, address: "Paona Bazar, Imphal", city: "Imphal", state: "Manipur", slots: 25, price: 30, type: "covered" },
  { name: "Gangtok MG Marg", lat: 27.3340, lng: 88.6145, address: "MG Marg, Gangtok", city: "Gangtok", state: "Sikkim", slots: 28, price: 40, type: "open" },
  
  // Union Territories
  { name: "Delhi Connaught Place", lat: 28.6325, lng: 77.2196, address: "Connaught Place, New Delhi", city: "New Delhi", state: "Delhi", slots: 80, price: 50, type: "covered" },
  { name: "Delhi Rajiv Chowk Metro", lat: 28.6325, lng: 77.2196, address: "Rajiv Chowk, New Delhi", city: "New Delhi", state: "Delhi", slots: 70, price: 45, type: "covered" },
  { name: "Delhi Nehru Place", lat: 28.5500, lng: 77.1950, address: "Nehru Place, New Delhi", city: "New Delhi", state: "Delhi", slots: 75, price: 55, type: "covered" },
  
  { name: "Puducherry Beach Road", lat: 11.9326, lng: 79.8291, address: "Beach Road, Puducherry", city: "Puducherry", state: "Puducherry", slots: 35, price: 40, type: "open" },
  { name: "Puducherry Market Square", lat: 11.9311, lng: 79.8311, address: "Market Square, Puducherry", city: "Puducherry", state: "Puducherry", slots: 30, price: 35, type: "covered" },
  
  { name: "Port Blair Aberdeen Bazar", lat: 11.6234, lng: 92.7265, address: "Aberdeen Bazar, Port Blair", city: "Port Blair", state: "Andaman & Nicobar", slots: 25, price: 35, type: "open" },
  
  { name: "Leh Main Market", lat: 34.1526, lng: 77.5770, address: "Main Market, Leh", city: "Leh", state: "Ladakh", slots: 20, price: 40, type: "covered" },
  { name: "Kargil Main Bazar", lat: 34.5589, lng: 76.1262, address: "Main Bazar, Kargil", city: "Kargil", state: "Ladakh", slots: 18, price: 35, type: "open" },
  
  { name: "Daman Moti Daman", lat: 20.4177, lng: 72.8519, address: "Moti Daman, Daman", city: "Daman", state: "Daman & Diu", slots: 22, price: 30, type: "covered" },
  { name: "Silvassa Market", lat: 20.2724, lng: 72.9974, address: "Market, Silvassa", city: "Silvassa", state: "Dadra & Nagar Haveli", slots: 20, price: 28, type: "open" }
];

async function seedParkingData() {
  try {
    console.log('📡 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing parking slots
    const deleted = await ParkingSlot.deleteMany({});
    console.log(`🗑️ Cleared ${deleted.deletedCount} existing parking slots`);
    
    // Get or create owner
    let owner = await User.findOne({ email: 'parking_owner@smartpark.com' });
    if (!owner) {
      const hashedPassword = await bcrypt.hash('Owner@123', 10);
      owner = await User.create({
        name: 'Parking Owner',
        email: 'parking_owner@smartpark.com',
        password: hashedPassword,
        phone: '8888888888',
        role: 'owner',
        isVerified: true
      });
      console.log('✅ Owner user created');
    }
    
    let createdCount = 0;
    
    for (const location of parkingLocations) {
      const totalSlots = Math.min(location.slots, 100); // Ensure max 100
      const availableSlots = Math.max(5, Math.floor(Math.random() * (totalSlots - 5)) + 5);
      const vehicleTypes = ['4-wheeler', '2-wheeler'];
      
      await ParkingSlot.create({
        ownerId: owner._id,
        title: location.name,
        description: `Secure parking facility at ${location.name}. CCTV surveillance, 24/7 security, well-lit area.`,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
          address: location.address,
          city: location.city,
          state: location.state,
          landmark: `Near ${location.name}`
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
        isVerified: true,
        isActive: true,
        status: 'active'
      });
      createdCount++;
      
      if (createdCount % 10 === 0) {
        console.log(`📦 Created ${createdCount} parking slots...`);
      }
    }
    
    const totalSlots = await ParkingSlot.countDocuments();
    const states = await ParkingSlot.distinct('location.state');
    
    console.log('\n🎉 ========================================');
    console.log('   PARKING DATABASE SEEDING COMPLETE!');
    console.log('========================================');
    console.log(`📊 New Parking Slots Created: ${createdCount}`);
    console.log(`📊 Total Parking Slots: ${totalSlots}`);
    console.log(`📊 States/UTs Covered: ${states.length}`);
    console.log('\n📍 States/UTs with Parking:');
    states.sort().forEach(state => console.log(`   - ${state}`));
    
    console.log('\n🔑 Login Credentials:');
    console.log('========================================');
    console.log('👑 Admin: admin@smartpark.com / Admin@123');
    console.log('🏪 Owner: parking_owner@smartpark.com / Owner@123');
    console.log('👤 User: user@example.com / 123456');
    
    await mongoose.disconnect();
    console.log('\n✅ All systems ready!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedParkingData();
