# 4Dots Transport Management System

A comprehensive full-stack transport management system built with React (Frontend) and Node.js/Express (Backend) with MongoDB database.

## 🚀 Features

- **Dashboard**: Real-time analytics and overview
- **Trip Management**: Create, track, and manage transport trips
- **Driver Management**: Driver profiles with Akama numbers and salary tracking
- **Vendor Management**: Vendor information and payment tracking
- **Car Maintenance**: Maintenance records and cost tracking
- **Reports**: Comprehensive reporting with PDF export
- **Authentication**: JWT-based user authentication
- **Real-time Updates**: Socket.io for live data updates

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dots-transit-nexus-main
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Back-End

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# OR create .env file manually with the following content:
```

**Backend Environment Variables (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/haramain_transport
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install dependencies
npm install

# Create environment file
:
```

**Frontend Environment Variables (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

```bash
# Start MongoDB service (Windows)
net start MongoDB

# OR (Linux/Mac)
sudo systemctl start mongod

# Create admin user
cd Back-End
npm run create-admin
```

### 5. Seed Database (Optional)

```bash
# Navigate to backend directory
cd Back-End

# Seed with sample data
npm run seed
```

## 🚀 Running the Application

### Start Backend Server

```bash
# Navigate to backend directory
cd Back-End

# Start the server
npm start
# OR for development
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
# Navigate to root directory
cd ..

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:3000` (or next available port)

## 📁 Project Structure

```
dots-transit-nexus-main/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components (Sidebar, Header)
│   │   └── ui/                  # Base UI components
│   ├── context/                 # React Context (Auth)
│   ├── lib/                     # Utility functions
│   ├── pages/                   # Page components
│   └── assets/                  # Static assets
├── Back-End/                    # Backend Node.js application
│   ├── controllers/             # Route controllers
│   ├── middleware/              # Custom middleware
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API routes
│   ├── scripts/                 # Database scripts
│   └── server.js               # Main server file
├── .env                        # Frontend environment variables
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

## 🔑 Default Login Credentials

After running the create-admin script, use these credentials:

- **Email**: admin@4dots.com
- **Password**: admin123

## 🛠️ Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Scripts
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run create-admin # Create default admin user
npm run seed         # Seed database with sample data
```

## 🔧 Configuration

### Backend Configuration

- **Port**: 5000 (configurable via PORT env variable)
- **Database**: MongoDB (configurable via MONGODB_URI)
- **CORS**: Configured for multiple localhost ports
- **JWT**: Token-based authentication

### Frontend Configuration

- **Port**: 3000+ (auto-assigned by Vite)
- **API URL**: Points to backend server
- **Socket URL**: Real-time updates

## 📊 Database Models

- **User**: Authentication and user management
- **Driver**: Driver information with Akama numbers
- **Vendor**: Vendor details and payments
- **Trip**: Trip management and tracking
- **Maintenance**: Car maintenance records

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- Helmet.js security headers

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **CORS Errors**
   - Verify CORS_ORIGIN in backend .env
   - Check frontend VITE_API_URL

3. **Port Already in Use**
   - Change PORT in backend .env
   - Vite will auto-assign available port for frontend

4. **Build Errors**
   - Run `npm install` in both directories
   - Check Node.js version compatibility

### Logs

- Backend logs: Check terminal where backend is running
- Frontend logs: Check browser console
- Database logs: Check MongoDB logs

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Reports
- `GET /api/reports` - Get analytics and reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Check browser console for errors
- Verify all environment variables are set correctly

---

**Note**: This is a transport management system designed for Saudi Arabia, with features like Akama number validation for drivers. Make sure to understand the local requirements before deployment.
