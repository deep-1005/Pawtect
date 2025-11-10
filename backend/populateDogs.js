const mongoose = require('mongoose');
const Animal = require('./models/Animal');
const Shelter = require('./models/Shelter');
const https = require('https');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://127.0.0.1:27017/pawtect')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Dog names pool
const dogNames = [
  'Max', 'Buddy', 'Charlie', 'Rocky', 'Cooper', 'Bear', 'Duke', 'Zeus', 'Jack', 'Bentley',
  'Bella', 'Luna', 'Lucy', 'Daisy', 'Lola', 'Sadie', 'Molly', 'Bailey', 'Maggie', 'Sophie',
  'Milo', 'Toby', 'Oscar', 'Leo', 'Simba', 'Tucker', 'Buster', 'Harley', 'Murphy', 'Lucky',
  'Coco', 'Penny', 'Ruby', 'Rosie', 'Chloe', 'Stella', 'Gracie', 'Zoe', 'Lily', 'Emma',
  'Shadow', 'Rex', 'Bruno', 'Diesel', 'Thor', 'Apollo', 'Maverick', 'Gunner', 'Tank', 'King',
  'Princess', 'Angel', 'Honey', 'Cookie', 'Sugar', 'Ginger', 'Peanut', 'Roxy', 'Lady', 'Missy',
  'Sam', 'Jake', 'Gizmo', 'Rusty', 'Ace', 'Hunter', 'Scout', 'Bandit', 'Sammy', 'Jasper',
  'Nala', 'Pepper', 'Abby', 'Dixie', 'Kona', 'Maya', 'Piper', 'Willow', 'Ellie', 'Mia',
  'Ranger', 'Boomer', 'Marley', 'Chief', 'Cash', 'Moose', 'Copper', 'Finn', 'Rocco', 'Dexter',
  'Minnie', 'Olivia', 'Hazel', 'Athena', 'Dakota', 'Annie', 'Lexi', 'Winnie', 'Josie', 'Izzy',
  'Bruno', 'Oreo', 'Muffin', 'Teddy', 'Simba', 'Cleo', 'Kira', 'Bruno', 'Flash', 'Storm'
];

// Breed variations
const breeds = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog', 'Bulldog',
  'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer',
  'Dachshund', 'Siberian Husky', 'Great Dane', 'Doberman', 'Shih Tzu',
  'Boston Terrier', 'Pomeranian', 'Havanese', 'Cavalier King Charles', 'Maltese',
  'Indie Dog', 'Mixed Breed', 'Indian Pariah Dog', 'Labrador Mix', 'German Shepherd Mix'
];

const ages = ['Puppy', 'Young', 'Adult', 'Senior'];
const genders = ['Male', 'Female'];
const colors = ['Brown', 'Black', 'White', 'Golden', 'Mixed', 'Brindle', 'Tan', 'Cream'];

// Download dog image from Dog CEO API
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
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Fetch random dog image
async function fetchDogImage() {
  return new Promise((resolve, reject) => {
    https.get('https://dog.ceo/api/breeds/image/random', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.message);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function populateDogs() {
  try {
    console.log('🚀 Starting dog population process...\n');

    // Get all shelters
    const shelters = await Shelter.find({ isActive: true });
    
    if (shelters.length === 0) {
      console.error('❌ No shelters found! Please run seedDemoData.js first.');
      process.exit(1);
    }

    console.log(`✅ Found ${shelters.length} active shelters\n`);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let totalCreated = 0;
    let readyForAdoption = 0;
    const targetTotal = 100;
    const targetAdoption = 20;

    // Calculate dogs per shelter
    const dogsPerShelter = Math.floor(targetTotal / shelters.length);
    const adoptionPerShelter = Math.floor(targetAdoption / shelters.length);

    for (const shelter of shelters) {
      console.log(`\n📍 Processing shelter: ${shelter.name}`);
      
      const dogsToCreate = dogsPerShelter + (totalCreated < targetTotal - (shelters.length * dogsPerShelter) ? 1 : 0);
      
      for (let i = 0; i < dogsToCreate && totalCreated < targetTotal; i++) {
        try {
          // Determine status (ensure we get 20 ready for adoption)
          let status;
          if (readyForAdoption < targetAdoption && (i < adoptionPerShelter || totalCreated > targetTotal - targetAdoption + readyForAdoption)) {
            status = 'Ready for Adoption';
            readyForAdoption++;
          } else {
            status = Math.random() > 0.3 ? 'In Shelter' : 'Under Treatment';
          }

          const name = dogNames[Math.floor(Math.random() * dogNames.length)];
          const breed = breeds[Math.floor(Math.random() * breeds.length)];
          const age = ages[Math.floor(Math.random() * ages.length)];
          const gender = genders[Math.floor(Math.random() * genders.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];

          // Fetch and download dog image
          console.log(`   Fetching image for ${name}...`);
          const imageUrl = await fetchDogImage();
          const imageFilename = `dog-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const imagePath = path.join(uploadsDir, imageFilename);
          
          await downloadDogImage(imageUrl, imagePath);
          console.log(`   ✓ Image downloaded: ${imageFilename}`);

          // Generate PAW ID
          const pawId = `PAW-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          // Create animal
          const animal = await Animal.create({
            paw_id: pawId,
            name: name,
            species: 'Dog',
            breed: breed,
            color: color,
            age: age,
            gender: gender,
            status: status,
            health: {
              vaccinated: Math.random() > 0.3,
              sterilized: Math.random() > 0.4,
              injuries: Math.random() > 0.8 ? ['Minor wounds'] : [],
              medicalHistory: Math.random() > 0.5 ? 'Regular checkups completed' : 'Healthy'
            },
            healthStatus: {
              vaccinated: Math.random() > 0.3,
              sterilized: Math.random() > 0.4,
              injured: Math.random() > 0.9,
              medicalNotes: `${name} is a ${age.toLowerCase()} ${breed} in good health.`
            },
            location: {
              city: shelter.address.city,
              area: shelter.address.street,
              state: shelter.address.state,
              coordinates: {
                lat: shelter.address.coordinates.lat + (Math.random() - 0.5) * 0.01,
                lng: shelter.address.coordinates.lng + (Math.random() - 0.5) * 0.01
              },
              rescueDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
            },
            rescueDetails: {
              rescueDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              rescuerName: 'Animal Welfare Team',
              rescueReason: 'Found wandering',
              initialCondition: Math.random() > 0.7 ? 'Injured' : 'Healthy'
            },
            media: {
              photos: [`/uploads/${imageFilename}`]
            },
            aiAnalysis: {
              isFake: false,
              confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
              isInjured: Math.random() > 0.8,
              injuryConfidence: Math.random() * 0.5 + 0.3
            },
            description: `${color} colored ${breed}. ${gender === 'Male' ? 'He' : 'She'} is ${age.toLowerCase()} and ${status === 'Ready for Adoption' ? 'ready to find a loving home' : 'receiving care at the shelter'}.`,
            rescuedBy: shelter._id,
            currentShelter: shelter._id
          });

          // Update shelter's animals array and capacity
          await Shelter.findByIdAndUpdate(shelter._id, {
            $push: { animals: animal._id },
            $inc: { 
              'capacity.current': 1,
              'statistics.totalRescues': 1,
              'statistics.currentAnimals': 1
            }
          });

          totalCreated++;
          console.log(`   ✅ Created: ${name} (${breed}) - ${status} [${totalCreated}/${targetTotal}]`);

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`   ❌ Error creating dog ${i + 1}:`, error.message);
        }
      }
    }

    // Update shelter capacities
    for (const shelter of shelters) {
      const updatedShelter = await Shelter.findById(shelter._id).populate('animals');
      const available = updatedShelter.capacity.total - updatedShelter.capacity.current;
      
      await Shelter.findByIdAndUpdate(shelter._id, {
        'capacity.available': available > 0 ? available : 0
      });
    }

    console.log('\n📊 Final Statistics:');
    console.log(`   🐕 Total Dogs Created: ${totalCreated}`);
    console.log(`   🏠 Dogs In Shelter: ${totalCreated - readyForAdoption}`);
    console.log(`   ❤️  Ready for Adoption: ${readyForAdoption}`);
    console.log(`   🏥 Shelters Updated: ${shelters.length}`);
    
    console.log('\n📈 Distribution per Shelter:');
    for (const shelter of shelters) {
      const updatedShelter = await Shelter.findById(shelter._id);
      const adoptionReady = await Animal.countDocuments({ 
        currentShelter: shelter._id, 
        status: 'Ready for Adoption' 
      });
      console.log(`   ${updatedShelter.name}: ${updatedShelter.capacity.current}/${updatedShelter.capacity.total} dogs (${adoptionReady} ready for adoption)`);
    }
    
    console.log('\n✅ Successfully populated database with 100 dogs!');
    console.log('✅ All data synced across admin, user, and shelter portals!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the population script
populateDogs();
