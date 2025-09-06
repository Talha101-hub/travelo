#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up 4Dots Transport Management System...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Check if MongoDB is running
try {
  execSync('mongosh --version', { encoding: 'utf8' });
  console.log('✅ MongoDB is available');
} catch (error) {
  console.log('⚠️  MongoDB not found. Please install and start MongoDB.');
}

// Create frontend .env file
const frontendEnv = `# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000`;

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', frontendEnv);
  console.log('✅ Created frontend .env file');
} else {
  console.log('ℹ️  Frontend .env file already exists');
}

// Create backend .env file
const backendEnv = `# Backend Environment Variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/haramain_transport
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_${Date.now()}
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8083`;

if (!fs.existsSync('Back-End/.env')) {
  fs.writeFileSync('Back-End/.env', backendEnv);
  console.log('✅ Created backend .env file');
} else {
  console.log('ℹ️  Backend .env file already exists');
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: 'Back-End', stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start MongoDB service');
console.log('2. Run: cd Back-End && npm run create-admin');
console.log('3. Run: cd Back-End && npm run seed (optional)');
console.log('4. Start backend: cd Back-End && npm start');
console.log('5. Start frontend: npm run dev');
console.log('\n🔑 Default login: admin@4dots.com / admin123');
console.log('\n📖 See README.md for detailed instructions');
