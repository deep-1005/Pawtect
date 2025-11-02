// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || '*' // restrict in production
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MongoDB connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pawtect';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('⚠️ MongoDB connection error:', err.message || err);
  console.log('⚠️ Running without MongoDB. Please install MongoDB or use MongoDB Atlas.');
  console.log('⚠️ To install MongoDB: https://www.mongodb.com/try/download/community');
});

// --- Mount auth routes ---
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted');
} catch (e) {
  console.error('❌ authRoutes failed to mount:', e.message);
}

// --- Mount rescued dog routes ---
try {
  const rescuedDogRoutes = require('./routes/rescuedDogRoutes');
  app.use('/api/rescued-dogs', rescuedDogRoutes);
  console.log('✅ Rescued dog routes mounted');
} catch (e) {
  console.error('❌ rescuedDogRoutes failed to mount:', e.message);
}

// --- Mount shelter routes ---
try {
  const shelterRoutes = require('./routes/shelterRoutes');
  app.use('/api/shelters', shelterRoutes);
  console.log('✅ Shelter routes mounted');
} catch (e) {
  console.error('❌ shelterRoutes failed to mount:', e.message);
}

// --- Mount NGO routes ---
try {
  const ngoRoutes = require('./routes/ngoRoutes');
  app.use('/api/ngos', ngoRoutes);
  console.log('✅ NGO routes mounted');
} catch (e) {
  console.error('❌ ngoRoutes failed to mount:', e.message);
}

// --- Mount cruelty report routes ---
try {
  const crueltyReportRoutes = require('./routes/crueltyReportRoutes');
  app.use('/api/cruelty-reports', crueltyReportRoutes);
  console.log('✅ Cruelty report routes mounted');
} catch (e) {
  console.error('❌ crueltyReportRoutes failed to mount:', e.message);
}

// --- Mount donation routes ---
try {
  const donationRoutes = require('./routes/donationRoutes');
  app.use('/api/donations', donationRoutes);
  console.log('✅ Donation routes mounted');
} catch (e) {
  console.error('❌ donationRoutes failed to mount:', e.message);
}

// --- Mount chatbot routes ---
try {
  const chatbotRoutes = require('./routes/chatbotRoutes');
  app.use('/api/chatbot', chatbotRoutes);
  console.log('✅ Chatbot routes mounted');
} catch (e) {
  console.error('❌ chatbotRoutes failed to mount:', e.message);
}

// --- Example: mount routes (only if files exist) ---
try {
  const animalRoutes = require('./routes/animalRoutes'); // adjust path if needed
  app.use('/api/animals', animalRoutes);
} catch (e) {
  console.warn('⚠️ animalRoutes not mounted (file may be missing). Continue with demo endpoints.');
}

// --- Demo endpoint (so frontend can fetch) ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', now: new Date().toISOString() });
});

// fallback: simple dogs list if you don't have DB routes yet
app.get('/api/dogs', (req, res) => {
  // example static data while routes are being implemented
  const sample = [
    { id: 'paw1', name: 'Rocky', area: 'Girinagar', lat: 12.935, lng: 77.55 },
    { id: 'paw2', name: 'Bruno', area: 'JP Nagar', lat: 12.91, lng: 77.58 },
    { id: 'paw3', name: 'Luna', area: 'Basavanagudi', lat: 12.94, lng: 77.56 }
  ];
  res.json(sample);
});

// Error handling middleware (nice to keep)
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? (err.message || err) : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐾 Pawtect backend running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://172.16.128.223:${PORT}`);
});
