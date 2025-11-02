const express = require('express');
const router = express.Router();
const {
  createDonation,
  getAllDonations,
  getDonation,
  getDonationByTransaction,
  getDonationStats
} = require('../controllers/donationController');

// Routes
router.post('/', createDonation);
router.get('/', getAllDonations);
router.get('/stats', getDonationStats);
router.get('/transaction/:hash', getDonationByTransaction);
router.get('/:id', getDonation);

module.exports = router;
