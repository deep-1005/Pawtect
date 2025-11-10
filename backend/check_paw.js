const mongoose = require('mongoose');
const Animal = require('./models/Animal');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pawtect';

async function run() {
  try {
    console.log('Connecting to', MONGO_URI);
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected. Searching for PAW-MHGN1MSX-C5TL...');
    const paw = 'PAW-MHGN1MSX-C5TL';
    const dog = await Animal.findOne({ paw_id: paw }).lean();
    if (!dog) {
      console.log('No dog found for', paw);
    } else {
      console.log('Found dog:', JSON.stringify(dog, null, 2));
    }
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Error during DB check:', err);
    process.exit(1);
  }
}

run();
