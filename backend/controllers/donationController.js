const Donation = require('../models/Donation');
const Shelter = require('../models/Shelter');
const Animal = require('../models/Animal');

// @desc    Record a new donation
// @route   POST /api/donations
// @access  Public
exports.createDonation = async (req, res) => {
  try {
    const {
      type,
      amount,
      amountETH,
      shelter,
      dog,
      donor,
      transactionHash,
      fromWallet,
      toWallet,
      blockNumber,
      paymentMethod
    } = req.body;

    // Validation
    if (!type || !amount || !donor || !donor.name || !donor.email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Type-specific validation
    if (type === 'shelter' && !shelter) {
      return res.status(400).json({
        success: false,
        message: 'Shelter ID is required for shelter donations'
      });
    }

    if (type === 'sponsor' && !dog) {
      return res.status(400).json({
        success: false,
        message: 'Dog ID is required for sponsorship'
      });
    }

    // Create donation record
    const donation = await Donation.create({
      type,
      amount,
      amountETH,
      paymentMethod: paymentMethod || 'crypto',
      donor: {
        name: donor.name,
        email: donor.email,
        phone: donor.phone || '',
        message: donor.message || '',
        walletAddress: fromWallet
      },
      shelter: type === 'shelter' ? shelter : null,
      dog: type === 'sponsor' ? dog : null,
      transactionHash,
      fromWallet,
      toWallet,
      blockNumber,
      status: 'completed'
    });

    // Update shelter funding if applicable
    if (type === 'shelter' && shelter) {
      await Shelter.findByIdAndUpdate(
        shelter,
        {
          $inc: { 'funding.donationsReceived': amount },
          $push: {
            'funding.donations': {
              amount,
              donorName: donor.name,
              donorEmail: donor.email,
              message: donor.message,
              transactionHash,
              paymentMethod: paymentMethod || 'crypto'
            }
          }
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: donation
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record donation',
      error: error.message
    });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Public (can add auth for admin)
exports.getAllDonations = async (req, res) => {
  try {
    const { type, shelter, status, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (shelter) filter.shelter = shelter;
    if (status) filter.status = status;

    const donations = await Donation.find(filter)
      .populate('shelter', 'name address')
      .populate('dog', 'name paw_id breed')
      .sort({ donatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Donation.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: donations
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
};

// @desc    Get donation by ID or donation ID
// @route   GET /api/donations/:id
// @access  Public
exports.getDonation = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by MongoDB _id or donationId
    const donation = await Donation.findOne({
      $or: [{ _id: id }, { donationId: id }]
    })
      .populate('shelter', 'name address contactInfo')
      .populate('dog', 'name paw_id breed photos');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
};

// @desc    Get donations by transaction hash
// @route   GET /api/donations/transaction/:hash
// @access  Public
exports.getDonationByTransaction = async (req, res) => {
  try {
    const { hash } = req.params;

    const donation = await Donation.findOne({ transactionHash: hash })
      .populate('shelter', 'name address')
      .populate('dog', 'name paw_id');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found for this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error fetching donation by transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
};

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Public
exports.getDonationStats = async (req, res) => {
  try {
    const { shelter } = req.query;

    const filter = shelter ? { shelter } : {};

    const stats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalETH: { $sum: '$amountETH' },
          avgDonation: { $avg: '$amount' }
        }
      }
    ]);

    const byType = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const byMethod = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalDonations: 0,
          totalAmount: 0,
          totalETH: 0,
          avgDonation: 0
        },
        byType,
        byMethod
      }
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation statistics',
      error: error.message
    });
  }
};
