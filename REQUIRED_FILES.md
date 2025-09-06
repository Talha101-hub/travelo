# 📁 Required Files for Deployment

## Essential Files & Directories

### Frontend (Root Directory)
```
├── src/                          # Main source code
│   ├── components/               # UI components
│   ├── context/                  # React contexts
│   ├── lib/                      # Utilities
│   ├── pages/                    # Page components
│   └── assets/                   # Static assets
├── public/                       # Public assets
├── .env                         # Frontend environment variables
├── .env.example                 # Environment template
├── package.json                 # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── index.html                   # Main HTML file
```

### Backend (Back-End Directory)
```
├── Back-End/
│   ├── controllers/              # API controllers
│   ├── middleware/               # Custom middleware
│   ├── models/                   # Database schemas
│   ├── routes/                   # API routes
│   ├── scripts/                  # Database scripts
│   ├── config/                   # Configuration files
│   ├── .env                     # Backend environment variables
│   ├── .env.example             # Environment template
│   ├── package.json             # Backend dependencies
│   └── server.js                # Main server file
```

## Environment Files Required

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (Back-End/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/haramain_transport
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8083
```

## Key Configuration Files

1. **package.json** (Root) - Frontend dependencies and scripts
2. **Back-End/package.json** - Backend dependencies and scripts
3. **vite.config.ts** - Frontend build configuration
4. **tsconfig.json** - TypeScript configuration
5. **tailwind.config.js** - CSS framework configuration
6. **Back-End/server.js** - Main backend server

## Database Requirements

- **MongoDB** running on default port (27017)
- **Database name**: haramain_transport
- **Collections**: users, drivers, vendors, trips, maintenance

## System Requirements

- **Node.js** v16 or higher
- **MongoDB** v4.4 or higher
- **Git** (for cloning)
- **npm** (comes with Node.js)

## Optional Files

- **README.md** - Documentation
- **QUICK_START.md** - Quick setup guide
- **setup.js** - Automated setup script
- **.gitignore** - Git ignore rules

## Missing Files to Create

If any of these files are missing, they need to be created:

1. **Environment files** (.env in both directories)
2. **Database connection** (MongoDB running)
3. **Admin user** (run create-admin script)
4. **Sample data** (run seed script)

## Deployment Checklist

- [ ] All source files present
- [ ] Environment files configured
- [ ] Dependencies installed (npm install)
- [ ] MongoDB running
- [ ] Admin user created
- [ ] Database seeded (optional)
- [ ] Backend server running
- [ ] Frontend server running
- [ ] CORS configured correctly
- [ ] Authentication working
