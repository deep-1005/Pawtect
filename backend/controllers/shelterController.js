const Shelter = require('../models/Shelter');
const Animal = require('../models/Animal');
const User = require('../models/User');

// @route   POST /api/shelters
// @desc    Create a new shelter
// @access  Private (Admin)
exports.createShelter = async (req, res) => {
  try {
    const {
      name,
      registrationNumber,
      type,
      contactInfo,
      address,
      capacity,
      facilities,
      manager
    } = req.body;

    // Check if shelter already exists
    const existingShelter = await Shelter.findOne({ registrationNumber });
    if (existingShelter) {
      return res.status(400).json({ message: 'Shelter with this registration number already exists' });
    }

    // Create shelter
    const shelter = await Shelter.create({
      name,
      registrationNumber,
      type,
      contactInfo,
      address,
      capacity,
      facilities,
      manager
    });

    res.status(201).json({
      success: true,
      message: 'Shelter created successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Error creating shelter:', error);
    res.status(500).json({
      message: 'Error creating shelter',
      error: error.message
    });
  }
};

// @route   GET /api/shelters
// @desc    Get all shelters
// @access  Public
exports.getAllShelters = async (req, res) => {
  try {
    const { city, state, type, hasVeterinary, hasAdoption } = req.query;
    
    let query = { isActive: true };
    
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (type) query.type = type;
    if (hasVeterinary) query['facilities.veterinaryService'] = hasVeterinary === 'true';
    if (hasAdoption) query['facilities.adoptionService'] = hasAdoption === 'true';

    const shelters = await Shelter.find(query)
      .populate('manager', 'name email phone')
      .populate('staff', 'name email phone role')
      .populate('animals', 'paw_id name species breed status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shelters.length,
      data: shelters
    });
  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({
      message: 'Error fetching shelters',
      error: error.message
    });
  }
};

// @route   GET /api/shelters/:id
// @desc    Get shelter by ID
// @access  Public
exports.getShelterById = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id)
      .populate('manager', 'name email phone role')
      .populate('staff', 'name email phone role')
      .populate('animals', 'paw_id name species breed age gender status healthStatus media');

    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    res.status(200).json({
      success: true,
      data: shelter
    });
  } catch (error) {
    console.error('Error fetching shelter:', error);
    res.status(500).json({
      message: 'Error fetching shelter',
      error: error.message
    });
  }
};

// @route   PUT /api/shelters/:id
// @desc    Update shelter
// @access  Private (Shelter Manager/Admin)
exports.updateShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Shelter updated successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Error updating shelter:', error);
    res.status(500).json({
      message: 'Error updating shelter',
      error: error.message
    });
  }
};

// @route   DELETE /api/shelters/:id
// @desc    Delete shelter
// @access  Private (Admin)
exports.deleteShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);

    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Shelter deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shelter:', error);
    res.status(500).json({
      message: 'Error deleting shelter',
      error: error.message
    });
  }
};

// @route   POST /api/shelters/:id/animals
// @desc    Add animal to shelter
// @access  Private (Shelter Manager)
exports.addAnimalToShelter = async (req, res) => {
  try {
    const { animalId } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    // Check capacity
    if (shelter.capacity.current >= shelter.capacity.total) {
      return res.status(400).json({ message: 'Shelter is at full capacity' });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Check if already in shelter
    if (shelter.animals.includes(animalId)) {
      return res.status(400).json({ message: 'Animal is already in this shelter' });
    }

    shelter.animals.push(animalId);
    shelter.capacity.current += 1;
    shelter.statistics.currentAnimals += 1;
    
    // Update animal location
    animal.location.currentLocation = {
      shelterId: shelter._id,
      shelterName: shelter.name,
      address: shelter.address.street,
      city: shelter.address.city,
      state: shelter.address.state,
      coordinates: shelter.address.coordinates
    };
    animal.status = 'In Shelter';

    await shelter.save();
    await animal.save();

    res.status(200).json({
      success: true,
      message: 'Animal added to shelter successfully',
      data: { shelter, animal }
    });
  } catch (error) {
    console.error('Error adding animal to shelter:', error);
    res.status(500).json({
      message: 'Error adding animal to shelter',
      error: error.message
    });
  }
};

// @route   DELETE /api/shelters/:id/animals/:animalId
// @desc    Remove animal from shelter
// @access  Private (Shelter Manager)
exports.removeAnimalFromShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    shelter.animals = shelter.animals.filter(
      a => a.toString() !== req.params.animalId
    );
    shelter.capacity.current = Math.max(0, shelter.capacity.current - 1);
    shelter.statistics.currentAnimals = Math.max(0, shelter.statistics.currentAnimals - 1);
    
    await shelter.save();

    res.status(200).json({
      success: true,
      message: 'Animal removed from shelter successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Error removing animal from shelter:', error);
    res.status(500).json({
      message: 'Error removing animal from shelter',
      error: error.message
    });
  }
};

// @route   POST /api/shelters/:id/staff
// @desc    Add staff member to shelter
// @access  Private (Shelter Manager/Admin)
exports.addStaffToShelter = async (req, res) => {
  try {
    const { userId } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a staff member
    if (shelter.staff.includes(userId)) {
      return res.status(400).json({ message: 'User is already a staff member' });
    }

    shelter.staff.push(userId);
    await shelter.save();

    res.status(200).json({
      success: true,
      message: 'Staff member added successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({
      message: 'Error adding staff',
      error: error.message
    });
  }
};

// @route   GET /api/shelters/:id/statistics
// @desc    Get shelter statistics
// @access  Public
exports.getShelterStatistics = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    // Get real-time animal counts by status
    const animalsByStatus = await Animal.aggregate([
      {
        $match: {
          _id: { $in: shelter.animals }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statistics = {
      ...shelter.statistics.toObject(),
      capacity: shelter.capacity,
      occupancyRate: ((shelter.capacity.current / shelter.capacity.total) * 100).toFixed(2),
      animalsByStatus: animalsByStatus,
      staffCount: shelter.staff.length,
      funding: shelter.funding,
      recentAdoptions: shelter.adoptions.slice(-5)
    };

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching shelter statistics:', error);
    res.status(500).json({
      message: 'Error fetching shelter statistics',
      error: error.message
    });
  }
};

// @route   POST /api/shelters/:id/donations
// @desc    Add donation to shelter
// @access  Public
exports.addDonation = async (req, res) => {
  try {
    const { amount, donorName, donorEmail, message } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    shelter.funding.donations.push({
      amount,
      donorName,
      donorEmail,
      message,
      date: new Date()
    });

    shelter.funding.donationsReceived += amount;
    await shelter.save();

    res.status(200).json({
      success: true,
      message: 'Donation added successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Error adding donation:', error);
    res.status(500).json({
      message: 'Error adding donation',
      error: error.message
    });
  }
};

// @route   POST /api/shelters/:id/adoptions
// @desc    Record adoption
// @access  Private (Shelter Manager)
exports.recordAdoption = async (req, res) => {
  try {
    const { animalId, adopterName, adopterContact, adoptionFee } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Record adoption
    shelter.adoptions.push({
      animal: animalId,
      adopterName,
      adopterContact,
      adoptionFee,
      adoptionDate: new Date()
    });

    shelter.statistics.totalAdoptions += 1;
    shelter.capacity.current = Math.max(0, shelter.capacity.current - 1);
    shelter.statistics.currentAnimals = Math.max(0, shelter.statistics.currentAnimals - 1);

    // Remove animal from shelter
    shelter.animals = shelter.animals.filter(a => a.toString() !== animalId);

    // Update animal status
    animal.status = 'Adopted';
    animal.location.currentLocation = null;

    await shelter.save();
    await animal.save();

    res.status(200).json({
      success: true,
      message: 'Adoption recorded successfully',
      data: { shelter, animal }
    });
  } catch (error) {
    console.error('Error recording adoption:', error);
    res.status(500).json({
      message: 'Error recording adoption',
      error: error.message
    });
  }
};

// @route   DELETE /api/shelters/:id/animals/:animalId
// @desc    Admin delete animal from shelter
// @access  Private (Admin only)
exports.deleteAnimalFromShelter = async (req, res) => {
  try {
    const { userRole } = req.body;

    // Check if user is admin
    if (userRole !== 'authority') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    const animal = await Animal.findById(req.params.animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Remove from shelter
    shelter.animals = shelter.animals.filter(a => a.toString() !== req.params.animalId);
    shelter.capacity.current = Math.max(0, shelter.capacity.current - 1);
    shelter.statistics.currentAnimals = Math.max(0, shelter.statistics.currentAnimals - 1);

    await shelter.save();

    // Delete animal
    await Animal.findByIdAndDelete(req.params.animalId);

    res.status(200).json({
      success: true,
      message: 'Animal deleted successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(500).json({
      message: 'Error deleting animal',
      error: error.message
    });
  }
};

// @route   DELETE /api/shelters/:id/donations/:donationId
// @desc    Admin delete donation record
// @access  Private (Admin only)
exports.deleteDonation = async (req, res) => {
  try {
    const { userRole } = req.body;

    // Check if user is admin
    if (userRole !== 'authority') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    const donation = shelter.funding.donations.id(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Subtract from total
    shelter.funding.donationsReceived = Math.max(0, shelter.funding.donationsReceived - donation.amount);

    // Remove donation
    donation.remove();
    await shelter.save();

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({
      message: 'Error deleting donation',
      error: error.message
    });
  }
};
