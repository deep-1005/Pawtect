const CrueltyReport = require('../models/CrueltyReport');
const fs = require('fs').promises;

// Generate unique Report ID
const generateReportId = () => {
  const prefix = 'CR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// @route   POST /api/cruelty-reports
// @desc    Submit a cruelty report
// @access  Public (Citizens/Volunteers)
exports.submitReport = async (req, res) => {
  try {
    console.log('📝 New cruelty report submission');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const reportId = generateReportId();
    
    // Process uploaded files
    const photos = [];
    const videos = [];
    
    if (req.files) {
      if (req.files.photos) {
        req.files.photos.forEach(file => {
          photos.push({
            path: `/uploads/${file.filename}`,
            uploadedAt: new Date()
          });
        });
      }
      
      if (req.files.videos) {
        req.files.videos.forEach(file => {
          videos.push({
            path: `/uploads/${file.filename}`,
            uploadedAt: new Date()
          });
        });
      }
    }

    // Create report
    const report = await CrueltyReport.create({
      reportId,
      reportedBy: {
        userId: req.body.userId || null,
        name: req.body.isAnonymous === 'true' ? 'Anonymous' : req.body.reporterName,
        email: req.body.isAnonymous === 'true' ? null : req.body.reporterEmail,
        phone: req.body.isAnonymous === 'true' ? null : req.body.reporterPhone,
        isAnonymous: req.body.isAnonymous === 'true'
      },
      incident: {
        type: req.body.incidentType,
        description: req.body.description,
        severity: req.body.severity || 'Medium',
        dateTime: req.body.incidentDate || new Date(),
        isOngoing: req.body.isOngoing === 'true'
      },
      location: {
        address: req.body.address,
        city: req.body.city,
        state: req.body.state || 'Karnataka',
        pincode: req.body.pincode,
        coordinates: {
          lat: parseFloat(req.body.latitude) || 12.9716,
          lng: parseFloat(req.body.longitude) || 77.5946
        },
        landmark: req.body.landmark
      },
      evidence: {
        photos,
        videos
      },
      priority: req.body.severity === 'Critical' ? 'Urgent' : 
                req.body.severity === 'High' ? 'High' : 'Medium',
      timeline: [{
        action: 'Report Submitted',
        description: 'Cruelty report submitted by ' + (req.body.isAnonymous === 'true' ? 'anonymous user' : req.body.reporterName),
        timestamp: new Date()
      }]
    });

    console.log('✅ Cruelty report created:', report.reportId);

    res.status(201).json({
      success: true,
      message: 'Cruelty report submitted successfully',
      data: {
        reportId: report.reportId,
        status: report.status,
        _id: report._id
      }
    });
  } catch (error) {
    console.error('❌ Error submitting cruelty report:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      const allFiles = [
        ...(req.files.photos || []),
        ...(req.files.videos || [])
      ];
      
      for (const file of allFiles) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error submitting cruelty report',
      error: error.message
    });
  }
};

// @route   GET /api/cruelty-reports
// @desc    Get all cruelty reports (Admin)
// @access  Private (Admin)
exports.getAllReports = async (req, res) => {
  try {
    const { status, severity, city, priority } = req.query;
    
    let filter = { isActive: true };
    
    if (status) filter.status = status;
    if (severity) filter['incident.severity'] = severity;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (priority) filter.priority = priority;

    const reports = await CrueltyReport.find(filter)
      .populate('reportedBy.userId', 'name email')
      .populate('assignedTo', 'name contactInfo')
      .populate('resolution.resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cruelty reports',
      error: error.message
    });
  }
};

// @route   GET /api/cruelty-reports/my-reports/:userId
// @desc    Get reports by specific user
// @access  Public
exports.getMyReports = async (req, res) => {
  try {
    const reports = await CrueltyReport.find({
      'reportedBy.userId': req.params.userId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
};

// @route   GET /api/cruelty-reports/:id
// @desc    Get single report
// @access  Public
exports.getReportById = async (req, res) => {
  try {
    const report = await CrueltyReport.findById(req.params.id)
      .populate('reportedBy.userId', 'name email')
      .populate('assignedTo', 'name contactInfo address')
      .populate('resolution.resolvedBy', 'name')
      .populate('timeline.performedBy', 'name')
      .populate('adminNotes.addedBy', 'name');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

// @route   PUT /api/cruelty-reports/:id/status
// @desc    Update report status
// @access  Private (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes, performedBy } = req.body;

    const report = await CrueltyReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    
    // Add to timeline
    report.timeline.push({
      action: `Status Changed to ${status}`,
      description: notes || `Report status updated to ${status}`,
      performedBy: performedBy || null,
      timestamp: new Date()
    });

    await report.save();

    console.log('✅ Report status updated:', report.reportId, '→', status);

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report status',
      error: error.message
    });
  }
};

// @route   PUT /api/cruelty-reports/:id/assign
// @desc    Assign report to shelter/NGO
// @access  Private (Admin)
exports.assignReport = async (req, res) => {
  try {
    const { shelterId, performedBy } = req.body;

    const report = await CrueltyReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.assignedTo = shelterId;
    report.status = 'Under Investigation';
    
    report.timeline.push({
      action: 'Report Assigned',
      description: `Report assigned to shelter/NGO`,
      performedBy: performedBy || null,
      timestamp: new Date()
    });

    await report.save();

    console.log('✅ Report assigned:', report.reportId);

    res.status(200).json({
      success: true,
      message: 'Report assigned successfully',
      data: report
    });
  } catch (error) {
    console.error('Error assigning report:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning report',
      error: error.message
    });
  }
};

// @route   PUT /api/cruelty-reports/:id/resolve
// @desc    Mark report as resolved
// @access  Private (Admin)
exports.resolveReport = async (req, res) => {
  try {
    const { resolvedBy, notes, actionTaken, animalsRescued, followUpRequired } = req.body;

    const report = await CrueltyReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'Resolved';
    report.resolution = {
      resolvedBy: resolvedBy || null,
      resolvedAt: new Date(),
      notes: notes || '',
      actionTaken: actionTaken || '',
      animalsRescued: parseInt(animalsRescued) || 0,
      followUpRequired: followUpRequired === 'true' || false
    };
    
    report.timeline.push({
      action: 'Report Resolved',
      description: actionTaken || 'Report marked as resolved',
      performedBy: resolvedBy || null,
      timestamp: new Date()
    });

    await report.save();

    console.log('✅ Report resolved:', report.reportId);

    res.status(200).json({
      success: true,
      message: 'Report resolved successfully',
      data: report
    });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving report',
      error: error.message
    });
  }
};

// @route   POST /api/cruelty-reports/:id/notes
// @desc    Add admin note to report
// @access  Private (Admin)
exports.addAdminNote = async (req, res) => {
  try {
    const { note, addedBy } = req.body;

    const report = await CrueltyReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.adminNotes.push({
      note,
      addedBy: addedBy || null,
      addedAt: new Date()
    });

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: report
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
};

// @route   GET /api/cruelty-reports/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalReports = await CrueltyReport.countDocuments({ isActive: true });
    const pending = await CrueltyReport.countDocuments({ status: 'Pending', isActive: true });
    const underInvestigation = await CrueltyReport.countDocuments({ status: 'Under Investigation', isActive: true });
    const resolved = await CrueltyReport.countDocuments({ status: 'Resolved', isActive: true });
    const critical = await CrueltyReport.countDocuments({ 'incident.severity': 'Critical', status: { $ne: 'Resolved' }, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        pending,
        underInvestigation,
        resolved,
        critical
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = exports;
