const mongoose = require('mongoose');
const Animal = require('./models/Animal');
const Shelter = require('./models/Shelter');

mongoose.connect('mongodb://127.0.0.1:27017/pawtect')
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Delete all animals
    const deleteResult = await Animal.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} animals`);
    
    // Reset shelter animal counts
    await Shelter.updateMany({}, {
      $set: {
        animals: [],
        'capacity.current': 0,
        'statistics.currentAnimals': 0
      }
    });
    
    // Update available capacity
    const shelters = await Shelter.find();
    for (const shelter of shelters) {
      const available = shelter.capacity.total - shelter.capacity.current;
      await Shelter.findByIdAndUpdate(shelter._id, {
        'capacity.available': available
      });
    }
    
    console.log('✅ Reset all shelters');
    console.log('✅ Database ready for fresh dog population!');
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
