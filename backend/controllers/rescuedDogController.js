const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const exifr = require('exifr');
const { v4: uuidv4 } = require('uuid');
const Animal = require('../models/Animal');
const Shelter = require('../models/Shelter');

// Generate unique PAW_ID
const generatePawId = () => {
  const prefix = 'PAW';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Extract GPS coordinates from image
const extractLocation = async (imagePath) => {
  try {
    const exifData = await exifr.parse(imagePath, { gps: true });
    
    if (exifData && exifData.latitude && exifData.longitude) {
      return {
        lat: exifData.latitude,
        lng: exifData.longitude,
        source: 'exif'
      };
    }
    
    // Default location if no EXIF data
    return {
      lat: 12.9716, // Bangalore default
      lng: 77.5946,
      source: 'default'
    };
  } catch (error) {
    console.error('Error extracting location:', error);
    return {
      lat: 12.9716,
      lng: 77.5946,
      source: 'default'
    };
  }
};

// Run Python AI model prediction
const runAIModel = (imagePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../models/ai/predict.py');
    // Use the full path to Python 3.13 to avoid conflicts with other Python installations
    const pythonPath = 'C:/Users/Epari Subhransi/Python313/python.exe';
    const command = `"${pythonPath}" "${pythonScript}" "${imagePath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Python execution error:', error);
        // Return default values if Python fails
        resolve({
          injury_detection: { is_injured: false, confidence: 0, status: 'unknown' },
          ai_detection: { is_ai_generated: false, confidence: 0, status: 'unknown' }
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        resolve({
          injury_detection: { is_injured: false, confidence: 0, status: 'unknown' },
          ai_detection: { is_ai_generated: false, confidence: 0, status: 'unknown' }
        });
      }
    });
  });
};

// @route   POST /api/rescued-dogs
// @desc    Add a rescued dog (Admin only)
// @access  Private (Admin)
exports.addRescuedDog = async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.body.userRole; // You'll pass this from frontend
    if (userRole !== 'authority') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a dog image' });
    }

    const imagePath = req.file.path;
    
    // Extract location from image
    const location = await extractLocation(imagePath);
    
    // Run AI model predictions
    const aiResults = await runAIModel(imagePath);
    
    // Check if image is AI-generated and reject if true
    if (aiResults.ai_detection.is_ai_generated) {
      // Delete the uploaded file
      await fs.unlink(imagePath);
      return res.status(400).json({ 
        message: 'AI-generated images are not allowed. Please upload a real photo.',
        aiDetection: aiResults.ai_detection
      });
    }
    
    // Generate unique PAW_ID
    const pawId = generatePawId();
    
    // Get shelter ID from request
    const shelterId = req.body.shelterId;
    
    // Create animal record
    const animal = await Animal.create({
      paw_id: pawId,
      animalId: pawId, // Use paw_id as animalId too
      name: req.body.name || 'Unnamed',
      species: 'Dog',
      breed: req.body.breed || 'Mixed',
      age: req.body.age || 'Unknown',
      gender: req.body.gender || 'Unknown',
      status: aiResults.injury_detection.is_injured ? 'Under Treatment' : 'Rescued',
      currentShelter: shelterId || null, // Link to shelter
      rescuedBy: shelterId || null, // Link to shelter
      healthStatus: {
        vaccinated: req.body.vaccinated || false,
        sterilized: req.body.neutered || false,
        injured: aiResults.injury_detection.is_injured || false,
        medicalNotes: aiResults.injury_detection.is_injured ? 'Injured - Needs Veterinary Care' : '',
        aiAnalysis: {
          injuryDetection: aiResults.injury_detection,
          aiImageDetection: aiResults.ai_detection,
          analyzedAt: new Date()
        }
      },
      location: {
        rescueLocation: {
          address: req.body.address || 'Location from image',
          city: req.body.city || 'Bangalore',
          state: req.body.state || 'Karnataka',
          coordinates: {
            lat: location.lat,
            lng: location.lng
          }
        }
      },
      media: {
        photos: [`/uploads/${req.file.filename}`]
      },
      rescueDetails: {
        rescuedBy: null, // Will add user ref later
        rescuerName: req.body.rescuedBy || 'Admin',
        rescueDate: new Date(),
        rescueReason: req.body.description || 'Rescued dog added by admin',
        initialCondition: aiResults.injury_detection.is_injured ? 'Injured' : 'Healthy'
      }
    });

    console.log('✅ Animal saved to database:', animal._id);

    // Update shelter if shelterId was provided
    if (shelterId) {
      try {
        await Shelter.findByIdAndUpdate(shelterId, {
          $push: { animals: animal._id },
          $inc: { 'capacity.current': 1 }
        });
        console.log(`✅ Added animal to shelter: ${shelterId}`);
      } catch (shelterError) {
        console.error('Error updating shelter:', shelterError);
        // Don't fail the request if shelter update fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Rescued dog added successfully',
      data: {
        animal,
        aiAnalysis: {
          injuryDetected: aiResults.injury_detection.is_injured,
          injuryConfidence: aiResults.injury_detection.confidence,
          needsVeterinaryCare: aiResults.injury_detection.is_injured,
          imageIsReal: !aiResults.ai_detection.is_ai_generated
        }
      }
    });
    
  } catch (error) {
    console.error('Error adding rescued dog:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error adding rescued dog', 
      error: error.message 
    });
  }
};

// @route   GET /api/rescued-dogs
// @desc    Get all rescued dogs
// @access  Public
exports.getRescuedDogs = async (req, res) => {
  try {
    const animals = await Animal.find({ species: 'Dog' })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: animals.length,
      data: animals
    });
  } catch (error) {
    console.error('Error fetching rescued dogs:', error);
    res.status(500).json({ 
      message: 'Error fetching rescued dogs', 
      error: error.message 
    });
  }
};

// @route   GET /api/rescued-dogs/:id
// @desc    Get single rescued dog
// @access  Public
exports.getRescuedDogById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Dog not found' });
    }
    
    res.status(200).json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Error fetching rescued dog:', error);
    res.status(500).json({ 
      message: 'Error fetching rescued dog', 
      error: error.message 
    });
  }
};

// @route   POST /api/rescued-dogs/:id/medical-report
// @desc    Upload medical report for a dog
// @access  Private (Admin only)
exports.uploadMedicalReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    const medicalReport = {
      filename: req.file.originalname,
      filepath: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
      uploadedBy: req.body.uploadedBy || 'Admin',
      description: req.body.description || ''
    };

    // Initialize media.medicalReports if it doesn't exist
    if (!animal.media) {
      animal.media = { photos: [], videos: [], medicalReports: [] };
    }
    if (!animal.media.medicalReports) {
      animal.media.medicalReports = [];
    }

    animal.media.medicalReports.push(medicalReport);
    await animal.save();

    console.log('✅ Medical report uploaded:', medicalReport.filename);

    res.status(200).json({
      success: true,
      message: 'Medical report uploaded successfully',
      data: medicalReport
    });
  } catch (error) {
    console.error('Error uploading medical report:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error uploading medical report', 
      error: error.message 
    });
  }
};

// @route   PUT /api/rescued-dogs/:id
// @desc    Update rescued dog information
// @access  Private (Admin only)
exports.updateRescuedDog = async (req, res) => {
  try {
    console.log('📝 Update request received for ID:', req.params.id);
    console.log('📝 Update data:', JSON.stringify(req.body, null, 2));
    
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      console.log('❌ Dog not found:', req.params.id);
      return res.status(404).json({ message: 'Dog not found' });
    }

    console.log('📝 Current animal data:', {
      name: animal.name,
      age: animal.age,
      gender: animal.gender,
      status: animal.status,
      breed: animal.breed,
      color: animal.color,
      healthStatus: animal.healthStatus
    });

    // Update basic information
    if (req.body.name !== undefined) animal.name = req.body.name;
    if (req.body.age !== undefined) animal.age = req.body.age;
    if (req.body.gender !== undefined) animal.gender = req.body.gender;
    if (req.body.status !== undefined) animal.status = req.body.status;
    if (req.body.breed !== undefined) animal.breed = req.body.breed;
    if (req.body.color !== undefined) animal.color = req.body.color;

    // Update health status
    if (req.body.healthStatus) {
      if (!animal.healthStatus) {
        animal.healthStatus = {};
      }
      if (req.body.healthStatus.vaccination !== undefined) {
        animal.healthStatus.vaccinated = req.body.healthStatus.vaccination;
      }
      if (req.body.healthStatus.sterilization !== undefined) {
        animal.healthStatus.sterilized = req.body.healthStatus.sterilization;
      }
      if (req.body.healthStatus.injuries !== undefined) {
        animal.healthStatus.injuries = req.body.healthStatus.injuries;
      }
    }

    await animal.save();

    console.log('✅ Animal updated successfully:', {
      name: animal.name,
      age: animal.age,
      gender: animal.gender,
      status: animal.status,
      breed: animal.breed,
      color: animal.color,
      healthStatus: animal.healthStatus
    });

    res.status(200).json({
      success: true,
      message: 'Animal information updated successfully',
      data: animal
    });
  } catch (error) {
    console.error('❌ Error updating rescued dog:', error);
    res.status(500).json({ 
      message: 'Error updating rescued dog', 
      error: error.message 
    });
  }
};
