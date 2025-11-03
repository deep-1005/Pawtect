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

async function exportDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    const exportData = {
      animals: await Animal.find({}),
      shelters: await Shelter.find({}),
      ngos: await NGO.find({}),
      users: await User.find({}),
      crueltyReports: await CrueltyReport.find({}),
      donations: await Donation.find({})
    };

    const exportDir = path.join(__dirname, 'database-backup');
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Save each collection as JSON
    fs.writeFileSync(
      path.join(exportDir, 'animals.json'),
      JSON.stringify(exportData.animals, null, 2)
    );
    fs.writeFileSync(
      path.join(exportDir, 'shelters.json'),
      JSON.stringify(exportData.shelters, null, 2)
    );
    fs.writeFileSync(
      path.join(exportDir, 'ngos.json'),
      JSON.stringify(exportData.ngos, null, 2)
    );
    fs.writeFileSync(
      path.join(exportDir, 'users.json'),
      JSON.stringify(exportData.users, null, 2)
    );
    fs.writeFileSync(
      path.join(exportDir, 'crueltyReports.json'),
      JSON.stringify(exportData.crueltyReports, null, 2)
    );
    fs.writeFileSync(
      path.join(exportDir, 'donations.json'),
      JSON.stringify(exportData.donations, null, 2)
    );

    console.log('✅ Database exported successfully!');
    console.log(`📁 Location: ${exportDir}`);
    console.log('📊 Stats:');
    console.log(`   - Animals: ${exportData.animals.length}`);
    console.log(`   - Shelters: ${exportData.shelters.length}`);
    console.log(`   - NGOs: ${exportData.ngos.length}`);
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Cruelty Reports: ${exportData.crueltyReports.length}`);
    console.log(`   - Donations: ${exportData.donations.length}`);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

exportDatabase();
