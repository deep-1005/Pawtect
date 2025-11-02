const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/pawtect')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const Animal = require('./models/Animal');
const Shelter = require('./models/Shelter');
const User = require('./models/User');

async function checkDatabase() {
  try {
    console.log('\n=== DATABASE STATISTICS ===\n');
    
    // Count documents
    const animalCount = await Animal.countDocuments();
    const shelterCount = await Shelter.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`🐕 Animals: ${animalCount}`);
    console.log(`🏠 Shelters: ${shelterCount}`);
    console.log(`👤 Users: ${userCount}`);
    
    console.log('\n=== LATEST 5 ANIMALS ===\n');
    const animals = await Animal.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('paw_id name breed status createdAt');
    
    animals.forEach((animal, index) => {
      console.log(`${index + 1}. ${animal.name || 'Unnamed'} (${animal.paw_id})`);
      console.log(`   Breed: ${animal.breed} | Status: ${animal.status}`);
      console.log(`   Added: ${animal.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    console.log('\n=== ALL SHELTERS ===\n');
    const shelters = await Shelter.find().select('name capacity statistics');
    
    shelters.forEach((shelter, index) => {
      console.log(`${index + 1}. ${shelter.name}`);
      console.log(`   Capacity: ${shelter.capacity?.current || 0}/${shelter.capacity?.total || 0}`);
      console.log(`   Animals: ${shelter.animals?.length || 0}`);
      console.log(`   Donations: ${shelter.funding?.donations?.length || 0}`);
      console.log('');
    });
    
    console.log('\n✅ Database check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the check
checkDatabase();
