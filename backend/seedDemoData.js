const mongoose = require('mongoose');
const Shelter = require('./models/Shelter');
const Animal = require('./models/Animal');
const NGO = require('./models/NGO');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/pawtect')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Demo data
const demoShelters = [
  {
    name: "Happy Paws Rescue Center",
    registrationNumber: "SH-BLR-2025-001",
    type: "NGO",
    contactInfo: {
      email: "contact@happypaws.org",
      phone: "+91-9876543210",
      website: "https://happypaws.org"
    },
    address: {
      street: "123 MG Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    capacity: { total: 50, current: 0 },
    facilities: {
      veterinaryService: true,
      adoptionService: true,
      ambulanceService: true,
      vaccinationService: true,
      sterilizationService: true
    },
    manager: null,
    isVerified: true,
    rating: 4.5
  },
  {
    name: "Bangalore Animal Care Shelter",
    registrationNumber: "SH-BLR-2025-002",
    type: "Government",
    contactInfo: {
      email: "info@bacshelter.gov.in",
      phone: "+91-9876543211",
      website: "https://bacshelter.gov.in"
    },
    address: {
      street: "45 Whitefield Main Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      coordinates: { lat: 12.9698, lng: 77.7500 }
    },
    capacity: { total: 80, current: 0 },
    facilities: {
      veterinaryService: true,
      adoptionService: true,
      ambulanceService: true,
      vaccinationService: true,
      sterilizationService: true
    },
    manager: null,
    isVerified: true,
    rating: 4.8
  },
  {
    name: "Compassion Unlimited Plus Action",
    registrationNumber: "SH-BLR-2025-003",
    type: "NGO",
    contactInfo: {
      email: "cupa@cupabangalore.org",
      phone: "+91-9876543212",
      website: "https://cupabangalore.org"
    },
    address: {
      street: "Bannerghatta Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560076",
      coordinates: { lat: 12.8456, lng: 77.6016 }
    },
    capacity: { total: 60, current: 0 },
    facilities: {
      veterinaryService: true,
      adoptionService: true,
      ambulanceService: true,
      vaccinationService: true,
      sterilizationService: true
    },
    manager: null,
    isVerified: true,
    rating: 4.7
  },
  {
    name: "Voice of Stray Dogs",
    registrationNumber: "SH-BLR-2025-004",
    type: "NGO",
    contactInfo: {
      email: "vosd@vosd.in",
      phone: "+91-9876543213",
      website: "https://vosd.in"
    },
    address: {
      street: "Sarjapur Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560035",
      coordinates: { lat: 12.9121, lng: 77.6446 }
    },
    capacity: { total: 100, current: 0 },
    facilities: {
      veterinaryService: true,
      adoptionService: true,
      ambulanceService: false,
      vaccinationService: true,
      sterilizationService: true
    },
    manager: null,
    isVerified: true,
    rating: 4.9
  },
  {
    name: "Krupa Animal Hospital & Shelter",
    registrationNumber: "SH-BLR-2025-005",
    type: "Private",
    contactInfo: {
      email: "krupa@krupashelter.org",
      phone: "+91-9876543214",
      website: "https://krupashelter.org"
    },
    address: {
      street: "Mysore Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560026",
      coordinates: { lat: 12.9586, lng: 77.5385 }
    },
    capacity: { total: 40, current: 0 },
    facilities: {
      veterinaryService: true,
      adoptionService: true,
      ambulanceService: true,
      vaccinationService: true,
      sterilizationService: true
    },
    manager: null,
    isVerified: true,
    rating: 4.6
  }
];

const demoDogs = [
  {
    name: "Rocky",
    breed: "German Shepherd Mix",
    age: "Adult",
    gender: "Male",
    status: "In Shelter",
    description: "Friendly and energetic, loves to play fetch"
  },
  {
    name: "Bella",
    breed: "Labrador Retriever",
    age: "Adult",
    gender: "Female",
    status: "In Shelter",
    description: "Gentle and loving, great with children"
  },
  {
    name: "Max",
    breed: "Indie Dog",
    age: "Adult",
    gender: "Male",
    status: "In Shelter",
    description: "Independent and loyal, well-trained"
  },
  {
    name: "Luna",
    breed: "Golden Retriever Mix",
    age: "Puppy",
    gender: "Female",
    status: "In Shelter",
    description: "Playful puppy, needs active family"
  },
  {
    name: "Bruno",
    breed: "Indie Dog",
    age: "Senior",
    gender: "Male",
    status: "In Shelter",
    description: "Calm and protective, good guard dog"
  },
  {
    name: "Daisy",
    breed: "Beagle Mix",
    age: "Adult",
    gender: "Female",
    status: "In Shelter",
    description: "Friendly and curious, loves food"
  },
  {
    name: "Charlie",
    breed: "Indie Dog",
    age: "Adult",
    gender: "Male",
    status: "In Shelter",
    description: "Young and energetic, needs training"
  },
  {
    name: "Molly",
    breed: "Husky Mix",
    age: "Adult",
    gender: "Female",
    status: "In Shelter",
    description: "Beautiful and active, needs space to run"
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Shelter.deleteMany({});
    await Animal.deleteMany({ species: 'Dog' });
    
    console.log('✅ Existing data cleared');
    
    // Create a demo admin user to be the manager
    console.log('👤 Creating demo admin user...');
    const User = require('./models/User');
    await User.deleteOne({ email: 'admin@pawtect.com' });
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@pawtect.com',
      password: hashedPassword,
      phone: '9876543210',
      role: 'authority'
    });
    console.log('✅ Admin user created: admin@pawtect.com / admin123');
    
    // Add manager to all shelters
    const sheltersWithManager = demoShelters.map(shelter => ({
      ...shelter,
      manager: adminUser._id
    }));
    
    // Create shelters
    console.log('🏠 Creating demo shelters...');
    const createdShelters = await Shelter.insertMany(sheltersWithManager);
    console.log(`✅ Created ${createdShelters.length} shelters`);
    
    // Create dogs and assign to shelters
    console.log('🐕 Creating demo dogs and assigning to shelters...');
    
    for (let i = 0; i < demoDogs.length; i++) {
      const dog = demoDogs[i];
      const shelter = createdShelters[i % createdShelters.length];
      
      // Generate PAW ID
      const pawId = `PAW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      // Create animal
      const animal = await Animal.create({
        paw_id: pawId,
        animalId: pawId,
        name: dog.name,
        species: 'Dog',
        breed: dog.breed,
        age: dog.age,
        gender: dog.gender,
        status: dog.status,
        healthStatus: {
          vaccinated: Math.random() > 0.5,
          sterilized: Math.random() > 0.5,
          injured: false,
          medicalNotes: dog.description
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
            address: shelter.address.street,
            city: shelter.address.city,
            state: shelter.address.state,
            coordinates: shelter.address.coordinates
          }
        },
        media: {
          photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400']
        },
        rescueDetails: {
          rescuedBy: null,
          rescuerName: 'Admin',
          rescueDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          rescueReason: 'Found injured on street',
          initialCondition: 'Good'
        }
      });
      
      // Add animal to shelter
      shelter.animals.push(animal._id);
      shelter.capacity.current += 1;
      shelter.statistics.currentAnimals += 1;
      shelter.statistics.totalRescues += 1;
      
      // Random adoptions
      if (Math.random() > 0.7) {
        shelter.statistics.totalAdoptions += 1;
      }
      
      await shelter.save();
      
      console.log(`  ✅ Created ${dog.name} (${pawId}) → ${shelter.name}`);
    }
    
    // Add some adoption and donation statistics
    console.log('📊 Adding statistics...');
    for (const shelter of createdShelters) {
      const updatedShelter = await Shelter.findById(shelter._id);
      
      // Random donations
      const donationAmount = Math.floor(Math.random() * 500000) + 50000;
      updatedShelter.funding = {
        donationsReceived: donationAmount,
        totalExpenditure: Math.floor(donationAmount * 0.7)
      };
      
      await updatedShelter.save();
      console.log(`  💰 ${updatedShelter.name}: ₹${donationAmount.toLocaleString()} donated`);
    }
    
    console.log('\n✅ Demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  🏠 Shelters: ${createdShelters.length}`);
    console.log(`  🐕 Dogs: ${demoDogs.length}`);
    
    const totalCapacity = createdShelters.reduce((sum, s) => sum + s.capacity.total, 0);
    const totalCurrent = createdShelters.reduce((sum, s) => sum + s.capacity.current, 0);
    console.log(`  📈 Total Capacity: ${totalCurrent}/${totalCapacity}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
