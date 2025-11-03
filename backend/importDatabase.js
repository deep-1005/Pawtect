const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Animal = require('./models/Animal');
const Shelter = require('./models/Shelter');
const NGO = require('./models/NGO');
const User = require('./models/User');
const CrueltyReport = require('./models/CrueltyReport');
const Donation = require('./models/Donation');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pawtect';

async function importDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    const backupDir = path.join(__dirname, 'database-backup');

    if (!fs.existsSync(backupDir)) {
      console.error('❌ Backup directory not found!');
      console.log('💡 Run exportDatabase.js first to create backup');
      process.exit(1);
    }

    console.log('📥 Importing data...');

    // Read JSON files
    const animals = JSON.parse(fs.readFileSync(path.join(backupDir, 'animals.json')));
    const shelters = JSON.parse(fs.readFileSync(path.join(backupDir, 'shelters.json')));
    const ngos = JSON.parse(fs.readFileSync(path.join(backupDir, 'ngos.json')));
    const users = JSON.parse(fs.readFileSync(path.join(backupDir, 'users.json')));
    const crueltyReports = JSON.parse(fs.readFileSync(path.join(backupDir, 'crueltyReports.json')));
    const donations = JSON.parse(fs.readFileSync(path.join(backupDir, 'donations.json')));

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Animal.deleteMany({});
    await Shelter.deleteMany({});
    await NGO.deleteMany({});
    await User.deleteMany({});
    await CrueltyReport.deleteMany({});
    await Donation.deleteMany({});

    // Import data
    console.log('📤 Inserting data...');
    if (animals.length > 0) await Animal.insertMany(animals);
    if (shelters.length > 0) await Shelter.insertMany(shelters);
    if (ngos.length > 0) await NGO.insertMany(ngos);
    if (users.length > 0) await User.insertMany(users);
    if (crueltyReports.length > 0) await CrueltyReport.insertMany(crueltyReports);
    if (donations.length > 0) await Donation.insertMany(donations);

    console.log('✅ Database imported successfully!');
    console.log('📊 Imported:');
    console.log(`   - Animals: ${animals.length}`);
    console.log(`   - Shelters: ${shelters.length}`);
    console.log(`   - NGOs: ${ngos.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Cruelty Reports: ${crueltyReports.length}`);
    console.log(`   - Donations: ${donations.length}`);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

importDatabase();
