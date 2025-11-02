# Database Demo - How to Test

## 🚀 Server is Running!
Backend: http://localhost:5000
MongoDB: Connected ✅

---

## 📝 Demo 1: Create a Shelter

### Using PowerShell:
```powershell
$body = @'
{
  "name": "Happy Paws Shelter",
  "registrationNumber": "SH-2025-001",
  "type": "NGO",
  "contactInfo": {
    "email": "contact@happypaws.org",
    "phone": "+91-9876543210"
  },
  "address": {
    "city": "Bangalore",
    "state": "Karnataka"
  },
  "capacity": {
    "total": 50
  },
  "manager": "673e6b8e8e8a0f2c4c9e4f5a"
}
'@

Invoke-RestMethod -Uri "http://localhost:5000/api/shelters" -Method POST -Body $body -ContentType "application/json"
```

### Response you'll get:
```json
{
  "success": true,
  "message": "Shelter created successfully",
  "data": {
    "_id": "673e7a1b2c3d4e5f6a7b8c9d",
    "name": "Happy Paws Shelter",
    "registrationNumber": "SH-2025-001",
    "type": "NGO",
    "contactInfo": {
      "email": "contact@happypaws.org",
      "phone": "+91-9876543210"
    },
    "address": {
      "city": "Bangalore",
      "state": "Karnataka"
    },
    "capacity": {
      "total": 50,
      "current": 0,
      "available": 50
    },
    "statistics": {
      "totalRescues": 0,
      "totalAdoptions": 0,
      "currentAnimals": 0
    },
    "isVerified": false,
    "isActive": true,
    "rating": 0
  }
}
```

---

## 📝 Demo 2: Get All Shelters

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/shelters" -Method GET
```

### Response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "673e7a1b2c3d4e5f6a7b8c9d",
      "name": "Happy Paws Shelter",
      ...
    }
  ]
}
```

---

## 📝 Demo 3: Create an NGO

```powershell
$ngo = @'
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
  "servicesProvided": ["Animal Rescue", "Veterinary Care", "Adoption Services"]
}
'@

Invoke-RestMethod -Uri "http://localhost:5000/api/ngos" -Method POST -Body $ngo -ContentType "application/json"
```

### Response:
```json
{
  "success": true,
  "message": "NGO created successfully",
  "data": {
    "_id": "673e7a1b2c3d4e5f6a7b8c9e",
    "ngo_id": "NGO-M5K2H8L-ABC1",
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
    "servicesProvided": ["Animal Rescue", "Veterinary Care", "Adoption Services"],
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
    "rating": 0
  }
}
```

---

## 📝 Demo 4: Upload a Dog (Already Working!)

From your frontend Dashboard → "Add Rescued Dog" → Upload image

### What happens in database:
```json
{
  "_id": "673e7a1b2c3d4e5f6a7b8c9f",
  "paw_id": "PAW-M5K2H8L-XYZ9",
  "name": "Unnamed",
  "species": "Dog",
  "breed": "Mixed",
  "status": "Rescued",
  "healthStatus": {
    "injured": false,
    "aiAnalysis": {
      "injuryDetection": {
        "is_injured": false,
        "confidence": 0.85,
        "status": "healthy"
      },
      "aiImageDetection": {
        "is_ai_generated": false,
        "confidence": 0.567,
        "status": "real"
      }
    }
  },
  "location": {
    "rescueLocation": {
      "coordinates": {
        "lat": 12.9716,
        "lng": 77.5946
      }
    }
  },
  "media": {
    "photos": ["/uploads/dog-1762002592986-640828002.jpg"]
  }
}
```

---

## 📝 Demo 5: Add Dog to Shelter

```powershell
$addAnimal = @'
{
  "animalId": "673e7a1b2c3d4e5f6a7b8c9f"
}
'@

Invoke-RestMethod -Uri "http://localhost:5000/api/shelters/673e7a1b2c3d4e5f6a7b8c9d/animals" -Method POST -Body $addAnimal -ContentType "application/json"
```

### What happens:
1. ✅ Shelter's `capacity.current` increases from 0 → 1
2. ✅ Shelter's `capacity.available` decreases from 50 → 49
3. ✅ Shelter's `animals[]` array gets the dog's ID
4. ✅ Dog's `status` changes from "Rescued" → "In Shelter"
5. ✅ Dog's `location.currentLocation` gets shelter details

---

## 📝 Demo 6: Get Shelter Statistics

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/shelters/673e7a1b2c3d4e5f6a7b8c9d/statistics" -Method GET
```

### Response shows real-time data:
```json
{
  "success": true,
  "data": {
    "totalRescues": 0,
    "totalAdoptions": 0,
    "currentAnimals": 1,
    "capacity": {
      "total": 50,
      "current": 1,
      "available": 49
    },
    "occupancyRate": "2.00",
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

## 📝 Demo 7: View All Data in MongoDB

### Open MongoDB Compass:
1. Connect to: `mongodb://127.0.0.1:27017/pawtect`
2. You'll see 4 collections:
   - **animals** - All rescued dogs
   - **shelters** - All shelters
   - **ngos** - All NGOs
   - **users** - All users

### Or use MongoDB Shell:
```bash
mongosh
use pawtect
db.animals.find().pretty()
db.shelters.find().pretty()
db.ngos.find().pretty()
```

---

## 🎯 Real-World Example Flow:

### Step 1: Register a Shelter
```
POST /api/shelters
→ Creates shelter with 50 capacity
```

### Step 2: Admin uploads a rescued dog
```
POST /api/rescued-dogs (with image)
→ AI analyzes: injured or not
→ Creates animal record
→ Status: "Rescued"
```

### Step 3: Add dog to shelter
```
POST /api/shelters/{shelterId}/animals
→ Shelter capacity: 50 → 49 available
→ Dog status: "Rescued" → "In Shelter"
→ Dog location updated to shelter address
```

### Step 4: Register NGO
```
POST /api/ngos
→ Creates NGO record
```

### Step 5: Link shelter to NGO
```
PUT /api/ngos/{ngoId}
{
  "sheltersManaged": ["673e7a1b2c3d4e5f6a7b8c9d"]
}
→ NGO now manages this shelter
```

### Step 6: View Dashboard
```
GET /api/rescued-dogs → Shows all dogs
GET /api/shelters → Shows all shelters with capacity
GET /api/ngos → Shows all NGOs with statistics
```

---

## 📊 Database Reflects in Real-Time:

### Animals Collection Updates:
- When dog uploaded → new document created
- When added to shelter → `location.currentLocation` updated, `status` changed
- When adopted → `status` becomes "Adopted"

### Shelters Collection Updates:
- When dog added → `capacity.current` increases, `animals[]` array updated
- When dog removed → `capacity.current` decreases
- Statistics auto-calculate

### NGOs Collection Updates:
- When volunteer joins → `volunteers[]` array updated
- When animal rescued → `animalsRescued[]` updated
- Statistics auto-update

---

## 🔥 Try It Now!

### Quick Test in PowerShell:
```powershell
# 1. Create a shelter
Invoke-RestMethod -Uri "http://localhost:5000/api/shelters" -Method POST -Body '{"name":"Test Shelter","registrationNumber":"TEST-001","type":"Private","contactInfo":{"email":"test@shelter.com","phone":"1234567890"},"address":{"city":"Bangalore","state":"Karnataka"},"capacity":{"total":20},"manager":"673e6b8e8e8a0f2c4c9e4f5a"}' -ContentType "application/json"

# 2. Get all shelters
Invoke-RestMethod -Uri "http://localhost:5000/api/shelters" -Method GET

# 3. Get all rescued dogs (from your previous uploads)
Invoke-RestMethod -Uri "http://localhost:5000/api/rescued-dogs" -Method GET

# 4. Create an NGO
Invoke-RestMethod -Uri "http://localhost:5000/api/ngos" -Method POST -Body '{"name":"Test NGO","registrationNumber":"NGO-TEST-001","registrationType":"Trust","description":"Test NGO for animal welfare","foundedYear":2025,"contactInfo":{"email":"test@ngo.org","phone":"9876543210"},"address":{"city":"Delhi","state":"Delhi"},"servicesProvided":["Animal Rescue"]}' -ContentType "application/json"

# 5. Get all NGOs
Invoke-RestMethod -Uri "http://localhost:5000/api/ngos" -Method GET
```

---

## ✅ Everything is Connected!

- 🐕 **Animals** → stored in `animals` collection
- 🏠 **Shelters** → stored in `shelters` collection
- 🤝 **NGOs** → stored in `ngos` collection
- 👤 **Users** → stored in `users` collection

All linked together with references, updating in real-time! 🎉
