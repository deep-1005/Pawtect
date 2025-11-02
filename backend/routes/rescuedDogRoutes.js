const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const rescuedDogController = require('../controllers/rescuedDogController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and documents
  if (file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDF, and Word documents are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure multer for medical report uploads
const reportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'medical-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadReport = multer({ 
  storage: reportStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/rescued-dogs
// @desc    Add a rescued dog with AI analysis
// @access  Private (Admin only)
router.post('/', upload.single('dogImage'), rescuedDogController.addRescuedDog);

// @route   GET /api/rescued-dogs
// @desc    Get all rescued dogs
// @access  Public
router.get('/', rescuedDogController.getRescuedDogs);

// @route   GET /api/rescued-dogs/:id
// @desc    Get single rescued dog by ID
// @access  Public
router.get('/:id', rescuedDogController.getRescuedDogById);

// @route   POST /api/rescued-dogs/:id/medical-report
// @desc    Upload medical report for a dog
// @access  Private (Admin only)
router.post('/:id/medical-report', uploadReport.single('medicalReport'), rescuedDogController.uploadMedicalReport);

// @route   PUT /api/rescued-dogs/:id
// @desc    Update rescued dog information
// @access  Private (Admin only)
router.put('/:id', rescuedDogController.updateRescuedDog);

module.exports = router;
