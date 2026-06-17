const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'rokesh@vitalnet.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('2006', salt);
      
      await User.collection.insertOne({
        name: 'System Administrator',
        email: 'rokesh@vitalnet.com',
        password: hashedPassword,
        role: 'admin',
        phoneNumber: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user seeded successfully.');
    }
  } catch (error) {
    console.error(`Error seeding admin user: ${error.message}`);
  }
};

const seedPatient = async () => {
  try {
    const patientExists = await User.findOne({ email: 'patient@vitalnet.com' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    if (!patientExists) {
      await User.collection.insertOne({
        name: 'Patient',
        email: 'patient@vitalnet.com',
        password: hashedPassword,
        role: 'patient',
        phoneNumber: '+1 555-0199',
        address: '742 Evergreen Terrace',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Default patient seeded successfully.');
    } else {
      // Ensure the seeded patient password matches 'password123' and name is 'Patient'
      await User.updateOne({ email: 'patient@vitalnet.com' }, { $set: { password: hashedPassword, name: 'Patient' } });
      if (!patientExists.address) {
        await User.updateOne({ email: 'patient@vitalnet.com' }, { $set: { address: '742 Evergreen Terrace' } });
      }
    }
    
    // Auto-update Stark's address if they previously registered without one
    await User.updateOne({ email: 'stark@gmail.com', address: { $in: [null, '', 'N/A'] } }, { $set: { address: 'Salem' } });
  } catch (error) {
    console.error(`Error seeding patient: ${error.message}`);
  }
};

const seedHospital = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Delete default hospital user if they exist
    const defaultUser = await User.findOne({ email: 'hospital@vitalnet.com' });
    if (defaultUser) {
      const hospitalProfile = await Hospital.findOne({ userId: defaultUser._id });
      if (hospitalProfile) {
        await Resource.deleteMany({ hospitalId: hospitalProfile._id });
        await Hospital.deleteOne({ _id: hospitalProfile._id });
      }
      await User.deleteOne({ _id: defaultUser._id });
      console.log('Removed default hospital@vitalnet.com.');
    }

    // 2. Reset passwords of manually created/existing test hospitals so they can log in
    const testHospitals = ['manipal@hospital.com', 'apollo@hospital.com'];
    for (const email of testHospitals) {
      const user = await User.findOne({ email });
      if (user) {
        await User.updateOne({ email }, { $set: { password: hashedPassword } });
        console.log(`Password reset to 'password123' for ${email}`);
      }
    }
  } catch (error) {
    console.error(`Error seeding/updating hospitals: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vitalnet');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
    await seedPatient();
    await seedHospital();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
