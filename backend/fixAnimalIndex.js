const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/pawtect')
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Drop the problematic index
    try {
      const db = mongoose.connection.db;
      await db.collection('animals').dropIndex('pawId_1');
      console.log('✅ Dropped old pawId_1 index');
    } catch (err) {
      console.log('ℹ️  pawId_1 index does not exist or already dropped');
    }
    
    mongoose.connection.close();
    console.log('✅ Done! You can now run populateDogs.js');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });
