const express = require('express');
const router = express.Router();
const {
  createShelter,
  getAllShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
  addAnimalToShelter,
  removeAnimalFromShelter,
  addStaffToShelter,
  getShelterStatistics,
  addDonation,
  recordAdoption,
  deleteAnimalFromShelter,
  deleteDonation
} = require('../controllers/shelterController');

// @route   GET /api/shelters
// @desc    Get all shelters
// @access  Public
router.get('/', getAllShelters);

// @route   GET /api/shelters/:id
// @desc    Get single shelter with full details
// @access  Public
router.get('/:id', getShelterById);

// @route   POST /api/shelters
// @desc    Register new shelter
// @access  Private (Admin/Authority)
router.post('/', createShelter);

// @route   PUT /api/shelters/:id
// @desc    Update shelter details
// @access  Private (Shelter Manager)
router.put('/:id', updateShelter);

// @route   DELETE /api/shelters/:id
// @desc    Delete shelter (Admin only)
// @access  Private (Admin)
router.delete('/:id', deleteShelter);

// @route   POST /api/shelters/:id/animals
// @desc    Add animal to shelter
// @access  Private (Shelter Manager)
router.post('/:id/animals', addAnimalToShelter);

// @route   DELETE /api/shelters/:id/animals/:animalId
// @desc    Remove animal from shelter
// @access  Private (Shelter Manager)
router.delete('/:id/animals/:animalId', removeAnimalFromShelter);

// @route   POST /api/shelters/:id/staff
// @desc    Add staff member to shelter
// @access  Private (Shelter Manager/Admin)
router.post('/:id/staff', addStaffToShelter);

// @route   GET /api/shelters/:id/statistics
// @desc    Get shelter statistics
// @access  Public
router.get('/:id/statistics', getShelterStatistics);

// @route   POST /api/shelters/:id/donations
// @desc    Add donation to shelter
// @access  Public
router.post('/:id/donations', addDonation);

// @route   POST /api/shelters/:id/adoptions
// @desc    Record adoption
// @access  Private (Shelter Manager)
router.post('/:id/adoptions', recordAdoption);

// @route   DELETE /api/shelters/:id/animals/:animalId/delete
// @desc    Admin delete animal from shelter
// @access  Private (Admin only)
router.delete('/:id/animals/:animalId/delete', deleteAnimalFromShelter);

// @route   DELETE /api/shelters/:id/donations/:donationId
// @desc    Admin delete donation record
// @access  Private (Admin only)
router.delete('/:id/donations/:donationId', deleteDonation);

module.exports = router;

module.exports = router;

// @route   GET /api/shelters
// @desc    Get all shelters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, type, verified } = req.query;
    
    let filter = { isActive: true };
    
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const shelters = await Shelter.find(filter)
      .populate('manager', 'name email phone')
      .select('-staff -reviews');

    res.status(200).json({
      success: true,
      count: shelters.length,
      data: shelters
    });
  } catch (error) {
    console.error('Get shelters error:', error);
    res.status(500).json({ message: 'Error fetching shelters', error: error.message });
  }
});

// @route   GET /api/shelters/:id
// @desc    Get single shelter with full details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id)
      .populate('manager', 'name email phone')
      .populate('staff', 'name email')
      .populate('animals', 'animalId name species status')
      .populate('reviews.user', 'name');

    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    res.status(200).json({
      success: true,
      data: shelter
    });
  } catch (error) {
    console.error('Get shelter error:', error);
    res.status(500).json({ message: 'Error fetching shelter', error: error.message });
  }
});

// @route   POST /api/shelters
// @desc    Register new shelter
// @access  Private (Admin/Authority)
router.post('/', async (req, res) => {
  try {
    const shelterData = req.body;

    // Check if registration number already exists
    const existingShelter = await Shelter.findOne({ 
      registrationNumber: shelterData.registrationNumber 
    });

    if (existingShelter) {
      return res.status(400).json({ 
        message: 'Shelter with this registration number already exists' 
      });
    }

    const shelter = await Shelter.create(shelterData);

    res.status(201).json({
      success: true,
      message: 'Shelter registered successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Create shelter error:', error);
    res.status(500).json({ message: 'Error creating shelter', error: error.message });
  }
});

// @route   PUT /api/shelters/:id
// @desc    Update shelter details
// @access  Private (Shelter Manager)
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;

    const shelter = await Shelter.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    res.status(200).json({
      success: true,
      data: shelter
    });
  } catch (error) {
    console.error('Update shelter error:', error);
    res.status(500).json({ message: 'Error updating shelter', error: error.message });
  }
});

// @route   PUT /api/shelters/:id/capacity
// @desc    Update shelter capacity
// @access  Private (Shelter Manager)
router.put('/:id/capacity', async (req, res) => {
  try {
    const { current } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    if (current !== undefined) {
      shelter.capacity.current = current;
      shelter.capacity.available = shelter.capacity.total - current;
    }

    await shelter.save();

    res.status(200).json({
      success: true,
      data: shelter
    });
  } catch (error) {
    console.error('Update capacity error:', error);
    res.status(500).json({ message: 'Error updating capacity', error: error.message });
  }
});

// @route   POST /api/shelters/:id/review
// @desc    Add review to shelter
// @access  Private (Logged in users)
router.post('/:id/review', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    // Add review
    shelter.reviews.push({
      user: userId,
      rating,
      comment
    });

    // Calculate new average rating
    const totalRating = shelter.reviews.reduce((sum, review) => sum + review.rating, 0);
    shelter.rating = totalRating / shelter.reviews.length;

    await shelter.save();

    res.status(200).json({
      success: true,
      data: shelter
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// @route   PUT /api/shelters/:id/verify
// @desc    Verify shelter
// @access  Private (Authority only)
router.put('/:id/verify', async (req, res) => {
  try {
    const { verifiedBy } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    shelter.isVerified = true;
    shelter.verifiedBy = verifiedBy;
    shelter.verificationDate = Date.now();

    await shelter.save();

    res.status(200).json({
      success: true,
      message: 'Shelter verified successfully',
      data: shelter
    });
  } catch (error) {
    console.error('Verify shelter error:', error);
    res.status(500).json({ message: 'Error verifying shelter', error: error.message });
  }
});

// @route   GET /api/shelters/stats/all
// @desc    Get shelter statistics
// @access  Public
router.get('/stats/all', async (req, res) => {
  try {
    const totalShelters = await Shelter.countDocuments({ isActive: true });
    const verifiedShelters = await Shelter.countDocuments({ 
      isActive: true, 
      isVerified: true 
    });
    
    // Get total capacity
    const capacityStats = await Shelter.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity.total' },
          currentOccupancy: { $sum: '$capacity.current' },
          availableSpace: { $sum: '$capacity.available' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalShelters,
        verifiedShelters,
        capacity: capacityStats[0] || {
          totalCapacity: 0,
          currentOccupancy: 0,
          availableSpace: 0
        }
      }
    });
  } catch (error) {
    console.error('Get shelter stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;