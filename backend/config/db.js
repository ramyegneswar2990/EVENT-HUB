const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };
    
    // For MongoDB Atlas (cloud), SSL is handled automatically
    // For local MongoDB, no SSL needed
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.error('\nTroubleshooting:');
    console.error('1. Check if MongoDB is running (for local)');
    console.error('2. Verify MONGODB_URI in .env file is correct');
    console.error('3. For MongoDB Atlas, check network access and credentials');
    console.error('4. For local MongoDB, ensure it\'s running on the correct port');
    process.exit(1);
  }
};

module.exports = connectDB;

