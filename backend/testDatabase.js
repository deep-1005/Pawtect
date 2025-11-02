const mongoose = require('mongoose');
const Animal = require('./models/Animal');

mongoose.connect('mongodb://127.0.0.1:27017/pawtect');

async function testAddDog() {
  console.log('\n📝 Adding test dog...\n');
  
  // Count before
  const countBefore = await Animal.countDocuments();
  console.log(`🔢 Animals before: ${countBefore}`);
  
  // Add new test dog
  const testDog = await Animal.create({
    paw_id: `PAW-TEST-${Date.now()}`,
    animalId: `PAW-TEST-${Date.now()}`,
    name: 'Test Dog',
    species: 'Dog',
    breed: 'Test Breed',
    age: 'Adult',
    gender: 'Male',
    status: 'Rescued',
    healthStatus: {
      vaccinated: false,
      sterilized: false,
      injured: false,
      medicalNotes: 'Test dog for database verification'
    },
    location: {
      rescueLocation: {
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State'
      }
    }
  });
  
  console.log(`✅ Test dog added successfully!`);
  console.log(`   PAW ID: ${testDog.paw_id}`);
  console.log(`   Name: ${testDog.name}`);
  console.log(`   ID: ${testDog._id}`);
  
  // Count after
  const countAfter = await Animal.countDocuments();
  console.log(`\n🔢 Animals after: ${countAfter}`);
  console.log(`📈 Difference: +${countAfter - countBefore}`);
  
  console.log('\n✅ DATABASE IS WORKING! New data was added successfully.\n');
  
  // Clean up - remove test dog
  await Animal.findByIdAndDelete(testDog._id);
  console.log('🗑️  Test dog removed (cleanup)\n');
  
  process.exit(0);
}

testAddDog().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
