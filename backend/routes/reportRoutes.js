const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// @route   GET /api/reports
// @desc    Get all reports with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, type, city, priority } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (type) filter.reportType = type;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (priority) filter.priority = priority;

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo.shelter', 'name address')
      .populate('linkedAnimal', 'animalId name status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

// @route   GET /api/reports/:id
// @desc    Get single report
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo.shelter', 'name contactInfo address')
      .populate('assignedTo.volunteer', 'name phone')
      .populate('linkedAnimal')
      .populate('updates.updatedBy', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
});

// @route   POST /api/reports
// @desc    Create new report
// @access  Public
router.post('/', async (req, res) => {
  try {
    const reportData = req.body;

    // Auto-assign priority based on report type
    if (reportData.reportType === 'Injured Animal' || reportData.reportType === 'Cruelty') {
      reportData.priority = 'High';
    } else if (reportData.reportType === 'Dead Animal') {
      reportData.priority = 'Critical';
    }

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
});

// @route   PUT /api/reports/:id/status
// @desc    Update report status
// @access  Private (Shelter/NGO)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, comment, updatedBy } = req.body;

    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update status
    report.status = status;
    
    // Add update to timeline
    report.updates.push({
      status,
      comment,
      updatedBy
    });

    // If resolved, add resolution date
    if (status === 'Resolved' || status === 'Closed') {
      report.resolvedDate = Date.now();
      if (comment) report.resolutionNotes = comment;
    }

    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
});

// @route   PUT /api/reports/:id/assign
// @desc    Assign report to shelter/volunteer
// @access  Private (Authority)
router.put('/:id/assign', async (req, res) => {
  try {
    const { shelterId, volunteerId } = req.body;

    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Assign to shelter/volunteer
    if (shelterId) {
      report.assignedTo.shelter = shelterId;
      report.assignedTo.assignedDate = Date.now();
    }
    if (volunteerId) {
      report.assignedTo.volunteer = volunteerId;
    }

    report.status = 'Assigned';
    
    report.updates.push({
      status: 'Assigned',
      comment: `Report assigned to ${shelterId ? 'shelter' : 'volunteer'}`
    });

    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({ message: 'Error assigning report', error: error.message });
  }
});

// @route   PUT /api/reports/:id/link-animal
// @desc    Link report to rescued animal
// @access  Private (Shelter/NGO)
router.put('/:id/link-animal', async (req, res) => {
  try {
    const { animalId } = req.body;

    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.linkedAnimal = animalId;
    report.status = 'Rescued';
    
    report.updates.push({
      status: 'Rescued',
      comment: 'Animal rescued and added to system'
    });

    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Link animal error:', error);
    res.status(500).json({ message: 'Error linking animal', error: error.message });
  }
});

// @route   GET /api/reports/stats/dashboard
// @desc    Get report statistics
// @access  Public
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pending = await Report.countDocuments({ status: 'Pending' });
    const inProgress = await Report.countDocuments({ status: { $in: ['Under Review', 'Assigned'] } });
    const resolved = await Report.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        pending,
        inProgress,
        resolved
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;