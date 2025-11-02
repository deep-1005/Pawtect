# Pawtect Database Structure

## Overview
The Pawtect application uses MongoDB with separate collections for different entities. All data is properly organized and linked using references.

## Collections

### 1. **Animals Collection** (`animals`)
Stores information about all rescued animals.

**Schema:** `backend/models/Animal.js`

**Key Fields:**
- `paw_id` - Unique identifier (PAW-TIMESTAMP-RANDOM)
- `name` - Animal name
- `species` - Dog, Cat, etc.
- `breed` - Breed information
- `age`, `gender` - Basic info
- `status` - Rescued, In Shelter, Under Treatment, Ready for Adoption, Adopted
- `healthStatus` - Vaccinated, sterilized, injured, medical notes
  - `aiAnalysis` - AI injury detection and AI-image detection results
- `location` - Rescue location and current location (shelter)
- `media.photos` - Array of image paths
- `rescueDetails` - Who rescued, when, reason, condition
- `timeline` - Event history

**API Endpoints:**
- `POST /api/rescued-dogs` - Add new rescued dog (Admin only)
- `GET /api/rescued-dogs` - Get all rescued dogs
- `GET /api/rescued-dogs/:id` - Get single dog by ID

---

### 2. **Shelters Collection** (`shelters`)
Stores information about animal shelters.

**Schema:** `backend/models/Shelter.js`

**Key Fields:**
- `name` - Shelter name
- `registrationNumber` - Unique registration number
- `type` - Government, NGO, Private, Municipal
- `contactInfo` - Email, phone, website
- `address` - Full address with coordinates
- `capacity` - Total, current, available
- `facilities` - Veterinary, adoption, ambulance, vaccination, sterilization services
- `manager` - Reference to User (shelter manager)
- `staff` - Array of User references
- `animals` - Array of Animal references (animals currently in shelter)
- `statistics` - Total rescues, adoptions, current animals
- `isVerified` - Verification status
- `rating` - Average rating (0-5)
- `reviews` - Array of user reviews

**API Endpoints:**
- `POST /api/shelters` - Create new shelter
- `GET /api/shelters` - Get all shelters (with filters: city, type, verified)
- `GET /api/shelters/:id` - Get shelter by ID
- `PUT /api/shelters/:id` - Update shelter
- `DELETE /api/shelters/:id` - Delete shelter
- `POST /api/shelters/:id/animals` - Add animal to shelter
- `DELETE /api/shelters/:id/animals/:animalId` - Remove animal from shelter
- `POST /api/shelters/:id/staff` - Add staff member
- `POST /api/shelters/:id/review` - Add review
- `PUT /api/shelters/:id/verify` - Verify shelter (Authority only)
- `GET /api/shelters/stats/all` - Get shelter statistics
- `GET /api/shelters/:id/statistics` - Get individual shelter statistics

---

### 3. **NGOs Collection** (`ngos`)
Stores information about NGOs working in animal welfare.

**Schema:** `backend/models/NGO.js`

**Key Fields:**
- `ngo_id` - Unique identifier (NGO-TIMESTAMP-RANDOM)
- `name` - NGO name
- `registrationNumber` - Unique registration number
- `registrationType` - Trust, Society, 80G, 12A, FCRA
- `description` - NGO description and mission
- `foundedYear` - Year of establishment
- `contactInfo` - Email, phone, website, social media links
- `address` - Full address with coordinates
- `founder`, `president` - Leadership information
- `teamMembers` - Array of team members with roles
- `volunteers` - Array of User references
- `servicesProvided` - Animal Rescue, Veterinary Care, Adoption, Foster Care, etc.
- `operatingAreas` - Cities and states where NGO operates
- `sheltersManaged` - Array of Shelter references
- `animalsRescued` - Array of Animal references
- `statistics` - Total rescues, adoptions, vaccinations, sterilizations, volunteers, shelters
- `funding` - Donations received, expenditure, bank account details
- `documents` - Registration certificates, 80G, 12A, FCRA documents
- `isVerified` - Verification status
- `rating` - Average rating
- `reviews` - User reviews
- `achievements` - Array of achievements
- `events` - Adoption drives, vaccination camps, fundraisers, etc.

**API Endpoints:**
- `POST /api/ngos` - Create new NGO (Admin)
- `GET /api/ngos` - Get all NGOs (with filters: city, state, service, verified)
- `GET /api/ngos/:id` - Get NGO by ID
- `PUT /api/ngos/:id` - Update NGO
- `DELETE /api/ngos/:id` - Delete NGO (Admin)
- `POST /api/ngos/:id/volunteers` - Add volunteer
- `DELETE /api/ngos/:id/volunteers/:volunteerId` - Remove volunteer
- `POST /api/ngos/:id/events` - Add event
- `GET /api/ngos/:id/statistics` - Get NGO statistics

---

### 4. **Users Collection** (`users`)
Stores user information (citizens, NGO members, shelter staff, volunteers, authorities).

**Schema:** `backend/models/User.js`

**Key Fields:**
- `name` - Full name
- `email` - Email address (unique)
- `password` - Hashed password (bcrypt)
- `phone` - Phone number
- `role` - citizen, ngo, shelter, volunteer, authority
- `organization` - Organization name (for NGO/shelter users)
- `location` - User location

**API Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

---

## Relationships

### Animal ↔ Shelter
- Animals have `location.currentLocation.shelterId` pointing to Shelter
- Shelters have `animals[]` array with Animal references
- When animal is added to shelter:
  - Shelter's `capacity.current` increases
  - Animal's `status` becomes "In Shelter"
  - Animal's `location.currentLocation` is updated

### Shelter ↔ NGO
- NGOs have `sheltersManaged[]` array with Shelter references
- Shelters can be managed by NGOs

### NGO ↔ Animal
- NGOs have `animalsRescued[]` array with Animal references
- Tracks which animals were rescued by which NGO

### User ↔ Everything
- Users can be:
  - Shelter managers (`shelter.manager`)
  - Shelter staff (`shelter.staff[]`)
  - NGO volunteers (`ngo.volunteers[]`)
  - NGO team members (`ngo.teamMembers[]`)

---

## AI Integration

### Injury Detection Model
- **File:** `backend/models/ai/injured_dog_model.h5`
- **Status:** TrueDivide layer compatibility issue with Keras 3.x
- **Fallback:** Multi-heuristic image analysis (red dominance, variance, brightness)
- **Output:** `is_injured`, `confidence`, `status`

### AI-Generated Image Detection Model
- **File:** `C:\Users\Epari Subhransi\Desktop\dog_ai_detector.h5`
- **Status:** ✅ Working perfectly
- **Output:** `is_ai_generated`, `confidence`, `status`
- **Usage:** Rejects AI-generated images during upload

### Python Script
- **File:** `backend/models/ai/predict.py`
- **Python:** 3.13.9 at `C:/Users/Epari Subhransi/Python313/python.exe`
- **Dependencies:** TensorFlow 2.20.0, Keras 3.12.0, NumPy 2.3.4, Pillow 12.0.0

---

## Database Connection

**MongoDB URI:** `mongodb://127.0.0.1:27017/pawtect`

**Server:** MongoDB Community Server 8.2.1 (Local)

**Data Directory:** `C:\data\db`

---

## How Data Flows

### 1. Dog Rescue Upload Flow
1. Admin uploads dog image via Dashboard
2. Backend extracts GPS from EXIF metadata
3. Python AI script analyzes image:
   - Checks if AI-generated (rejects if true)
   - Checks if injured
4. Generates unique PAW ID
5. Saves to Animals collection with AI analysis
6. Dashboard displays new dog

### 2. Adding Animal to Shelter
1. Call `POST /api/shelters/:id/animals` with `animalId`
2. Backend checks shelter capacity
3. Updates Shelter:
   - Adds animal to `animals[]`
   - Increases `capacity.current`
   - Updates `statistics.currentAnimals`
4. Updates Animal:
   - Sets `location.currentLocation` to shelter details
   - Changes `status` to "In Shelter"

### 3. NGO Registration Flow
1. Call `POST /api/ngos` with NGO details
2. Backend generates unique `ngo_id`
3. Saves to NGOs collection
4. NGO can be verified by authorities

### 4. Shelter Registration Flow
1. Call `POST /api/shelters` with shelter details
2. Backend validates registration number
3. Saves to Shelters collection
4. Shelter can be verified by authorities

---

## Testing the Database

### Check all collections:
```javascript
// In MongoDB shell or Compass
use pawtect

// View all animals
db.animals.find().pretty()

// View all shelters
db.shelters.find().pretty()

// View all NGOs
db.ngos.find().pretty()

// View all users
db.users.find().pretty()

// Count documents in each collection
db.animals.countDocuments()
db.shelters.countDocuments()
db.ngos.countDocuments()
db.users.countDocuments()
```

### Test API endpoints:
```bash
# Get all animals
curl http://localhost:5000/api/rescued-dogs

# Get all shelters
curl http://localhost:5000/api/shelters

# Get all NGOs
curl http://localhost:5000/api/ngos

# Get shelter statistics
curl http://localhost:5000/api/shelters/stats/all
```

---

## Next Steps

1. **Frontend Integration**
   - Create Shelters page to display all shelters
   - Create NGO page to display all NGOs
   - Add forms to create/update shelters and NGOs
   - Show shelter capacity and animals in each shelter
   - Display NGO volunteers and events

2. **Additional Features**
   - Adoption request system
   - Volunteer registration system
   - Donation tracking
   - Event management
   - Real-time notifications

3. **Data Visualization**
   - Dashboard showing:
     - Total animals rescued
     - Animals by status
     - Shelters by city
     - NGO activities
     - Adoption statistics

---

## Database Backup

To backup the database:
```bash
mongodump --db pawtect --out C:\backup\pawtect
```

To restore:
```bash
mongorestore --db pawtect C:\backup\pawtect\pawtect
```

---

**Last Updated:** November 1, 2025
