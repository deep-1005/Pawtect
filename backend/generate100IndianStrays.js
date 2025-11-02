const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/pawtect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Animal = require('./models/Animal');
const Shelter = require('./models/Shelter');

// Indian street dog names (common Indian names)
const indianNames = [
  'Raja', 'Rani', 'Sheru', 'Moti', 'Kalu', 'Brownie', 'Lucky', 'Tiger',
  'Rocky', 'Tommy', 'Bruno', 'Simba', 'Blacky', 'Pinky', 'Sweety', 'Rusty',
  'Buddy', 'Coco', 'Fluffy', 'Goldie', 'Shadow', 'Spotty', 'Whiskey', 'Brandy',
  'Champak', 'Meethi', 'Chutki', 'Bablu', 'Chintu', 'Bunty', 'Guddu', 'Munna',
  'Pappu', 'Rinku', 'Sonu', 'Tony', 'Tuffy', 'Rambo', 'Hero', 'Champion',
  'Biscuit', 'Chapati', 'Puri', 'Samosa', 'Ladoo', 'Jalebi', 'Gulab', 'Kajal',
  'Meera', 'Radha', 'Sita', 'Gita', 'Laxmi', 'Durga', 'Kali', 'Parvati',
  'Krishna', 'Ram', 'Hanuman', 'Ganesh', 'Shiva', 'Bheem', 'Arjun', 'Yudhishthir',
  'Nakul', 'Sahdev', 'Draupadi', 'Kunti', 'Karan', 'Abhimanyu', 'Balram', 'Sudama',
  'Birbal', 'Akbar', 'Jodha', 'Rani Laxmibai', 'Bhagat', 'Chanakya', 'Ashoka', 'Vikram',
  'Prithvi', 'Rana', 'Shivaji', 'Pratap', 'Bajirao', 'Mastani', 'Kasturba', 'Gandhi',
  'Nehru', 'Patel', 'Azad', 'Bose', 'Tilak', 'Gokhale', 'Sarojini', 'Kamala',
  'Indira', 'Rajiv', 'Sanjay', 'Sonia'
];

// Indian street dog colors/patterns
const colors = [
  'Brown', 'Black', 'White', 'Mixed Brown', 'Golden Brown', 
  'Light Brown', 'Dark Brown', 'Black and Brown', 'White and Brown',
  'Tan', 'Brindle', 'Fawn', 'Cream', 'Sandy'
];

const genders = ['Male', 'Female'];

const statuses = [
  'In Shelter',
  'Under Treatment',
  'Ready for Adoption',
  'Recently Rescued',
  'In Quarantine'
];

// Use Unsplash API for Indian street dog images
function getIndianStrayDogImageUrl() {
  return new Promise((resolve, reject) => {
    // Using Unsplash Source for random dog images
    // We'll use a mix of keywords to get street dog-like images
    const keywords = ['street-dog', 'indian-dog', 'stray-dog', 'desi-dog', 'pariah-dog', 'brown-dog', 'mongrel'];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    // Alternative: Use Dog CEO API but we'll treat them all as Indian Pariah/Street dogs
    https.get('https://dog.ceo/api/breeds/image/random', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.message);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function downloadDogImage(imageUrl, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(imageUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if error
      reject(err);
    });
  });
}

function generatePawId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pawId = 'PAW-';
  
  // First segment: 4 characters
  for (let i = 0; i < 4; i++) {
    pawId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  pawId += '-';
  
  // Second segment: 4 characters
  for (let i = 0; i < 4; i++) {
    pawId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return pawId;
}

function getRandomLocation() {
  const locations = [
    { city: 'Bangalore', area: 'Indiranagar', state: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
    { city: 'Bangalore', area: 'Koramangala', state: 'Karnataka', coordinates: { lat: 12.9352, lng: 77.6245 } },
    { city: 'Bangalore', area: 'Whitefield', state: 'Karnataka', coordinates: { lat: 12.9698, lng: 77.7499 } },
    { city: 'Bangalore', area: 'Jayanagar', state: 'Karnataka', coordinates: { lat: 12.9250, lng: 77.5838 } },
    { city: 'Bangalore', area: 'Malleswaram', state: 'Karnataka', coordinates: { lat: 13.0067, lng: 77.5703 } },
    { city: 'Bangalore', area: 'HSR Layout', state: 'Karnataka', coordinates: { lat: 12.9121, lng: 77.6446 } },
    { city: 'Bangalore', area: 'BTM Layout', state: 'Karnataka', coordinates: { lat: 12.9165, lng: 77.6101 } },
    { city: 'Mumbai', area: 'Andheri', state: 'Maharashtra', coordinates: { lat: 19.1136, lng: 72.8697 } },
    { city: 'Mumbai', area: 'Bandra', state: 'Maharashtra', coordinates: { lat: 19.0596, lng: 72.8295 } },
    { city: 'Delhi', area: 'Connaught Place', state: 'Delhi', coordinates: { lat: 28.6315, lng: 77.2167 } },
    { city: 'Chennai', area: 'T Nagar', state: 'Tamil Nadu', coordinates: { lat: 13.0418, lng: 80.2341 } },
    { city: 'Pune', area: 'Koregaon Park', state: 'Maharashtra', coordinates: { lat: 18.5362, lng: 73.8847 } },
    { city: 'Hyderabad', area: 'Banjara Hills', state: 'Telangana', coordinates: { lat: 17.4239, lng: 78.4738 } }
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
}

async function generate100IndianStrays() {
  try {
    console.log('✅ MongoDB connected');
    
    // Fetch all shelters
    console.log('🏠 Fetching shelters...');
    const shelters = await Shelter.find();
    
    if (shelters.length === 0) {
      console.log('❌ No shelters found! Please run seedDemoData.js first');
      process.exit(1);
    }
    
    console.log(`Found ${shelters.length} shelters`);
    
    const dogsToCreate = 100;
    const dogsPerShelter = Math.floor(dogsToCreate / shelters.length);
    const remainder = dogsToCreate % shelters.length;
    
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    
    console.log('📸 Starting to generate 100 Indian stray dogs with unique images...');
    console.log('⏳ This will take a few minutes...\n');
    
    let totalCreated = 0;
    
    for (let shelterIndex = 0; shelterIndex < shelters.length; shelterIndex++) {
      const shelter = shelters[shelterIndex];
      let dogsForThisShelter = dogsPerShelter;
      
      // Add remainder to first shelters
      if (shelterIndex < remainder) {
        dogsForThisShelter += 1;
      }
      
      console.log(`🏠 Creating ${dogsForThisShelter} dogs for ${shelter.name}...`);
      
      for (let i = 0; i < dogsForThisShelter; i++) {
        try {
          // Generate unique data for each dog
          const name = indianNames[Math.floor(Math.random() * indianNames.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const age = Math.floor(Math.random() * 10) + 0.5; // 0.5 to 10 years
          const gender = genders[Math.floor(Math.random() * genders.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const pawId = generatePawId();
          
          // Download unique image
          const imageUrl = await getIndianStrayDogImageUrl();
          const imageFilename = `indian-stray-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
          const imagePath = path.join(uploadsDir, imageFilename);
          
          await downloadDogImage(imageUrl, imagePath);
          
          const location = getRandomLocation();
          
          // Create animal document - NO BREED FIELD
          const animal = await Animal.create({
            paw_id: pawId,
            name: name,
            type: 'Indian Street Dog', // Generic type instead of breed
            color: color,
            age: age,
            gender: gender,
            status: status,
            health: {
              vaccinated: Math.random() > 0.5,
              sterilized: Math.random() > 0.3,
              injuries: Math.random() > 0.7 ? [] : ['Minor wounds'],
              medicalHistory: Math.random() > 0.5 ? 'Treated for dehydration' : 'Healthy'
            },
            location: {
              city: location.city,
              area: location.area,
              state: location.state,
              coordinates: location.coordinates,
              rescueDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
            },
            media: {
              photos: [`/uploads/${imageFilename}`]
            },
            aiAnalysis: {
              isFake: false,
              confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence for real images
              isInjured: Math.random() > 0.8,
              injuryConfidence: Math.random() * 0.5 + 0.3
            },
            description: `${color} colored Indian street dog rescued from ${location.area}, ${location.city}. ${gender === 'Male' ? 'He' : 'She'} is approximately ${age} years old.`,
            rescuedBy: shelter._id,
            currentShelter: shelter._id
          });
          
          // Update shelter's animals array and capacity
          await Shelter.findByIdAndUpdate(shelter._id, {
            $push: { animals: animal._id },
            $inc: { 'capacity.current': 1 }
          });
          
          totalCreated++;
          
          // Progress indicator
          if (totalCreated % 10 === 0) {
            console.log(`✅ ${totalCreated}/100 dogs created...`);
          }
          
        } catch (error) {
          console.error(`❌ Error creating dog ${i + 1} for ${shelter.name}:`, error.message);
        }
      }
    }
    
    console.log('\n📊 Final Statistics:');
    console.log(`   🐕 Total Indian Stray Dogs Created: ${totalCreated}`);
    console.log(`   🏠 Shelters Updated: ${shelters.length}`);
    
    // Display distribution
    console.log('\n📈 Distribution per Shelter:');
    for (const shelter of shelters) {
      const updatedShelter = await Shelter.findById(shelter._id);
      console.log(`   ${updatedShelter.name}: ${updatedShelter.capacity.current}/${updatedShelter.capacity.maximum} dogs`);
    }
    
    console.log('\n✅ Successfully generated 100 Indian stray dogs with unique images!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
generate100IndianStrays();
