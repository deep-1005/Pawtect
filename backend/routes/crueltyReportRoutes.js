const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crueltyReportController = require('../controllers/crueltyReportController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.mimetype.startsWith('video/') ? 'video-' : 'cruelty-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos
});

// @route   POST /api/cruelty-reports
// @desc    Submit a cruelty report
// @access  Public
router.post('/', upload.fields([
  { name: 'photos', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]), crueltyReportController.submitReport);

// @route   GET /api/cruelty-reports
// @desc    Get all cruelty reports
// @access  Private (Admin)
router.get('/', crueltyReportController.getAllReports);

// @route   GET /api/cruelty-reports/my-reports/:userId
// @desc    Get reports by specific user
// @access  Public
router.get('/my-reports/:userId', crueltyReportController.getMyReports);

// @route   GET /api/cruelty-reports/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats/dashboard', crueltyReportController.getStats);

// @route   GET /api/cruelty-reports/:id
// @desc    Get single report
// @access  Public
router.get('/:id', crueltyReportController.getReportById);

// @route   PUT /api/cruelty-reports/:id/status
// @desc    Update report status
// @access  Private (Admin)
router.put('/:id/status', crueltyReportController.updateStatus);

// @route   PUT /api/cruelty-reports/:id/assign
// @desc    Assign report to shelter/NGO
// @access  Private (Admin)
router.put('/:id/assign', crueltyReportController.assignReport);

// @route   PUT /api/cruelty-reports/:id/resolve
// @desc    Mark report as resolved
// @access  Private (Admin)
router.put('/:id/resolve', crueltyReportController.resolveReport);

// @route   POST /api/cruelty-reports/:id/notes
// @desc    Add admin note to report
// @access  Private (Admin)
router.post('/:id/notes', crueltyReportController.addAdminNote);

module.exports = router;
