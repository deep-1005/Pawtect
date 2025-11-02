import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Heart, Plus, Upload, X, Loader, AlertTriangle, DollarSign, ChevronDown, MessageCircle } from 'lucide-react';
import Furries from '../components/Furries';

const Dashboard = () => {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState('');
  const [dogName, setDogName] = useState('');
  const [showDonateMenu, setShowDonateMenu] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');

  // Mock data - Replace with API call later
  useEffect(() => {
    // Fetch real animals from API
    const fetchAnimals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rescued-dogs');
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log(`✅ Loaded ${data.data.length} animals from API`);
          console.log('Indian Strays:', data.data.filter(a => a.type === 'Indian Street Dog').length);
          console.log('With Breeds:', data.data.filter(a => a.breed).length);
          setAnimals(data.data);
          setFilteredAnimals(data.data);
        } else {
          // Fallback to mock data if API fails
          setAnimals([]);
          setFilteredAnimals([]);
        }
      } catch (error) {
        console.error('Error fetching animals:', error);
        // Use empty array on error
        setAnimals([]);
        setFilteredAnimals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  // Fetch shelters for dropdown
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/shelters');
        const data = await response.json();
        if (data.success && data.data) {
          setShelters(data.data);
        }
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };
    fetchShelters();
  }, []);

  // Filter animals
  useEffect(() => {
    let filtered = animals;

    if (searchTerm) {
      filtered = filtered.filter(animal =>
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (animal.animalId && animal.animalId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (animal.paw_id && animal.paw_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (animal.breed && animal.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (animal.type && animal.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (animal.color && animal.color.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(animal => animal.status === statusFilter);
    }

    setFilteredAnimals(filtered);
  }, [searchTerm, statusFilter, animals]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload rescued dog
  const handleUploadDog = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    if (!selectedShelter) {
      alert('Please select a shelter');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('dogImage', selectedImage);
    formData.append('userRole', userRole);
    formData.append('rescuedBy', localStorage.getItem('userName'));
    formData.append('shelterId', selectedShelter);
    formData.append('name', dogName || 'Unnamed');

    try {
      const response = await fetch('http://localhost:5000/api/rescued-dogs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      console.log('Upload success! Response data:', data);

      setUploadResult({
        success: true,
        data: data.data,
        message: data.message
      });

      // Don't auto-close - user will click "Finish Upload" button
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  // Finish upload and close modal
  const finishUpload = () => {
    setShowAddModal(false);
    setSelectedImage(null);
    setImagePreview(null);
    setUploadResult(null);
    setSelectedShelter('');
    setDogName('');
    // Reload to fetch updated list
    window.location.reload();
  };

  // Reset modal
  const resetModal = () => {
    setShowAddModal(false);
    setSelectedImage(null);
    setImagePreview(null);
    setUploadResult(null);
    setSelectedShelter('');
    setDogName('');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading animals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rescued Animals Dashboard</h1>
            <p className="text-gray-600">
              Track and monitor all rescued animals in real-time • 
              <span className="font-semibold"> {filteredAnimals.length} of {animals.length} animals displayed</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Support Us Button - Citizens/Volunteers Only */}
            {userRole !== 'authority' && (
              <div className="relative">
                <button
                  onClick={() => setShowDonateMenu(!showDonateMenu)}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center gap-2 shadow-lg"
                >
                  <Heart className="h-5 w-5" />
                  Support Us
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showDonateMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <Link
                      to="/donate?type=shelter"
                      className="block px-4 py-3 hover:bg-green-50 border-b border-gray-100"
                      onClick={() => setShowDonateMenu(false)}
                    >
                      <div className="font-semibold text-gray-900">🏠 Donate to Shelters</div>
                      <div className="text-sm text-gray-600">Support shelter operations</div>
                    </Link>
                    <Link
                      to="/donate?type=platform"
                      className="block px-4 py-3 hover:bg-green-50 border-b border-gray-100"
                      onClick={() => setShowDonateMenu(false)}
                    >
                      <div className="font-semibold text-gray-900">💚 Donate to Pawtect</div>
                      <div className="text-sm text-gray-600">Help us grow the platform</div>
                    </Link>
                    <Link
                      to="/donate?type=sponsor"
                      className="block px-4 py-3 hover:bg-green-50"
                      onClick={() => setShowDonateMenu(false)}
                    >
                      <div className="font-semibold text-gray-900">🐾 Sponsor a Dog</div>
                      <div className="text-sm text-gray-600">Monthly support for a dog</div>
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Report Cruelty Button - Citizens/Volunteers Only */}
            {userRole !== 'authority' && (
              <Link
                to="/report-cruelty"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
              >
                <AlertTriangle className="h-5 w-5" />
                Report Cruelty
              </Link>
            )}
            
            {/* Add Rescued Dog Button - Admin Only */}
            {userRole === 'authority' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Rescued Dog
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary-600">
              {animals.length}
            </div>
            <div className="text-gray-600 text-sm">Total Rescues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {animals.filter(a => a.status === 'In Shelter').length}
            </div>
            <div className="text-gray-600 text-sm">In Shelter</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {animals.filter(a => a.status === 'Ready for Adoption').length}
            </div>
            <div className="text-gray-600 text-sm">Ready for Adoption</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {animals.filter(a => a.status === 'Adopted').length}
            </div>
            <div className="text-gray-600 text-sm">Adopted</div>
          </div>
        </div>

        {/* Dog Tracker Card - Admin and Shelter Only */}
        {(userRole === 'authority' || userRole === 'shelter') && (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  🐾 Live Dog Tracking System
                </h3>
                <p className="text-green-50 text-lg">
                  Track vaccinated dogs released back to streets in real-time on an interactive map
                </p>
                <ul className="mt-3 space-y-1 text-green-50 text-sm">
                  <li>✓ Real-time GPS location updates</li>
                  <li>✓ View current area and shelter information</li>
                  <li>✓ Monitor dog movements across Bangalore</li>
                </ul>
              </div>
              <Link
                to="/dog-tracker"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-green-50 transition flex items-center gap-2 shadow-md text-lg"
              >
                <MapPin className="h-6 w-6" />
                Open Tracker
              </Link>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, type, or color..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Rescued">Rescued</option>
                <option value="In Shelter">In Shelter</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Ready for Adoption">Ready for Adoption</option>
                <option value="Adopted">Adopted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Animals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <div
              key={animal._id}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
            >
              <Link to={`/animal/${animal._id}`}>
                <div className="relative h-48">
                  <img
                    src={animal.media?.photos?.[0] ? `http://localhost:5000${animal.media.photos[0]}` : 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(animal.status)}`}>
                    {animal.status}
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/animal/${animal._id}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {animal.name && animal.name !== 'Unnamed' ? animal.name : `Dog ${animal.paw_id || animal.animalId}`}
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">{animal.paw_id || animal.animalId}</span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {animal.breed || animal.type || 'Indian Street Dog'} 
                    {animal.color && ` • ${animal.color}`}
                    {animal.age && ` • ${typeof animal.age === 'number' ? `${animal.age} yrs` : animal.age}`}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {animal.location?.currentLocation?.shelterName || animal.location?.rescueLocation?.city || 'Unknown Location'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Rescued on {new Date(animal.rescueDetails?.rescueDate || animal.createdAt).toLocaleDateString()}
                  </div>
                </Link>
                
                {/* Adopt Me Button - Citizens/Volunteers Only, Ready for Adoption Dogs */}
                {userRole !== 'authority' && animal.status === 'Ready for Adoption' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDog(animal);
                      setShowAdoptModal(true);
                    }}
                    className="mt-3 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Heart className="h-4 w-4" />
                    Adopt Me
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No animals found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Add Rescued Dog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Rescued Dog</h2>
                <button
                  onClick={resetModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div className={`mb-6 p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {uploadResult.message}
                  </p>
                  
                  {uploadResult.success && uploadResult.data && uploadResult.data.animal && (
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-gray-700">
                        <strong>PAW ID:</strong> {uploadResult.data.animal.paw_id || uploadResult.data.animal.animalId || 'N/A'}
                      </p>
                      {uploadResult.data.animal.location && uploadResult.data.animal.location.rescueLocation && uploadResult.data.animal.location.rescueLocation.coordinates && (
                        <p className="text-gray-700">
                          <strong>Location:</strong> Lat {uploadResult.data.animal.location.rescueLocation.coordinates.lat.toFixed(4)}, 
                          Lng {uploadResult.data.animal.location.rescueLocation.coordinates.lng.toFixed(4)}
                        </p>
                      )}
                      
                      {/* AI Analysis Results */}
                      {uploadResult.data.aiAnalysis && (
                        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                          <p className="font-semibold text-gray-800 mb-2">🤖 AI Analysis:</p>
                          
                          <div className={`flex items-center gap-2 mb-2 ${uploadResult.data.aiAnalysis.injuryDetected ? 'text-red-600' : 'text-green-600'}`}>
                            <span className="font-medium">
                              {uploadResult.data.aiAnalysis.injuryDetected ? '⚠️ Injury Detected' : '✅ Healthy'}
                            </span>
                            {uploadResult.data.aiAnalysis.injuryConfidence !== undefined && (
                              <span className="text-sm text-gray-600">
                                ({(uploadResult.data.aiAnalysis.injuryConfidence * 100).toFixed(1)}% confidence)
                              </span>
                            )}
                          </div>
                          
                          {uploadResult.data.aiAnalysis.needsVeterinaryCare && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-red-800 font-semibold mb-2">🏥 Veterinary Care Required</p>
                              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">
                                Contact Veterinarian
                              </button>
                            </div>
                          )}
                          
                          <p className={`text-sm mt-2 ${uploadResult.data.aiAnalysis.imageIsReal ? 'text-green-600' : 'text-red-600'}`}>
                            {uploadResult.data.aiAnalysis.imageIsReal ? '✅ Real Image Verified' : '❌ AI-Generated Image Detected'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Finish Upload Button - shown after successful upload */}
              {uploadResult && uploadResult.success && (
                <div className="mt-6">
                  <button
                    onClick={finishUpload}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Heart className="h-5 w-5" />
                    Finish Upload
                  </button>
                </div>
              )}

              {!uploadResult && (
                <>
                  {/* Dog Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dog Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={dogName}
                      onChange={(e) => setDogName(e.target.value)}
                      placeholder="Enter dog's name (e.g., Max, Buddy)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate name based on PAW ID</p>
                  </div>

                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Dog Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="dog-image-upload"
                      />
                      <label htmlFor="dog-image-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-gray-600">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">📋 What happens next:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ GPS location will be extracted from image</li>
                      <li>✓ Unique PAW ID will be generated automatically</li>
                      <li>✓ AI will check if the dog is injured</li>
                      <li>✓ AI will verify if image is real (not AI-generated)</li>
                      <li>✓ If injured, veterinarian contact option will appear</li>
                      <li>✓ Dog will be added to selected shelter</li>
                    </ul>
                  </div>

                  {/* Shelter Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Shelter *
                    </label>
                    <select
                      value={selectedShelter}
                      onChange={(e) => setSelectedShelter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Choose a shelter --</option>
                      {shelters.map((shelter) => (
                        <option key={shelter._id} value={shelter._id}>
                          {shelter.name} ({shelter.capacity.current}/{shelter.capacity.maximum} capacity)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={handleUploadDog}
                    disabled={!selectedImage || uploading}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        Upload & Analyze
                      </>
                    )}
                  </button>
                </>
              )}

              {uploadResult && (
                <button
                  onClick={resetModal}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition mt-4"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adoption Request Modal */}
      {showAdoptModal && selectedDog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Adopt {selectedDog.name || 'This Dog'}</h2>
                <button
                  onClick={() => {
                    setShowAdoptModal(false);
                    setSelectedDog(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Dog Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex gap-4">
                  <img
                    src={selectedDog.media?.photos?.[0] ? `http://localhost:5000${selectedDog.media.photos[0]}` : 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'}
                    alt={selectedDog.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{selectedDog.name || `Dog ${selectedDog.paw_id}`}</h3>
                    <p className="text-gray-600">{selectedDog.breed || selectedDog.type || 'Indian Street Dog'}</p>
                    <p className="text-sm text-gray-500">PAW ID: {selectedDog.paw_id || selectedDog.animalId}</p>
                  </div>
                </div>
              </div>

              {/* Adoption Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for your interest in adopting! Our team will contact you soon to complete the adoption process.');
                setShowAdoptModal(false);
                setSelectedDog(null);
              }}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      required
                      rows="2"
                      placeholder="Your complete address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to adopt this dog? *
                    </label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Tell us about yourself and why you want to adopt..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you have experience with pets? *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes, I have/had pets before</option>
                      <option value="no">No, this will be my first pet</option>
                    </select>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>What happens next?</strong><br/>
                    • Our team will review your application<br/>
                    • You'll receive a call within 24-48 hours<br/>
                    • Home visit may be scheduled<br/>
                    • Adoption fee and documentation required
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition flex items-center justify-center gap-2"
                >
                  <Heart className="h-5 w-5" />
                  Submit Adoption Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Button (Only for citizens and shelters, NOT admins) */}
      {userRole !== 'authority' && (
        <>
          {!showChatbot && (
            <button
              onClick={() => setShowChatbot(true)}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 group"
              title="Chat with Furries"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                🐾
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-sm py-2 px-3 rounded-lg whitespace-nowrap">
                  Chat with Furries 🐾
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </button>
          )}
          
          {/* Chatbot Component */}
          <Furries 
            isOpen={showChatbot} 
            onClose={() => setShowChatbot(false)}
            userRole={userRole}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;