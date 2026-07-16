const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // DNS fix for MongoDB SRV

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Seed default Admin user
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@system.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      // Pass plain password directly so Mongoose pre-save hook hashes it once
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'Admin'
      });
      console.log(`✅ Default Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Default Admin already exists.`);
    }
  } catch (error) {
    console.error('Error seeding Admin user:', error.message);
  }
};

// Start Server Wrapper
const startServer = async () => {
  try {
    // 1. Connect DB first
    await connectDB();

    // 2. Seed Admin after connection is ready
    await seedAdmin();

    // 3. Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/requests', require('./routes/requestRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));

    // Global Error Middleware
    app.use(errorHandler);

    // 4. Start HTTP listener
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();