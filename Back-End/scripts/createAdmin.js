require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/haramain_transport');
    console.log('MongoDB connected for admin creation');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@haramain.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@haramain.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@haramain.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  createAdmin();
});
