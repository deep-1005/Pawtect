const express = require('express');
const router = express.Router();
const {
  createNGO,
  getAllNGOs,
  getNGOById,
  updateNGO,
  deleteNGO,
  addVolunteer,
  removeVolunteer,
  addEvent,
  getNGOStatistics
} = require('../controllers/ngoController');

// @route   POST /api/ngos
// @desc    Create a new NGO
// @access  Private (Admin)
router.post('/', createNGO);

// @route   GET /api/ngos
// @desc    Get all NGOs
// @access  Public
router.get('/', getAllNGOs);

// @route   GET /api/ngos/:id
// @desc    Get NGO by ID
// @access  Public
router.get('/:id', getNGOById);

// @route   PUT /api/ngos/:id
// @desc    Update NGO
// @access  Private (NGO Admin)
router.put('/:id', updateNGO);

// @route   DELETE /api/ngos/:id
// @desc    Delete NGO
// @access  Private (Admin)
router.delete('/:id', deleteNGO);

// @route   POST /api/ngos/:id/volunteers
// @desc    Add volunteer to NGO
// @access  Private
router.post('/:id/volunteers', addVolunteer);

// @route   DELETE /api/ngos/:id/volunteers/:volunteerId
// @desc    Remove volunteer from NGO
// @access  Private
router.delete('/:id/volunteers/:volunteerId', removeVolunteer);

// @route   POST /api/ngos/:id/events
// @desc    Add event to NGO
// @access  Private (NGO Admin)
router.post('/:id/events', addEvent);

// @route   GET /api/ngos/:id/statistics
// @desc    Get NGO statistics
// @access  Public
router.get('/:id/statistics', getNGOStatistics);

module.exports = router;
