import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Camera, Video, Send, CheckCircle, Clock, User, Shield } from 'lucide-react';

const ReportCruelty = () => {
  const [formData, setFormData] = useState({
    incidentType: 'Physical Abuse',
    description: '',
    severity: 'Medium',
    address: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    landmark: '',
    latitude: '',
    longitude: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    isAnonymous: false,
    isOngoing: false,
    incidentDate: new Date().toISOString().slice(0, 16)
  });

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [videoPreview, setVideoPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  // Auto-fill user info if logged in
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userName && !formData.isAnonymous) {
      setFormData(prev => ({
        ...prev,
        reporterName: userName,
        reporterEmail: userEmail || ''
      }));
    }
  }, [formData.isAnonymous]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview(previews);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setVideos(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setVideoPreview(previews);
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          setGettingLocation(false);
          alert('Location captured successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enter manually.');
          setGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || formData.description.length < 20) {
      alert('Please provide a detailed description (at least 20 characters)');
      return;
    }

    if (photos.length === 0 && videos.length === 0) {
      const confirm = window.confirm('No evidence attached. It\'s highly recommended to attach photos or videos. Continue anyway?');
      if (!confirm) return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add userId if logged in
      const userId = localStorage.getItem('userId');
      if (userId) {
        formDataToSend.append('userId', userId);
      }

      // Add photos
      photos.forEach(photo => {
        formDataToSend.append('photos', photo);
      });

      // Add videos
      videos.forEach(video => {
        formDataToSend.append('videos', video);
      });

      console.log('Submitting cruelty report...');

      const response = await fetch('http://localhost:5000/api/cruelty-reports', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setReportId(result.data.reportId);
        setSubmitted(true);
        alert('Report submitted successfully! Report ID: ' + result.data.reportId);
      } else {
        alert('Failed to submit report: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h2>
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Report ID</p>
              <p className="text-2xl font-bold text-green-600">{reportId}</p>
            </div>
            <p className="text-gray-600 mb-6">
              Thank you for reporting animal cruelty. Our team will investigate this matter immediately.
              You can track your report status using the Report ID above.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setReportId('');
                  setFormData({
                    incidentType: 'Physical Abuse',
                    description: '',
                    severity: 'Medium',
                    address: '',
                    city: '',
                    state: 'Karnataka',
                    pincode: '',
                    landmark: '',
                    latitude: '',
                    longitude: '',
                    reporterName: '',
                    reporterEmail: '',
                    reporterPhone: '',
                    isAnonymous: false,
                    isOngoing: false,
                    incidentDate: new Date().toISOString().slice(0, 16)
                  });
                  setPhotos([]);
                  setVideos([]);
                  setPhotoPreview([]);
                  setVideoPreview([]);
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Submit Another Report
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-4 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-red-900 mb-2">Report Animal Cruelty</h1>
              <p className="text-red-700">
                Your report can save lives. All reports are taken seriously and investigated promptly.
                You can report anonymously if you prefer.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Anonymous Reporting Toggle */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Report Anonymously</span>
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-2 ml-8">
              Your identity will not be shared. We'll only use this information for investigation purposes.
            </p>
          </div>

          {/* Incident Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Incident Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Cruelty *
                </label>
                <select
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Physical Abuse">Physical Abuse</option>
                  <option value="Neglect">Neglect</option>
                  <option value="Abandonment">Abandonment</option>
                  <option value="Illegal Trade">Illegal Trade</option>
                  <option value="Fighting">Animal Fighting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level *
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Low">Low - Minor Issue</option>
                  <option value="Medium">Medium - Requires Attention</option>
                  <option value="High">High - Serious Situation</option>
                  <option value="Critical">Critical - Life-Threatening</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isOngoing"
                    checked={formData.isOngoing}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <span className="font-medium text-gray-900">This is an ongoing situation</span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description * (minimum 20 characters)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
                placeholder="Please describe what you witnessed in detail. Include information about the animal(s), the perpetrator (if safe to do so), and the circumstances..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Location Details
            </h3>

            <div className="mb-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" />
                {gettingLocation ? 'Getting Location...' : 'Use My Current Location'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address or area"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="City name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit pincode"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="E.g., Near ABC School, Behind XYZ Mall"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-600" />
              Evidence (Highly Recommended)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Max 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {photoPreview.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {photoPreview.map((preview, idx) => (
                      <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Videos (Max 2, 50MB each)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {videoPreview.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {videos.length} video(s) selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {!formData.isAnonymous && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Your Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="reporterName"
                    value={formData.reporterName}
                    onChange={handleInputChange}
                    required={!formData.isAnonymous}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="reporterEmail"
                    value={formData.reporterEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="reporterPhone"
                    value={formData.reporterPhone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCruelty;
