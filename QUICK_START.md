# 🚀 Quick Start Guide

## Prerequisites
- Node.js (v16+)
- MongoDB
- Git

## 1. Clone & Setup
```bash
git clone <repository-url>
cd dots-transit-nexus-main
node setup.js
```

## 2. Start MongoDB
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

## 3. Create Admin User
```bash
cd Back-End
npm run create-admin
```

## 4. Seed Database (Optional)
```bash
npm run seed
```

## 5. Start Application
```bash
# Terminal 1 - Backend
cd Back-End
npm start

# Terminal 2 - Frontend
cd ..
npm run dev
```

## 6. Access Application
- Frontend: http://localhost:3000 (or next available port)
- Backend: http://localhost:5000
- Login: admin@4dots.com / admin123

## 🔧 Environment Files Created
- `.env` (Frontend)
- `Back-End/.env` (Backend)

## 🆘 Troubleshooting
- Check MongoDB is running
- Verify ports 3000 and 5000 are available
- Check console for errors
- See README.md for detailed troubleshooting
