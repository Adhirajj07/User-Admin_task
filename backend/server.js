const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // DNS fix for MongoDB SRV

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Function to seed default Admin automatically
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@system.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
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

// Seed admin right after database connects
seedAdmin();

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));