require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const Trip = require('../models/Trip');
const CarMaintenance = require('../models/CarMaintenance');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/haramain_transport');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleDrivers = [
  {
    name: 'Ahmed Ali Al-Rashid',
    carNumber: 'ABC-123',
    carModel: 'Toyota Hiace',
    akamaNumber: '1234567890',
    driverSalary: 3500,
    driverMeal: 200,
    roomRent: 500,
    furtherExpense: 100,
    status: 'active'
  },
  {
    name: 'Omar Hassan Al-Mansouri',
    carNumber: 'DEF-456',
    carModel: 'Mercedes Sprinter',
    akamaNumber: '2345678901',
    driverSalary: 4000,
    driverMeal: 250,
    roomRent: 600,
    furtherExpense: 150,
    status: 'active'
  },
  {
    name: 'Mohamed Khan Al-Zahrani',
    carNumber: 'GHI-789',
    carModel: 'Ford Transit',
    akamaNumber: '3456789012',
    driverSalary: 3200,
    driverMeal: 180,
    roomRent: 450,
    furtherExpense: 80,
    status: 'active'
  },
  {
    name: 'Ali Ibrahim Al-Ghamdi',
    carNumber: 'JKL-012',
    carModel: 'Toyota Coaster',
    akamaNumber: '4567890123',
    driverSalary: 3800,
    driverMeal: 220,
    roomRent: 550,
    furtherExpense: 120,
    status: 'inactive'
  },
  {
    name: 'Yusuf Abdullah Al-Shehri',
    carNumber: 'MNO-345',
    carModel: 'Isuzu NPR',
    akamaNumber: '5678901234',
    driverSalary: 3600,
    driverMeal: 200,
    roomRent: 500,
    furtherExpense: 100,
    status: 'active'
  },
  {
    name: 'Khalid Mohammed Al-Sulaimani',
    carNumber: 'PQR-678',
    carModel: 'Hyundai H350',
    akamaNumber: '6789012345',
    driverSalary: 3300,
    driverMeal: 190,
    roomRent: 480,
    furtherExpense: 90,
    status: 'active'
  },
  {
    name: 'Abdul Rahman Al-Qurashi',
    carNumber: 'STU-901',
    carModel: 'Nissan Civilian',
    akamaNumber: '7890123456',
    driverSalary: 3700,
    driverMeal: 210,
    roomRent: 520,
    furtherExpense: 110,
    status: 'active'
  },
  {
    name: 'Saeed Al-Makki',
    carNumber: 'VWX-234',
    carModel: 'Mitsubishi Rosa',
    akamaNumber: '8901234567',
    driverSalary: 3100,
    driverMeal: 170,
    roomRent: 420,
    furtherExpense: 70,
    status: 'inactive'
  },
  {
    name: 'Fahad Al-Rashid',
    carNumber: 'YZA-567',
    carModel: 'Toyota Hiace',
    akamaNumber: '9012345678',
    driverSalary: 3400,
    driverMeal: 200,
    roomRent: 500,
    furtherExpense: 100,
    status: 'active'
  },
  {
    name: 'Nasser Al-Ghamdi',
    carNumber: 'BCD-890',
    carModel: 'Mercedes Sprinter',
    akamaNumber: '0123456789',
    driverSalary: 4200,
    driverMeal: 250,
    roomRent: 650,
    furtherExpense: 150,
    status: 'active'
  }
];

const sampleVendors = [
  {
    name: 'Al-Haramain Travel Agency',
    email: 'contact@alharamain.com',
    phone: '+966501234567',
    payments: 15000,
    paymentAsked: 18000,
    status: 'active',
    address: 'Makkah, Saudi Arabia',
    contactPerson: 'Abdul Rahman Al-Makki'
  },
  {
    name: 'Makkah Express Tours',
    email: 'info@makkahexpress.com',
    phone: '+966502345678',
    payments: 22000,
    paymentAsked: 22000,
    status: 'paid',
    address: 'Madinah, Saudi Arabia',
    contactPerson: 'Saeed Al-Madani'
  },
  {
    name: 'Madinah Transport Co.',
    email: 'admin@madinahtransport.sa',
    phone: '+966503456789',
    payments: 8500,
    paymentAsked: 12000,
    status: 'pending',
    address: 'Jeddah, Saudi Arabia',
    contactPerson: 'Khalid Al-Jeddawi'
  },
  {
    name: 'Hajj & Umrah Services',
    email: 'services@hajjumrah.sa',
    phone: '+966504567890',
    payments: 30000,
    paymentAsked: 35000,
    status: 'active',
    address: 'Riyadh, Saudi Arabia',
    contactPerson: 'Fahad Al-Riyadhi'
  },
  {
    name: 'Sacred Journey Transport',
    email: 'info@sacredjourney.com',
    phone: '+966505678901',
    payments: 0,
    paymentAsked: 15000,
    status: 'pending',
    address: 'Taif, Saudi Arabia',
    contactPerson: 'Ibrahim Al-Taifi'
  },
  {
    name: 'Golden Gate Transport',
    email: 'info@goldengate.sa',
    phone: '+966506789012',
    payments: 12000,
    paymentAsked: 15000,
    status: 'active',
    address: 'Dammam, Saudi Arabia',
    contactPerson: 'Mohammed Al-Dammami'
  },
  {
    name: 'Holy Land Express',
    email: 'contact@holyland.sa',
    phone: '+966507890123',
    payments: 25000,
    paymentAsked: 28000,
    status: 'paid',
    address: 'Al-Khobar, Saudi Arabia',
    contactPerson: 'Ahmed Al-Khobari'
  },
  {
    name: 'Pilgrim Transport Solutions',
    email: 'admin@pilgrimtransport.com',
    phone: '+966508901234',
    payments: 5000,
    paymentAsked: 12000,
    status: 'pending',
    address: 'Yanbu, Saudi Arabia',
    contactPerson: 'Omar Al-Yanbawi'
  }
];

const sampleMaintenance = [
  // Completed maintenance
  {
    carNumber: 'ABC-123',
    carModel: 'Toyota Hiace',
    maintenanceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    cost: 450,
    description: 'Oil change, brake pad replacement, general inspection',
    maintenanceType: 'routine',
    serviceProvider: 'Al-Najd Auto Service',
    status: 'completed'
  },
  {
    carNumber: 'DEF-456',
    carModel: 'Mercedes Sprinter',
    maintenanceDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    cost: 850,
    description: 'Engine service, transmission check, tire rotation',
    maintenanceType: 'repair',
    serviceProvider: 'German Auto Center',
    status: 'completed'
  },
  {
    carNumber: 'GHI-789',
    carModel: 'Ford Transit',
    maintenanceDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    cost: 320,
    description: 'Air filter replacement, battery check, light inspection',
    maintenanceType: 'inspection',
    serviceProvider: 'Ford Service Center',
    status: 'completed'
  },
  {
    carNumber: 'MNO-345',
    carModel: 'Isuzu NPR',
    maintenanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    cost: 280,
    description: 'Regular maintenance, fluid top-up',
    maintenanceType: 'routine',
    serviceProvider: 'Isuzu Service',
    status: 'completed'
  },
  {
    carNumber: 'PQR-678',
    carModel: 'Hyundai H350',
    maintenanceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    cost: 380,
    description: 'Brake system check, tire alignment',
    maintenanceType: 'routine',
    serviceProvider: 'Hyundai Service Center',
    status: 'completed'
  },
  {
    carNumber: 'STU-901',
    carModel: 'Nissan Civilian',
    maintenanceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    cost: 520,
    description: 'AC system maintenance, door mechanism check',
    maintenanceType: 'repair',
    serviceProvider: 'Nissan Service',
    status: 'completed'
  },
  
  // In-progress maintenance
  {
    carNumber: 'JKL-012',
    carModel: 'Toyota Coaster',
    maintenanceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    cost: 680,
    description: 'AC system repair, door mechanism fix',
    maintenanceType: 'repair',
    serviceProvider: 'Toyota Service',
    status: 'in-progress'
  },
  {
    carNumber: 'VWX-234',
    carModel: 'Mitsubishi Rosa',
    maintenanceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    cost: 420,
    description: 'Engine diagnostic, transmission check',
    maintenanceType: 'inspection',
    serviceProvider: 'Mitsubishi Service',
    status: 'in-progress'
  },
  
  // Scheduled maintenance
  {
    carNumber: 'ABC-123',
    carModel: 'Toyota Hiace',
    maintenanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    cost: 350,
    description: 'Regular service, oil change, filter replacement',
    maintenanceType: 'routine',
    serviceProvider: 'Al-Najd Auto Service',
    status: 'scheduled'
  },
  {
    carNumber: 'DEF-456',
    carModel: 'Mercedes Sprinter',
    maintenanceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    cost: 1200,
    description: 'Major service, timing belt replacement',
    maintenanceType: 'repair',
    serviceProvider: 'German Auto Center',
    status: 'scheduled'
  },
  {
    carNumber: 'GHI-789',
    carModel: 'Ford Transit',
    maintenanceDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    cost: 480,
    description: 'Brake pad replacement, tire rotation',
    maintenanceType: 'routine',
    serviceProvider: 'Ford Service Center',
    status: 'scheduled'
  },
  {
    carNumber: 'MNO-345',
    carModel: 'Isuzu NPR',
    maintenanceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    cost: 320,
    description: 'General inspection, fluid check',
    maintenanceType: 'inspection',
    serviceProvider: 'Isuzu Service',
    status: 'scheduled'
  },
  {
    carNumber: 'PQR-678',
    carModel: 'Hyundai H350',
    maintenanceDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    cost: 650,
    description: 'AC system service, electrical check',
    maintenanceType: 'repair',
    serviceProvider: 'Hyundai Service Center',
    status: 'scheduled'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Driver.deleteMany({});
    await Vendor.deleteMany({});
    await Trip.deleteMany({});
    await CarMaintenance.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Insert sample data
    const drivers = await Driver.insertMany(sampleDrivers);
    console.log(`✅ Created ${drivers.length} drivers`);

    const vendors = await Vendor.insertMany(sampleVendors);
    console.log(`✅ Created ${vendors.length} vendors`);

    const maintenance = await CarMaintenance.insertMany(sampleMaintenance);
    console.log(`✅ Created ${maintenance.length} maintenance records`);

    // Create sample trips using the created drivers and vendors
    const sampleTrips = [
      // Historical completed trips (past 25 days)
      {
        startingPlace: 'Jeddah',
        destination: 'Makkah',
        budget: 650,
        tripDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        driver: drivers[1]._id,
        vendor: vendors[1]._id,
        carNumber: 'DEF-456',
        status: 'complete',
        actualCost: 620,
        notes: 'Airport pickup service',
        completedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Riyadh',
        destination: 'Makkah',
        budget: 1200,
        tripDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
        driver: drivers[2]._id,
        vendor: vendors[2]._id,
        carNumber: 'GHI-789',
        status: 'complete',
        actualCost: 1150,
        notes: 'Long distance transport',
        completedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Makkah',
        destination: 'Jeddah',
        budget: 450,
        tripDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // 23 days ago
        driver: drivers[0]._id,
        vendor: vendors[0]._id,
        carNumber: 'ABC-123',
        status: 'complete',
        actualCost: 420,
        notes: 'Airport drop service',
        completedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Dammam',
        destination: 'Madinah',
        budget: 950,
        tripDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
        driver: drivers[5]._id,
        vendor: vendors[5]._id,
        carNumber: 'PQR-678',
        status: 'complete',
        actualCost: 900,
        notes: 'Coastal route transport',
        completedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Al-Khobar',
        destination: 'Makkah',
        budget: 1100,
        tripDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        driver: drivers[6]._id,
        vendor: vendors[6]._id,
        carNumber: 'STU-901',
        status: 'complete',
        actualCost: 1050,
        notes: 'Business transport',
        completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Taif',
        destination: 'Madinah',
        budget: 750,
        tripDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        driver: drivers[4]._id,
        vendor: vendors[3]._id,
        carNumber: 'MNO-345',
        status: 'complete',
        actualCost: 720,
        notes: 'Mountain route transport',
        completedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Yanbu',
        destination: 'Makkah',
        budget: 680,
        tripDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), // 19 days ago
        driver: drivers[7]._id,
        vendor: vendors[7]._id,
        carNumber: 'VWX-234',
        status: 'complete',
        actualCost: 650,
        notes: 'Industrial transport',
        completedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Jeddah',
        destination: 'Madinah',
        budget: 720,
        tripDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        driver: drivers[1]._id,
        vendor: vendors[1]._id,
        carNumber: 'DEF-456',
        status: 'complete',
        actualCost: 690,
        notes: 'Airport to holy city',
        completedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Makkah',
        destination: 'Taif',
        budget: 580,
        tripDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), // 17 days ago
        driver: drivers[3]._id,
        vendor: vendors[4]._id,
        carNumber: 'JKL-012',
        status: 'complete',
        actualCost: 550,
        notes: 'Mountain retreat transport',
        completedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Dammam',
        destination: 'Jeddah',
        budget: 1300,
        tripDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
        driver: drivers[5]._id,
        vendor: vendors[5]._id,
        carNumber: 'PQR-678',
        status: 'complete',
        actualCost: 1250,
        notes: 'Cross-country transport',
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Al-Khobar',
        destination: 'Madinah',
        budget: 980,
        tripDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        driver: drivers[6]._id,
        vendor: vendors[6]._id,
        carNumber: 'STU-901',
        status: 'complete',
        actualCost: 950,
        notes: 'Business pilgrimage',
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Yanbu',
        destination: 'Makkah',
        budget: 650,
        tripDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        driver: drivers[7]._id,
        vendor: vendors[7]._id,
        carNumber: 'VWX-234',
        status: 'complete',
        actualCost: 620,
        notes: 'Industrial pilgrimage',
        completedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Riyadh',
        destination: 'Madinah',
        budget: 1400,
        tripDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
        driver: drivers[2]._id,
        vendor: vendors[2]._id,
        carNumber: 'GHI-789',
        status: 'complete',
        actualCost: 1350,
        notes: 'Long distance pilgrimage',
        completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Makkah',
        destination: 'Jeddah',
        budget: 450,
        tripDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        driver: drivers[0]._id,
        vendor: vendors[0]._id,
        carNumber: 'ABC-123',
        status: 'complete',
        actualCost: 420,
        notes: 'Airport drop service',
        completedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Taif',
        destination: 'Makkah',
        budget: 600,
        tripDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
        driver: drivers[4]._id,
        vendor: vendors[3]._id,
        carNumber: 'MNO-345',
        status: 'complete',
        actualCost: 580,
        notes: 'Mountain to holy city',
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Jeddah',
        destination: 'Makkah',
        budget: 650,
        tripDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        driver: drivers[1]._id,
        vendor: vendors[1]._id,
        carNumber: 'DEF-456',
        status: 'complete',
        actualCost: 620,
        notes: 'Airport pickup service',
        completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Dammam',
        destination: 'Makkah',
        budget: 1100,
        tripDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        driver: drivers[5]._id,
        vendor: vendors[5]._id,
        carNumber: 'PQR-678',
        status: 'complete',
        actualCost: 1050,
        notes: 'Coastal to holy city',
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Al-Khobar',
        destination: 'Madinah',
        budget: 980,
        tripDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        driver: drivers[6]._id,
        vendor: vendors[6]._id,
        carNumber: 'STU-901',
        status: 'complete',
        actualCost: 950,
        notes: 'Business pilgrimage',
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Yanbu',
        destination: 'Makkah',
        budget: 680,
        tripDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        driver: drivers[7]._id,
        vendor: vendors[7]._id,
        carNumber: 'VWX-234',
        status: 'complete',
        actualCost: 650,
        notes: 'Industrial pilgrimage',
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Riyadh',
        destination: 'Makkah',
        budget: 1200,
        tripDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        driver: drivers[2]._id,
        vendor: vendors[2]._id,
        carNumber: 'GHI-789',
        status: 'complete',
        actualCost: 1150,
        notes: 'Long distance transport',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Makkah',
        destination: 'Jeddah',
        budget: 450,
        tripDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        driver: drivers[0]._id,
        vendor: vendors[0]._id,
        carNumber: 'ABC-123',
        status: 'complete',
        actualCost: 420,
        notes: 'Airport drop service',
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Taif',
        destination: 'Madinah',
        budget: 750,
        tripDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        driver: drivers[4]._id,
        vendor: vendors[3]._id,
        carNumber: 'MNO-345',
        status: 'complete',
        actualCost: 720,
        notes: 'Mountain route transport',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Jeddah',
        destination: 'Makkah',
        budget: 650,
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        driver: drivers[1]._id,
        vendor: vendors[1]._id,
        carNumber: 'DEF-456',
        status: 'complete',
        actualCost: 620,
        notes: 'Airport pickup service',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Dammam',
        destination: 'Madinah',
        budget: 950,
        tripDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        driver: drivers[5]._id,
        vendor: vendors[5]._id,
        carNumber: 'PQR-678',
        status: 'complete',
        actualCost: 900,
        notes: 'Coastal route transport',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Al-Khobar',
        destination: 'Makkah',
        budget: 1100,
        tripDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        driver: drivers[6]._id,
        vendor: vendors[6]._id,
        carNumber: 'STU-901',
        status: 'complete',
        actualCost: 1050,
        notes: 'Business transport',
        completedAt: new Date(Date.now())
      },
      // Current ongoing trips
      {
        startingPlace: 'Makkah',
        destination: 'Madinah',
        budget: 850,
        tripDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        driver: drivers[0]._id,
        vendor: vendors[0]._id,
        carNumber: 'ABC-123',
        status: 'ongoing',
        actualCost: 0,
        notes: 'Pilgrimage transport service'
      },
      {
        startingPlace: 'Taif',
        destination: 'Madinah',
        budget: 750,
        tripDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        driver: drivers[4]._id,
        vendor: vendors[3]._id,
        carNumber: 'MNO-345',
        status: 'ongoing',
        actualCost: 0,
        notes: 'Mountain route transport'
      },
      {
        startingPlace: 'Yanbu',
        destination: 'Makkah',
        budget: 680,
        tripDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        driver: drivers[7]._id,
        vendor: vendors[7]._id,
        carNumber: 'VWX-234',
        status: 'ongoing',
        actualCost: 0,
        notes: 'Industrial transport'
      },
      
      // Future pending trips
      {
        startingPlace: 'Riyadh',
        destination: 'Makkah',
        budget: 1200,
        tripDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        driver: drivers[2]._id,
        vendor: vendors[2]._id,
        carNumber: 'GHI-789',
        status: 'pending',
        actualCost: 0,
        notes: 'Long distance transport'
      },
      {
        startingPlace: 'Jeddah',
        destination: 'Madinah',
        budget: 720,
        tripDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        driver: drivers[1]._id,
        vendor: vendors[1]._id,
        carNumber: 'DEF-456',
        status: 'pending',
        actualCost: 0,
        notes: 'Airport to holy city'
      },
      {
        startingPlace: 'Makkah',
        destination: 'Taif',
        budget: 580,
        tripDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        driver: drivers[3]._id,
        vendor: vendors[4]._id,
        carNumber: 'JKL-012',
        status: 'pending',
        actualCost: 0,
        notes: 'Mountain retreat transport'
      },
      {
        startingPlace: 'Dammam',
        destination: 'Jeddah',
        budget: 1300,
        tripDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        driver: drivers[5]._id,
        vendor: vendors[5]._id,
        carNumber: 'PQR-678',
        status: 'pending',
        actualCost: 0,
        notes: 'Cross-country transport'
      },
      {
        startingPlace: 'Al-Khobar',
        destination: 'Madinah',
        budget: 980,
        tripDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        driver: drivers[6]._id,
        vendor: vendors[6]._id,
        carNumber: 'STU-901',
        status: 'pending',
        actualCost: 0,
        notes: 'Business pilgrimage'
      },
      {
        startingPlace: 'Yanbu',
        destination: 'Makkah',
        budget: 650,
        tripDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        driver: drivers[7]._id,
        vendor: vendors[7]._id,
        carNumber: 'VWX-234',
        status: 'pending',
        actualCost: 0,
        notes: 'Industrial pilgrimage'
      },
      {
        startingPlace: 'Makkah',
        destination: 'Jeddah',
        budget: 450,
        tripDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        driver: drivers[0]._id,
        vendor: vendors[0]._id,
        carNumber: 'ABC-123',
        status: 'pending',
        actualCost: 0,
        notes: 'Airport drop service'
      },
      {
        startingPlace: 'Riyadh',
        destination: 'Makkah',
        budget: 1200,
        tripDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        driver: drivers[2]._id,
        vendor: vendors[2]._id,
        carNumber: 'GHI-789',
        status: 'complete',
        actualCost: 1150,
        notes: 'Long distance transport',
        completedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Dammam',
        destination: 'Madinah',
        budget: 950,
        tripDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        driver: drivers[5]._id,
        vendor: vendors[5]._id,
        carNumber: 'PQR-678',
        status: 'complete',
        actualCost: 900,
        notes: 'Coastal route transport',
        completedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        startingPlace: 'Al-Khobar',
        destination: 'Makkah',
        budget: 1100,
        tripDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        driver: drivers[6]._id,
        vendor: vendors[6]._id,
        carNumber: 'STU-901',
        status: 'complete',
        actualCost: 1050,
        notes: 'Business transport',
        completedAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
      },
      
      // Ongoing trips (current)
      {
        startingPlace: 'Makkah',
        destination: 'Madinah',
        budget: 850,
        tripDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        driver: drivers[0]._id,
        vendor: vendors[0]._id,
        carNumber: 'ABC-123',
        status: 'ongoing',
        actualCost: 0,
        notes: 'Pilgrimage transport service'
      },
      {
        startingPlace: 'Taif',
        destination: 'Madinah',
        budget: 750,
        tripDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        driver: drivers[4]._id,
        vendor: vendors[3]._id,
        carNumber: 'MNO-345',
        status: 'ongoing',
        actualCost: 0,
        notes: 'Mountain route transport'
      },
      {
        startingPlace: 'Yanbu',
        destination: 'Makkah',
        budget: 680,
        tripDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        driver: drivers[7]._id,
        vendor: vendors[7]._id,
        carNumber: 'VWX-234',
        status: 'ongoing',
        actualCost: 0,
        notes: 'Industrial transport'
      },
      
      // Pending trips (future)
      {
        startingPlace: 'Riyadh',
        destination: 'Makkah',
        budget: 1200,
        tripDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        driver: drivers[2]._id,
        vendor: vendors[2]._id,
        carNumber: 'GHI-789',
        status: 'pending',
        actualCost: 0,
        notes: 'Long distance transport'
      },
      {
        startingPlace: 'Jeddah',
        destination: 'Madinah',
        budget: 720,
        tripDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        driver: drivers[1]._id,
        vendor: vendors[1]._id,
        carNumber: 'DEF-456',
        status: 'pending',
        actualCost: 0,
        notes: 'Airport to holy city'
      },
      {
        startingPlace: 'Makkah',
        destination: 'Taif',
        budget: 580,
        tripDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        driver: drivers[3]._id,
        vendor: vendors[4]._id,
        carNumber: 'JKL-012',
        status: 'pending',
        actualCost: 0,
        notes: 'Mountain retreat transport'
      },
      {
        startingPlace: 'Dammam',
        destination: 'Jeddah',
        budget: 1300,
        tripDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        driver: drivers[5]._id,
        vendor: vendors[5]._id,
        carNumber: 'PQR-678',
        status: 'pending',
        actualCost: 0,
        notes: 'Cross-country transport'
      },
      {
        startingPlace: 'Al-Khobar',
        destination: 'Madinah',
        budget: 980,
        tripDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        driver: drivers[6]._id,
        vendor: vendors[6]._id,
        carNumber: 'STU-901',
        status: 'pending',
        actualCost: 0,
        notes: 'Business pilgrimage'
      },
      {
        startingPlace: 'Yanbu',
        destination: 'Makkah',
        budget: 650,
        tripDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        driver: drivers[7]._id,
        vendor: vendors[7]._id,
        carNumber: 'VWX-234',
        status: 'pending',
        actualCost: 0,
        notes: 'Industrial pilgrimage'
      }
    ];

    const trips = await Trip.insertMany(sampleTrips);
    console.log(`✅ Created ${trips.length} trips`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Drivers: ${drivers.length}`);
    console.log(`   - Vendors: ${vendors.length}`);
    console.log(`   - Trips: ${trips.length}`);
    console.log(`   - Maintenance Records: ${maintenance.length}`);

    // Display some sample data
    console.log('\n👥 Sample Drivers:');
    drivers.slice(0, 3).forEach(driver => {
      console.log(`   - ${driver.name} (${driver.carNumber}) - ${driver.status}`);
    });

    console.log('\n🏢 Sample Vendors:');
    vendors.slice(0, 3).forEach(vendor => {
      console.log(`   - ${vendor.name} - ${vendor.status} (${vendor.outstandingBalance} outstanding)`);
    });

    console.log('\n🚗 Sample Trips:');
    trips.slice(0, 3).forEach(trip => {
      console.log(`   - ${trip.startingPlace} → ${trip.destination} - ${trip.status} ($${trip.budget})`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});
