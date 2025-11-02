const NGO = require('../models/NGO');
const User = require('../models/User');
const Animal = require('../models/Animal');

// @route   POST /api/ngos
// @desc    Create a new NGO
// @access  Private (Admin)
exports.createNGO = async (req, res) => {
  try {
    const {
      name,
      registrationNumber,
      registrationType,
      description,
      foundedYear,
      contactInfo,
      address,
      founder,
      president,
      servicesProvided,
      operatingAreas
    } = req.body;

    // Check if NGO already exists
    const existingNGO = await NGO.findOne({ registrationNumber });
    if (existingNGO) {
      return res.status(400).json({ message: 'NGO with this registration number already exists' });
    }

    // Create NGO
    const ngo = await NGO.create({
      name,
      registrationNumber,
      registrationType,
      description,
      foundedYear,
      contactInfo,
      address,
      founder,
      president,
      servicesProvided,
      operatingAreas
    });

    res.status(201).json({
      success: true,
      message: 'NGO created successfully',
      data: ngo
    });
  } catch (error) {
    console.error('Error creating NGO:', error);
    res.status(500).json({
      message: 'Error creating NGO',
      error: error.message
    });
  }
};

// @route   GET /api/ngos
// @desc    Get all NGOs
// @access  Public
exports.getAllNGOs = async (req, res) => {
  try {
    const { city, state, service, verified } = req.query;
    
    let query = {};
    
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (service) query.servicesProvided = service;
    if (verified) query.isVerified = verified === 'true';

    const ngos = await NGO.find(query)
      .populate('volunteers', 'name email phone')
      .populate('sheltersManaged', 'name address capacity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ngos.length,
      data: ngos
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({
      message: 'Error fetching NGOs',
      error: error.message
    });
  }
};

// @route   GET /api/ngos/:id
// @desc    Get NGO by ID
// @access  Public
exports.getNGOById = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id)
      .populate('volunteers', 'name email phone role')
      .populate('sheltersManaged', 'name address capacity facilities')
      .populate('teamMembers.user', 'name email phone')
      .populate('animalsRescued', 'paw_id name species breed status');

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    res.status(200).json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error('Error fetching NGO:', error);
    res.status(500).json({
      message: 'Error fetching NGO',
      error: error.message
    });
  }
};

// @route   PUT /api/ngos/:id
// @desc    Update NGO
// @access  Private (NGO Admin)
exports.updateNGO = async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    res.status(200).json({
      success: true,
      message: 'NGO updated successfully',
      data: ngo
    });
  } catch (error) {
    console.error('Error updating NGO:', error);
    res.status(500).json({
      message: 'Error updating NGO',
      error: error.message
    });
  }
};

// @route   DELETE /api/ngos/:id
// @desc    Delete NGO
// @access  Private (Admin)
exports.deleteNGO = async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndDelete(req.params.id);

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    res.status(200).json({
      success: true,
      message: 'NGO deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting NGO:', error);
    res.status(500).json({
      message: 'Error deleting NGO',
      error: error.message
    });
  }
};

// @route   POST /api/ngos/:id/volunteers
// @desc    Add volunteer to NGO
// @access  Private
exports.addVolunteer = async (req, res) => {
  try {
    const { userId } = req.body;

    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a volunteer
    if (ngo.volunteers.includes(userId)) {
      return res.status(400).json({ message: 'User is already a volunteer' });
    }

    ngo.volunteers.push(userId);
    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer added successfully',
      data: ngo
    });
  } catch (error) {
    console.error('Error adding volunteer:', error);
    res.status(500).json({
      message: 'Error adding volunteer',
      error: error.message
    });
  }
};

// @route   DELETE /api/ngos/:id/volunteers/:volunteerId
// @desc    Remove volunteer from NGO
// @access  Private
exports.removeVolunteer = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    ngo.volunteers = ngo.volunteers.filter(
      v => v.toString() !== req.params.volunteerId
    );
    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer removed successfully',
      data: ngo
    });
  } catch (error) {
    console.error('Error removing volunteer:', error);
    res.status(500).json({
      message: 'Error removing volunteer',
      error: error.message
    });
  }
};

// @route   POST /api/ngos/:id/events
// @desc    Add event to NGO
// @access  Private (NGO Admin)
exports.addEvent = async (req, res) => {
  try {
    const { title, description, date, location, type, participants } = req.body;

    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    ngo.events.push({
      title,
      description,
      date,
      location,
      type,
      participants
    });

    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'Event added successfully',
      data: ngo
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({
      message: 'Error adding event',
      error: error.message
    });
  }
};

// @route   GET /api/ngos/:id/statistics
// @desc    Get NGO statistics
// @access  Public
exports.getNGOStatistics = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    // Get real-time statistics
    const totalAnimals = await Animal.countDocuments({
      _id: { $in: ngo.animalsRescued }
    });

    const statistics = {
      ...ngo.statistics.toObject(),
      totalAnimalsCurrently: totalAnimals,
      volunteersActive: ngo.volunteers.length,
      sheltersManaged: ngo.sheltersManaged.length,
      upcomingEvents: ngo.events.filter(e => new Date(e.date) > new Date()).length
    };

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching NGO statistics:', error);
    res.status(500).json({
      message: 'Error fetching NGO statistics',
      error: error.message
    });
  }
};
