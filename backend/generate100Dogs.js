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
  'Minnie', 'Olivia', 'Hazel', 'Athena', 'Dakota', 'Annie', 'Lexi', 'Winnie', 'Josie', 'Izzy'
];

// Breed variations
const breeds = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog', 'Bulldog',
  'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer',
  'Dachshund', 'Siberian Husky', 'Great Dane', 'Doberman', 'Shih Tzu',
  'Boston Terrier', 'Pomeranian', 'Havanese', 'Cavalier King Charles', 'Maltese',
  'Indie Dog', 'Mixed Breed', 'Street Dog', 'Indian Pariah Dog', 'Stray Mix',
  'Labrador Mix', 'German Shepherd Mix', 'Golden Mix', 'Beagle Mix', 'Husky Mix'
];

const ages = ['Puppy', 'Adult', 'Senior'];
const genders = ['Male', 'Female'];
const statuses = ['In Shelter', 'Ready for Adoption', 'Under Treatment'];

// Download dog image from Dog CEO API (free dog images)
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
      fs.unlink(filepath, () => {}); // Delete file on error
      reject(err);
    });
  });
}

// Fetch random dog image URL from Dog CEO API
function getRandomDogImageUrl() {
  return new Promise((resolve, reject) => {
    https.get('https://dog.ceo/api/breeds/image/random', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
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

async function generate100Dogs() {
  try {
    console.log('\n🗑️  Clearing existing animals...\n');
    await Animal.deleteMany({});
    
    console.log('🏠 Fetching shelters...\n');
    const shelters = await Shelter.find();
    
    if (shelters.length === 0) {
      console.error('❌ No shelters found! Run seedDemoData.js first.');
      process.exit(1);
    }
    
    console.log(`Found ${shelters.length} shelters\n`);
    console.log('📸 Starting to generate 100 dogs with unique images...\n');
    console.log('⏳ This will take a few minutes as we download 100 unique dog images...\n');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const dogsPerShelter = Math.floor(100 / shelters.length);
    const remainder = 100 % shelters.length;
    
    let totalCreated = 0;
    let shelterIndex = 0;
    
    for (const shelter of shelters) {
      const dogsToCreate = dogsPerShelter + (shelterIndex < remainder ? 1 : 0);
      console.log(`\n🏠 Creating ${dogsToCreate} dogs for ${shelter.name}...`);
      
      for (let i = 0; i < dogsToCreate; i++) {
        const dogIndex = totalCreated;
        const name = dogNames[dogIndex % dogNames.length] + (dogIndex >= dogNames.length ? ` ${Math.floor(dogIndex / dogNames.length) + 1}` : '');
        const breed = breeds[Math.floor(Math.random() * breeds.length)];
        const age = ages[Math.floor(Math.random() * ages.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const pawId = `PAW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        try {
          // Download unique dog image
          const imageUrl = await getRandomDogImageUrl();
          const imageFilename = `dog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
          const imagePath = path.join(uploadsDir, imageFilename);
          
          await downloadDogImage(imageUrl, imagePath);
          
          // Create animal in database
          const animal = await Animal.create({
            paw_id: pawId,
            animalId: pawId,
            name: name,
            species: 'Dog',
            breed: breed,
            age: age,
            gender: gender,
            status: status,
            healthStatus: {
              vaccinated: Math.random() > 0.5,
              sterilized: Math.random() > 0.5,
              injured: Math.random() > 0.8,
              medicalNotes: `${name} is a friendly ${age.toLowerCase()} ${breed}`,
              aiAnalysis: {
                injuryDetection: {
                  is_injured: Math.random() > 0.8,
                  confidence: Math.random() * 30 + 70,
                  status: Math.random() > 0.8 ? 'Injured' : 'Healthy'
                },
                aiImageDetection: {
                  is_ai_generated: false,
                  confidence: Math.random() * 20 + 80,
                  status: 'Real Image'
                },
                analyzedAt: new Date()
              }
            },
            location: {
              rescueLocation: {
                address: shelter.address.street,
                city: shelter.address.city,
                state: shelter.address.state,
                coordinates: {
                  lat: shelter.address.coordinates.lat + (Math.random() - 0.5) * 0.01,
                  lng: shelter.address.coordinates.lng + (Math.random() - 0.5) * 0.01
                }
              },
              currentLocation: {
                shelterId: shelter._id,
                shelterName: shelter.name,
                address: shelter.address.street
              }
            },
            media: {
              photos: [`/uploads/${imageFilename}`]
            },
            reportedBy: {
              name: 'System Admin',
              contact: '+91-9876543210'
            }
          });
          
          // Update shelter
          await Shelter.findByIdAndUpdate(shelter._id, {
            $push: { animals: animal._id },
            $inc: { 
              'capacity.current': 1,
              'statistics.totalRescues': 1,
              'statistics.currentAnimals': 1
            }
          });
          
          totalCreated++;
          process.stdout.write(`\r  ✅ ${totalCreated}/100 dogs created...`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`\n❌ Error creating dog ${dogIndex + 1}:`, error.message);
        }
      }
      
      shelterIndex++;
    }
    
    console.log('\n\n📊 Final Statistics:');
    console.log(`   🐕 Total Dogs Created: ${totalCreated}`);
    console.log(`   🏠 Shelters Updated: ${shelters.length}`);
    
    // Display distribution
    console.log('\n📈 Distribution per Shelter:');
    for (const shelter of shelters) {
      const updatedShelter = await Shelter.findById(shelter._id);
      console.log(`   ${updatedShelter.name}: ${updatedShelter.capacity.current}/${updatedShelter.capacity.total} dogs`);
    }
    
    console.log('\n✅ Successfully generated 100 dogs with unique images!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the generator
generate100Dogs();
