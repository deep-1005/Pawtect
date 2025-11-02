import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Calendar, Heart, Syringe, Scissors, AlertCircle, Download, Upload, FileText, X, Edit } from 'lucide-react';

const AnimalProfile = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDescription, setReportDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    // Fetch real animal data from API
    const fetchAnimal = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/rescued-dogs/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setAnimal(data.data);
        } else {
          console.error('Failed to fetch animal');
        }
      } catch (error) {
        console.error('Error fetching animal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

  const handleReportUpload = async () => {
    if (!selectedReport) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('medicalReport', selectedReport);
    formData.append('description', reportDescription);
    formData.append('uploadedBy', localStorage.getItem('userName') || 'Admin');

    try {
      console.log('Uploading medical report for dog ID:', id);
      const response = await fetch(`http://localhost:5000/api/rescued-dogs/${id}/medical-report`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.success) {
        alert('Medical report uploaded successfully!');
        setShowUploadModal(false);
        setSelectedReport(null);
        setReportDescription('');
        // Refresh animal data
        window.location.reload();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Error uploading medical report: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = () => {
    const formData = {
      name: animal.name || '',
      age: animal.age || '',
      gender: animal.gender || '',
      status: animal.status || 'Rescued',
      vaccination: animal.healthStatus?.vaccinated || false,
      sterilization: animal.healthStatus?.sterilized || false,
      injuries: animal.healthStatus?.injuries || '',
      breed: animal.breed || '',
      color: animal.color || ''
    };
    console.log('Opening edit form with data:', formData);
    console.log('Current animal:', animal);
    setEditForm(formData);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    console.log('Saving edit with form data:', editForm);
    setSaving(true);

    try {
      const updateData = {
        name: editForm.name,
        age: editForm.age,
        gender: editForm.gender,
        status: editForm.status,
        breed: editForm.breed,
        color: editForm.color,
        healthStatus: {
          vaccination: editForm.vaccination,
          sterilization: editForm.sterilization,
          injuries: editForm.injuries
        }
      };
      
      console.log('Sending PUT request with:', updateData);
      
      const response = await fetch(`http://localhost:5000/api/rescued-dogs/${animal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update response:', result);
        if (result.success) {
          setAnimal(result.data);
          setShowEditModal(false);
          alert('Animal information updated successfully!');
          // Reload to ensure all changes are reflected
          window.location.reload();
        } else {
          alert('Failed to update animal information');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update animal information');
      }
    } catch (error) {
      console.error('Error updating animal:', error);
      alert('Error updating animal information: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading animal details...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Animal not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'Rescued': 'bg-blue-100 text-blue-800',
      'In Shelter': 'bg-yellow-100 text-yellow-800',
      'Under Treatment': 'bg-orange-100 text-orange-800',
      'Ready for Adoption': 'bg-green-100 text-green-800',
      'Adopted': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left: Image Gallery */}
            <div>
              <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                <img
                  src={animal.media?.photos?.[0] ? `http://localhost:5000${animal.media.photos[0]}` : 'https://via.placeholder.com/800x600?text=No+Image'}
                  alt={animal.name || 'Rescued Dog'}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 right-4 px-4 py-2 rounded-full font-semibold ${getStatusColor(animal.status)}`}>
                  {animal.status}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {animal.media?.photos?.slice(1).map((photo, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:5000${photo}`}
                    alt={`${animal.name} ${idx + 2}`}
                    className="h-24 w-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                  />
                ))}
              </div>
            </div>

            {/* Right: Basic Info */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {animal.name && animal.name !== 'Unnamed' ? animal.name : `Rescued Dog ${animal.paw_id || animal.animalId}`}
                  </h1>
                  <p className="text-xl text-gray-600">{animal.breed || 'Unknown breed'}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-mono mb-1">PAW ID</div>
                  <div className="text-lg font-semibold text-primary-600">{animal.paw_id || animal.animalId}</div>
                </div>
              </div>

              {/* Admin Edit Button */}
              {userRole === 'authority' && (
                <button
                  onClick={handleEditClick}
                  className="mb-4 w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  <Edit className="w-5 h-5" />
                  Edit Animal Information
                </button>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Species</div>
                  <div className="text-lg font-semibold">{animal.species || 'Unknown'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Age</div>
                  <div className="text-lg font-semibold">{animal.age || 'Unknown'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Gender</div>
                  <div className="text-lg font-semibold">{animal.gender || 'Unknown'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Rescue Date</div>
                  <div className="text-lg font-semibold">
                    {animal.rescueDetails?.rescueDate 
                      ? new Date(animal.rescueDetails.rescueDate).toLocaleDateString() 
                      : 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Health Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Health Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Syringe className={`h-5 w-5 mr-2 ${animal.healthStatus?.vaccinated ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={animal.healthStatus?.vaccinated ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {animal.healthStatus?.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Scissors className={`h-5 w-5 mr-2 ${animal.healthStatus?.sterilized ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={animal.healthStatus?.sterilized ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {animal.healthStatus?.sterilized ? 'Sterilized' : 'Not Sterilized'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className={`h-5 w-5 mr-2 ${animal.healthStatus?.injured ? 'text-orange-600' : 'text-green-600'}`} />
                    <span className={animal.healthStatus?.injured ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                      {animal.healthStatus?.injured ? 'Injured' : 'Healthy'}
                    </span>
                  </div>
                </div>
                {animal.healthStatus?.medicalNotes && (
                  <p className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    {animal.healthStatus.medicalNotes}
                  </p>
                )}
                {animal.healthStatus?.aiAnalysis && (
                  <div className="mt-4 bg-purple-50 p-3 rounded">
                    <p className="text-sm font-semibold text-purple-900 mb-1">AI Analysis</p>
                    <p className="text-sm text-purple-700">
                      Injury Status: {animal.healthStatus.aiAnalysis.injuryDetection?.status || 'Unknown'} 
                      {animal.healthStatus.aiAnalysis.injuryDetection?.confidence && 
                        ` (${Math.round(animal.healthStatus.aiAnalysis.injuryDetection.confidence * 100)}%)`}
                    </p>
                    <p className="text-sm text-purple-700">
                      Image Type: {animal.healthStatus.aiAnalysis.aiImageDetection?.status || 'Real'} 
                      {animal.healthStatus.aiAnalysis.aiImageDetection?.confidence && 
                        ` (${Math.round(animal.healthStatus.aiAnalysis.aiImageDetection.confidence * 100)}%)`}
                    </p>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-3">Scan QR Code</h3>
                <div className="inline-block bg-white p-4 rounded-lg">
                  <QRCodeSVG 
                    value={window.location.href}
                    size={150}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Scan to view details on mobile
                </p>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2">QR Code URL:</p>
                  <p className="text-xs text-blue-700 break-all font-mono">
                    {window.location.href}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Make sure your phone is on the same WiFi network
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    WiFi Network IP: 172.16.128.223
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const svg = document.querySelector('.bg-white.p-4.rounded-lg svg');
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL('image/png');
                      const downloadLink = document.createElement('a');
                      downloadLink.download = `QR_${animal.paw_id || animal._id}.png`;
                      downloadLink.href = pngFile;
                      downloadLink.click();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                  }}
                  className="mt-3 text-primary-600 hover:text-primary-700 flex items-center justify-center mx-auto"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-primary-600" />
              Rescue Location
            </h2>
            <p className="text-gray-700 mb-2">{animal.location?.rescueLocation?.address || 'Unknown address'}</p>
            <p className="text-gray-600">
              {animal.location?.rescueLocation?.city || 'Unknown city'}, {animal.location?.rescueLocation?.state || 'Unknown state'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-primary-600" />
              Current Location
            </h2>
            <p className="text-gray-700 mb-2 font-semibold">
              {animal.location?.currentLocation?.shelterName || 'Not in shelter yet'}
            </p>
            <p className="text-gray-600">{animal.location?.currentLocation?.address || ''}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-primary-600" />
            Rescue Timeline
          </h2>
          {animal.timeline && animal.timeline.length > 0 ? (
            <div className="space-y-4">
              {animal.timeline.map((entry, index) => (
                <div key={index} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    {index < animal.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-primary-200 mt-1"></div>
                    )}
                  </div>
                  <div className="pb-8 flex-1">
                    <div className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="font-semibold text-gray-900">{entry.event}</div>
                    <div className="text-gray-600 text-sm">{entry.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No timeline events yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Rescued on {animal.rescueDetails?.rescueDate 
                  ? new Date(animal.rescueDetails.rescueDate).toLocaleDateString() 
                  : 'Unknown date'}
              </p>
            </div>
          )}
        </div>

        {/* Medical Reports Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FileText className="h-6 w-6 mr-2 text-primary-600" />
              Medical Reports
            </h2>
            {userRole === 'authority' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Report
              </button>
            )}
          </div>

          {animal.media?.medicalReports && animal.media.medicalReports.length > 0 ? (
            <div className="space-y-4">
              {animal.media.medicalReports.map((report, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <h3 className="font-semibold text-gray-900">{report.filename}</h3>
                      </div>
                      {report.description && (
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}</span>
                        {report.uploadedBy && <span>By: {report.uploadedBy}</span>}
                      </div>
                    </div>
                    <a
                      href={`http://localhost:5000${report.filepath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No medical reports uploaded yet</p>
              {userRole === 'authority' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Upload First Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Upload Medical Report Modal */}
    {showUploadModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Upload Medical Report</h3>
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedReport(null);
                setReportDescription('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File (PDF, Image, or Document)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setSelectedReport(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {selectedReport && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Selected: {selectedReport.name} ({(selectedReport.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="E.g., Vaccination record, X-ray results, Blood test..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={handleReportUpload}
              disabled={!selectedReport || uploading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Animal Modal */}
    {showEditModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Edit Animal Information</h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    value={editForm.age}
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="E.g., 2 years, 6 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={editForm.breed}
                    onChange={(e) => setEditForm({...editForm, breed: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter breed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={editForm.color}
                    onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter color"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Rescued">Rescued</option>
                    <option value="In Shelter">In Shelter</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Ready for Adoption">Ready for Adoption</option>
                    <option value="Adopted">Adopted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Health Status Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Status</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.vaccination}
                      onChange={(e) => setEditForm({...editForm, vaccination: e.target.checked})}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Vaccinated</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.sterilization}
                      onChange={(e) => setEditForm({...editForm, sterilization: e.target.checked})}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Sterilized</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Injuries / Health Issues
                  </label>
                  <textarea
                    value={editForm.injuries}
                    onChange={(e) => setEditForm({...editForm, injuries: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe any injuries, health conditions, or treatment needed..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AnimalProfile;