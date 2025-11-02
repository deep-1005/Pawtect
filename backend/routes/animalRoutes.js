const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const QRCode = require('qrcode');

// @route   GET /api/animals
// @desc    Get all animals with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, city, species, shelter } = req.query;
    
    let filter = { isActive: true };
    
    if (status) filter.status = status;
    if (species) filter.species = species;
    if (city) filter['location.rescueLocation.city'] = new RegExp(city, 'i');
    if (shelter) filter['location.currentLocation.shelterId'] = shelter;

    const animals = await Animal.find(filter)
      .populate('rescueDetails.rescuedBy', 'name email')
      .populate('location.currentLocation.shelterId', 'name address')
      .sort({ 'rescueDetails.rescueDate': -1 });

    res.status(200).json({
      success: true,
      count: animals.length,
      data: animals
    });
  } catch (error) {
    console.error('Get animals error:', error);
    res.status(500).json({ message: 'Error fetching animals', error: error.message });
  }
});

// @route   GET /api/animals/:id
// @desc    Get single animal by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('rescueDetails.rescuedBy', 'name email phone')
      .populate('location.currentLocation.shelterId', 'name contactInfo address')
      .populate('adoptionDetails.adoptedBy', 'name email')
      .populate('timeline.updatedBy', 'name');

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.status(200).json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({ message: 'Error fetching animal', error: error.message });
  }
});

// @route   GET /api/animals/qr/:animalId
// @desc    Get animal by QR code ID
// @access  Public
router.get('/qr/:animalId', async (req, res) => {
  try {
    const animal = await Animal.findOne({ animalId: req.params.animalId })
      .populate('rescueDetails.rescuedBy', 'name')
      .populate('location.currentLocation.shelterId', 'name address');

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.status(200).json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Get animal by QR error:', error);
    res.status(500).json({ message: 'Error fetching animal', error: error.message });
  }
});

// @route   POST /api/animals
// @desc    Create new animal rescue entry
// @access  Private (NGO/Shelter)
router.post('/', async (req, res) => {
  try {
    const animalData = req.body;

    // Create animal
    const animal = await Animal.create(animalData);

    // Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(`${process.env.FRONTEND_URL}/animal/${animal.animalId}`);
    animal.qrCode = qrCodeUrl;
    
    // Add initial timeline entry
    animal.timeline.push({
      event: 'Rescue Logged',
      description: `Animal rescued from ${animal.location.rescueLocation.address}`,
      updatedBy: animal.rescueDetails.rescuedBy
    });

    await animal.save();

    res.status(201).json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Create animal error:', error);
    res.status(500).json({ message: 'Error creating animal entry', error: error.message });
  }
});

// @route   PUT /api/animals/:id
// @desc    Update animal details
// @access  Private (NGO/Shelter)
router.put('/:id', async (req, res) => {
  try {
    const { status, healthStatus, location, media, timeline } = req.body;

    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Update fields
    if (status) animal.status = status;
    if (healthStatus) animal.healthStatus = { ...animal.healthStatus, ...healthStatus };
    if (location) animal.location = { ...animal.location, ...location };
    if (media) {
      if (media.photos) animal.media.photos.push(...media.photos);
      if (media.videos) animal.media.videos.push(...media.videos);
    }

    // Add timeline entry if provided
    if (timeline) {
      animal.timeline.push(timeline);
    }

    await animal.save();

    res.status(200).json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Update animal error:', error);
    res.status(500).json({ message: 'Error updating animal', error: error.message });
  }
});

// @route   DELETE /api/animals/:id
// @desc    Soft delete animal (set isActive to false)
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    animal.isActive = false;
    await animal.save();

    res.status(200).json({
      success: true,
      message: 'Animal entry deactivated'
    });
  } catch (error) {
    console.error('Delete animal error:', error);
    res.status(500).json({ message: 'Error deleting animal', error: error.message });
  }
});

// @route   GET /api/animals/stats/dashboard
// @desc    Get dashboard statistics
// @access  Public
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalRescues = await Animal.countDocuments({ isActive: true });
    const inShelter = await Animal.countDocuments({ status: 'In Shelter', isActive: true });
    const adopted = await Animal.countDocuments({ status: 'Adopted', isActive: true });
    const readyForAdoption = await Animal.countDocuments({ status: 'Ready for Adoption', isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalRescues,
        inShelter,
        adopted,
        readyForAdoption
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;