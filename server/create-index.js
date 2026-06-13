const mongoose = require('mongoose');
require('dotenv').config();

async function createIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('parkingslots');
    
    // Create 2dsphere index for location-based queries
    await collection.createIndex({ "location": "2dsphere" });
    console.log('✅ Geospatial index created on location field');
    
    // Create other useful indexes
    await collection.createIndex({ isActive: 1, isVerified: 1 });
    await collection.createIndex({ availableSlots: 1 });
    await collection.createIndex({ city: 1, state: 1 });
    
    console.log('✅ All indexes created successfully');
    
    // Count documents
    const count = await collection.countDocuments();
    console.log(`📊 Total parking slots: ${count}`);
    
    await mongoose.disconnect();
    console.log('✅ Done');
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

createIndex();
