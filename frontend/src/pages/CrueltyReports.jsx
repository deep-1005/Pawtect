import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Filter, Search, MapPin, Calendar, User, Eye, FileText, Shield } from 'lucide-react';

const CrueltyReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shelters, setShelters] = useState([]);
  
  const [actionForm, setActionForm] = useState({
    status: '',
    assignedTo: '',
    notes: '',
    actionTaken: '',
    animalsRescued: 0,
    followUpRequired: false
  });

  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my-reports'

  useEffect(() => {
    // If regular user (not authority), show only their reports by default
    if (userRole !== 'authority') {
      setViewMode('my-reports');
    }
    fetchReports();
    fetchStats();
    if (userRole === 'authority') {
      fetchShelters();
    }
  }, [viewMode]); // Re-fetch when viewMode changes

  useEffect(() => {
    applyFilters();
  }, [reports, filterStatus, filterSeverity, searchTerm]);

  const fetchReports = async () => {
    try {
      let url = 'http://localhost:5000/api/cruelty-reports';
      
      // If regular user or viewing "my reports", fetch only user's reports
      if ((userRole !== 'authority' || viewMode === 'my-reports') && userId) {
        url = `http://localhost:5000/api/cruelty-reports/my-reports/${userId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cruelty-reports/stats/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchShelters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/shelters');
      const data = await response.json();
      
      if (data.success) {
        setShelters(data.data);
      }
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(report => report.incident.severity === filterSeverity);
    }

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleUpdateStatus = async (reportId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cruelty-reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          performedBy: userId,
          notes: actionForm.notes || `Status changed to ${status}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Status updated successfully!');
        fetchReports();
        fetchStats();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleAssignReport = async (reportId) => {
    if (!actionForm.assignedTo) {
      alert('Please select a shelter/NGO');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/cruelty-reports/${reportId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shelterId: actionForm.assignedTo,
          performedBy: userId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Report assigned successfully!');
        fetchReports();
        fetchStats();
        setActionForm({ ...actionForm, assignedTo: '' });
      }
    } catch (error) {
      console.error('Error assigning report:', error);
      alert('Failed to assign report');
    }
  };

  const handleResolveReport = async (reportId) => {
    if (!actionForm.actionTaken) {
      alert('Please describe the action taken');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/cruelty-reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolvedBy: userId,
          notes: actionForm.notes,
          actionTaken: actionForm.actionTaken,
          animalsRescued: actionForm.animalsRescued,
          followUpRequired: actionForm.followUpRequired
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Report marked as resolved!');
        fetchReports();
        fetchStats();
        setShowModal(false);
        setActionForm({
          status: '',
          assignedTo: '',
          notes: '',
          actionTaken: '',
          animalsRescued: 0,
          followUpRequired: false
        });
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Failed to resolve report');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Under Investigation': 'bg-blue-100 text-blue-800 border-blue-300',
      'Action Taken': 'bg-purple-100 text-purple-800 border-purple-300',
      'Resolved': 'bg-green-100 text-green-800 border-green-300',
      'Dismissed': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === 'authority' ? 'Cruelty Reports Management' : 'My Cruelty Reports'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'authority' 
              ? 'Monitor and manage animal cruelty reports' 
              : 'Track your submitted cruelty reports'}
          </p>
        </div>

        {/* View Mode Toggle - Admin Only */}
        {userRole === 'authority' && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setViewMode('my-reports')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'my-reports'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Reports
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {userRole === 'authority' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Under Investigation</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.underInvestigation || 0}</p>
                </div>
                <Search className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Action Taken">Action Taken</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Severity
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Severity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, description, or city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No reports found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left: Report Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-lg font-bold text-primary-600">
                        {report.reportId}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(report.incident.severity)}`}>
                        {report.incident.severity}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {report.incident.type}
                    </h3>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {report.incident.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {report.location.city}, {report.location.state}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {report.reportedBy.isAnonymous ? 'Anonymous' : report.reportedBy.name}
                      </div>
                    </div>

                    {report.evidence.photos.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {report.evidence.photos.slice(0, 3).map((photo, idx) => (
                          <img
                            key={idx}
                            src={`http://localhost:5000${photo.path}`}
                            alt={`Evidence ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border border-gray-200"
                          />
                        ))}
                        {report.evidence.photos.length > 3 && (
                          <div className="w-20 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-600">
                            +{report.evidence.photos.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {userRole === 'authority' && report.status !== 'Resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(report._id, 'Under Investigation')}
                        disabled={report.status === 'Under Investigation'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Investigate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.reportId}</h2>
                  <p className="text-gray-600">{selectedReport.incident.type}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Report Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status & Severity</h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedReport.incident.severity)}`}>
                      {selectedReport.incident.severity}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedReport.incident.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">
                    {selectedReport.location.address}, {selectedReport.location.city}
                    {selectedReport.location.landmark && ` - Near ${selectedReport.location.landmark}`}
                  </p>
                </div>

                {!selectedReport.reportedBy.isAnonymous && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reporter</h3>
                    <p className="text-gray-600">
                      {selectedReport.reportedBy.name}
                      {selectedReport.reportedBy.email && ` - ${selectedReport.reportedBy.email}`}
                      {selectedReport.reportedBy.phone && ` - ${selectedReport.reportedBy.phone}`}
                    </p>
                  </div>
                )}

                {selectedReport.evidence.photos.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Evidence Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedReport.evidence.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000${photo.path}`}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-40 object-cover rounded border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {userRole === 'authority' && selectedReport.status !== 'Resolved' && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Admin Actions</h3>

                    {/* Assign to Shelter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to Shelter/NGO
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={actionForm.assignedTo}
                          onChange={(e) => setActionForm({ ...actionForm, assignedTo: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Shelter/NGO</option>
                          {shelters.map(shelter => (
                            <option key={shelter._id} value={shelter._id}>{shelter.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignReport(selectedReport._id)}
                          disabled={!actionForm.assignedTo}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Assign
                        </button>
                      </div>
                    </div>

                    {/* Resolve Report */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Action Taken *
                        </label>
                        <textarea
                          value={actionForm.actionTaken}
                          onChange={(e) => setActionForm({ ...actionForm, actionTaken: e.target.value })}
                          rows="3"
                          placeholder="Describe the action taken..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resolution Notes
                        </label>
                        <textarea
                          value={actionForm.notes}
                          onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                          rows="2"
                          placeholder="Additional notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Animals Rescued
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={actionForm.animalsRescued}
                            onChange={(e) => setActionForm({ ...actionForm, animalsRescued: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={actionForm.followUpRequired}
                              onChange={(e) => setActionForm({ ...actionForm, followUpRequired: e.target.checked })}
                              className="w-5 h-5 text-primary-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Follow-up Required</span>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => handleResolveReport(selectedReport._id)}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                      >
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        Mark as Resolved
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrueltyReports;
