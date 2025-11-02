# 🎯 Database Demo - Visual Example

## How Your Database Will Work:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAWTECT DATABASE (MongoDB)                    │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│   ANIMALS          │  │    SHELTERS        │  │      NGOs          │  │      USERS         │
│   Collection       │  │    Collection      │  │    Collection      │  │    Collection      │
└────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────────┘
```

---

## 📋 EXAMPLE 1: When You Upload a Dog

### Step 1: Admin clicks "Add Rescued Dog" in Dashboard
```
Frontend → POST /api/rescued-dogs → Backend
```

### Step 2: What Gets Saved in ANIMALS Collection:
```json
{
  "_id": "67abc123",
  "paw_id": "PAW-M5K2H8L-XYZ9",
  "name": "Unnamed",
  "species": "Dog",
  "breed": "Mixed",
  "age": "Unknown",
  "gender": "Unknown",
  "status": "Rescued",  ← Starts here
  "healthStatus": {
    "vaccinated": false,
    "sterilized": false,
    "injured": false,  ← AI detected
    "aiAnalysis": {
      "injuryDetection": {
        "is_injured": false,
        "confidence": 0.85,
        "status": "healthy"
      },
      "aiImageDetection": {
        "is_ai_generated": false,  ← AI verified real
        "confidence": 0.567,
        "status": "real"
      }
    }
  },
  "location": {
    "rescueLocation": {
      "address": "Location from image",
      "city": "Bangalore",
      "coordinates": {
        "lat": 12.9716,
        "lng": 77.5946
      }
    },
    "currentLocation": null  ← Not in shelter yet
  },
  "media": {
    "photos": ["/uploads/dog-1762002592986-640828002.jpg"]
  },
  "rescueDetails": {
    "rescuedBy": "Admin",
    "rescueDate": "2025-11-01T10:30:00.000Z",
    "initialCondition": "Healthy"
  }
}
```

### Dashboard Shows:
```
┌────────────────────────────────────────┐
│  🐕 Rescued Dog PAW-M5K2H8L-XYZ9       │
│  Mixed • Unknown                        │
│  📍 Bangalore                           │
│  📅 Rescued on 11/1/2025                │
│  Status: Rescued                        │
└────────────────────────────────────────┘
```

---

## 📋 EXAMPLE 2: Register a Shelter

### Action: POST /api/shelters
```json
{
  "name": "Happy Paws Shelter",
  "registrationNumber": "SH-2025-001",
  "type": "NGO",
  "contactInfo": {
    "email": "contact@happypaws.org",
    "phone": "+91-9876543210"
  },
  "address": {
    "street": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "coordinates": {
      "lat": 12.9716,
      "lng": 77.5946
    }
  },
  "capacity": {
    "total": 50  ← Can hold 50 animals
  },
  "facilities": {
    "veterinaryService": true,
    "adoptionService": true,
    "ambulanceService": true
  }
}
```

### What Gets Saved in SHELTERS Collection:
```json
{
  "_id": "67def456",
  "name": "Happy Paws Shelter",
  "registrationNumber": "SH-2025-001",
  "type": "NGO",
  "contactInfo": {
    "email": "contact@happypaws.org",
    "phone": "+91-9876543210"
  },
  "address": {
    "street": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "coordinates": { "lat": 12.9716, "lng": 77.5946 }
  },
  "capacity": {
    "total": 50,
    "current": 0,  ← No animals yet
    "available": 50  ← All space available
  },
  "facilities": {
    "veterinaryService": true,
    "adoptionService": true,
    "ambulanceService": true
  },
  "animals": [],  ← Empty array, no animals yet
  "statistics": {
    "totalRescues": 0,
    "totalAdoptions": 0,
    "currentAnimals": 0
  },
  "isVerified": false,
  "isActive": true,
  "rating": 0
}
```

---

## 📋 EXAMPLE 3: Add Dog to Shelter

### Action: POST /api/shelters/67def456/animals
```json
{
  "animalId": "67abc123"  ← The dog we rescued
}
```

### What Happens - SHELTERS Collection Updates:
```json
{
  "_id": "67def456",
  "name": "Happy Paws Shelter",
  "capacity": {
    "total": 50,
    "current": 1,  ← CHANGED from 0 to 1
    "available": 49  ← CHANGED from 50 to 49
  },
  "animals": ["67abc123"],  ← ADDED dog ID
  "statistics": {
    "currentAnimals": 1  ← UPDATED
  }
}
```

### What Happens - ANIMALS Collection Updates:
```json
{
  "_id": "67abc123",
  "paw_id": "PAW-M5K2H8L-XYZ9",
  "status": "In Shelter",  ← CHANGED from "Rescued"
  "location": {
    "rescueLocation": { ... },
    "currentLocation": {  ← ADDED shelter info
      "shelterId": "67def456",
      "shelterName": "Happy Paws Shelter",
      "address": "123 MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "coordinates": { "lat": 12.9716, "lng": 77.5946 }
    }
  }
}
```

### Dashboard Now Shows:
```
┌────────────────────────────────────────┐
│  🐕 Rescued Dog PAW-M5K2H8L-XYZ9       │
│  Mixed • Unknown                        │
│  📍 Happy Paws Shelter, Bangalore       │
│  📅 Rescued on 11/1/2025                │
│  Status: In Shelter  ← UPDATED!        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  🏠 Happy Paws Shelter                  │
│  📍 Bangalore, Karnataka                │
│  👥 Capacity: 1/50 (49 available)       │
│  🐕 Animals: 1                           │
│  ✅ Veterinary | Adoption | Ambulance   │
└────────────────────────────────────────┘
```

---

## 📋 EXAMPLE 4: Register an NGO

### Action: POST /api/ngos
```json
{
  "name": "Animal Welfare Society",
  "registrationNumber": "NGO-2025-001",
  "registrationType": "Trust",
  "description": "Dedicated to animal rescue and welfare",
  "foundedYear": 2020,
  "contactInfo": {
    "email": "info@animalwelfare.org",
    "phone": "+91-9876543211"
  },
  "address": {
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "servicesProvided": [
    "Animal Rescue",
    "Veterinary Care",
    "Adoption Services",
    "Vaccination Drives"
  ]
}
```

### What Gets Saved in NGOs Collection:
```json
{
  "_id": "67ghi789",
  "ngo_id": "NGO-M5K2H8L-ABC1",  ← Auto-generated
  "name": "Animal Welfare Society",
  "registrationNumber": "NGO-2025-001",
  "registrationType": "Trust",
  "description": "Dedicated to animal rescue and welfare",
  "foundedYear": 2020,
  "contactInfo": {
    "email": "info@animalwelfare.org",
    "phone": "+91-9876543211"
  },
  "address": {
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "servicesProvided": [
    "Animal Rescue",
    "Veterinary Care",
    "Adoption Services",
    "Vaccination Drives"
  ],
  "volunteers": [],  ← Empty initially
  "sheltersManaged": [],  ← Can add shelters
  "animalsRescued": [],  ← Can track rescued animals
  "statistics": {
    "totalRescues": 0,
    "totalAdoptions": 0,
    "totalVaccinations": 0,
    "totalSterilizations": 0,
    "activeVolunteers": 0,
    "sheltersCount": 0
  },
  "isVerified": false,
  "isActive": true,
  "rating": 0,
  "events": []
}
```

---

## 📋 EXAMPLE 5: Link Shelter to NGO

### Action: PUT /api/ngos/67ghi789
```json
{
  "sheltersManaged": ["67def456"]  ← Add Happy Paws Shelter
}
```

### NGO Collection Updates:
```json
{
  "_id": "67ghi789",
  "ngo_id": "NGO-M5K2H8L-ABC1",
  "name": "Animal Welfare Society",
  "sheltersManaged": ["67def456"],  ← ADDED shelter
  "statistics": {
    "sheltersCount": 1  ← UPDATED
  }
}
```

---

## 📊 REAL-TIME STATISTICS

### GET /api/shelters/67def456/statistics
```json
{
  "success": true,
  "data": {
    "totalRescues": 0,
    "totalAdoptions": 0,
    "currentAnimals": 1,  ← Live count
    "capacity": {
      "total": 50,
      "current": 1,  ← Live count
      "available": 49  ← Calculated
    },
    "occupancyRate": "2.00",  ← Calculated %
    "animalsByStatus": [
      {
        "_id": "In Shelter",
        "count": 1
      }
    ],
    "staffCount": 0
  }
}
```

---

## 🔄 DATA FLOW DIAGRAM

```
┌──────────────┐
│   UPLOAD     │
│   DOG IMAGE  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  AI ANALYZES │
│  Injury?     │
│  AI-gen?     │
└──────┬───────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│   ANIMALS    │◄──────┤   SHELTERS   │
│  Collection  │       │  Collection  │
│              │       │              │
│ • PAW ID     │       │ • Capacity   │
│ • Status     │       │ • Animals[]  │
│ • Location   │       │ • Facilities │
│ • AI Results │       │ • Statistics │
└──────┬───────┘       └──────┬───────┘
       │                      │
       │                      │
       │                      │
       ▼                      ▼
   ┌────────────────────────────┐
   │       NGOs Collection       │
   │                             │
   │ • Animals Rescued[]         │
   │ • Shelters Managed[]        │
   │ • Volunteers[]              │
   │ • Events                    │
   │ • Statistics                │
   └─────────────────────────────┘
```

---

## 🎯 SUMMARY: What You Get

### Separate Collections:
1. **ANIMALS** - Every rescued dog, with PAW ID, AI analysis, location
2. **SHELTERS** - Every shelter, with capacity, facilities, animals list
3. **NGOs** - Every NGO, with volunteers, shelters, rescued animals
4. **USERS** - Every user (citizen, volunteer, authority)

### They're All Linked:
- Animal knows which shelter it's in
- Shelter knows which animals it has
- NGO knows which shelters it manages
- NGO knows which animals it rescued
- Everything updates in real-time!

### API Endpoints Work:
- `GET /api/rescued-dogs` - All dogs
- `GET /api/shelters` - All shelters
- `GET /api/ngos` - All NGOs
- `POST /api/shelters/:id/animals` - Add dog to shelter
- And many more!

---

**Next Step:** Open your browser to http://localhost:5173, upload a dog, then we can add it to a shelter and see the database update! 🚀
