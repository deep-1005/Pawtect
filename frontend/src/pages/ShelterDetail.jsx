import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, Mail, Globe, ArrowLeft, 
  DogIcon as Dog, Heart, TrendingUp, Users, Calendar,
  Trash2, CheckCircle, XCircle, IndianRupee
} from 'lucide-react';

const ShelterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchShelterData();
  }, [id]);

  const fetchShelterData = async () => {
    try {
      // Fetch shelter details
      const shelterRes = await fetch(`http://localhost:5000/api/shelters/${id}`);
      const shelterData = await shelterRes.json();
      
      if (shelterData.success) {
        setShelter(shelterData.data);
        
        // Fetch animals in this shelter
        const animalsRes = await fetch(`http://localhost:5000/api/rescued-dogs`);
        const animalsData = await animalsRes.json();
        
        if (animalsData.success) {
          // Filter animals by shelter ID - check both location.currentLocation.shelterId and currentShelter
          const shelterAnimals = animalsData.data.filter(
            animal => 
              animal.location?.currentLocation?.shelterId === id || 
              animal.currentShelter === id ||
              animal.currentShelter?._id === id
          );
          console.log(`Found ${shelterAnimals.length} animals for shelter ${id}`);
          setAnimals(shelterAnimals);
        }
      }
    } catch (error) {
      console.error('Error fetching shelter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnimal = async (animalId) => {
    if (!window.confirm('Are you sure you want to remove this animal from the shelter?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/shelters/${id}/animals/${animalId}/delete`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userRole })
        }
      );

      if (response.ok) {
        alert('Animal removed successfully');
        fetchShelterData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to remove animal');
      }
    } catch (error) {
      console.error('Error deleting animal:', error);
      alert('Failed to remove animal');
    }
  };

  const deleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation record?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/shelters/${id}/donations/${donationId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userRole })
        }
      );

      if (response.ok) {
        alert('Donation record deleted successfully');
        fetchShelterData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete donation');
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Failed to delete donation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shelter details...</p>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Shelter not found</p>
          <Link to="/shelters" className="text-primary-600 hover:underline">
            Back to Shelters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/shelters"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Shelters
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-8 py-12">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Building2 className="h-16 w-16 text-white mr-6" />
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{shelter.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {shelter.type}
                    </span>
                    {shelter.isVerified ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Pending
                      </span>
                    )}
                    <span className="text-yellow-300">
                      {'⭐'.repeat(Math.round(shelter.rating || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="flex items-center text-gray-900">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{shelter.address?.city}, {shelter.address?.state}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Phone</div>
                <div className="flex items-center text-gray-900">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{shelter.contactInfo?.phone}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="flex items-center text-gray-900">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{shelter.contactInfo?.email}</span>
                </div>
              </div>
              {shelter.contactInfo?.website && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Website</div>
                  <div className="flex items-center text-gray-900">
                    <Globe className="h-4 w-4 mr-2" />
                    <a
                      href={shelter.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-bold text-primary-600">
                {shelter.capacity?.current || 0}/{shelter.capacity?.total || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Capacity</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${((shelter.capacity?.current || 0) / (shelter.capacity?.total || 1)) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {shelter.statistics?.totalAdoptions || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Adoptions</div>
            </div>
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {shelter.statistics?.totalRescues || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Rescues</div>
            </div>
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-bold text-orange-600 flex items-center justify-center">
                <IndianRupee className="h-8 w-8" />
                {(shelter.funding?.donationsReceived || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600 mt-1">Donations Received</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('animals')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'animals'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Animals ({animals.length})
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'donations'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Donations ({shelter.funding?.donations?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('adoptions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'adoptions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Adoptions ({shelter.adoptions?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Address</h3>
                  <p className="text-gray-600">
                    {shelter.address?.street}<br />
                    {shelter.address?.city}, {shelter.address?.state}<br />
                    {shelter.address?.pincode}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Facilities & Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`flex items-center ${shelter.facilities?.veterinaryService ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Veterinary Service
                    </div>
                    <div className={`flex items-center ${shelter.facilities?.adoptionService ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Adoption Service
                    </div>
                    <div className={`flex items-center ${shelter.facilities?.ambulanceService ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Ambulance Service
                    </div>
                    <div className={`flex items-center ${shelter.facilities?.vaccinationService ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Vaccination Service
                    </div>
                    <div className={`flex items-center ${shelter.facilities?.sterilizationService ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Sterilization Service
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Registration Details</h3>
                  <p className="text-gray-600">
                    Registration Number: <span className="font-mono">{shelter.registrationNumber}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Animals Tab */}
            {activeTab === 'animals' && (
              <div>
                {animals.length === 0 ? (
                  <div className="text-center py-12">
                    <Dog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No animals currently in this shelter</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {animals.map((animal) => (
                      <div key={animal._id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {animal.name && animal.name !== 'Unnamed' ? animal.name : `Dog ${animal.paw_id}`}
                            </h4>
                            <p className="text-sm text-gray-500">{animal.paw_id}</p>
                          </div>
                          {userRole === 'authority' && (
                            <button
                              onClick={() => deleteAnimal(animal._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        
                        {animal.media?.photos?.[0] && (
                          <img
                            src={`http://localhost:5000${animal.media.photos[0]}`}
                            alt={animal.name}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {animal.breed ? 'Breed:' : 'Type:'}
                            </span>
                            <span className="font-medium">
                              {animal.breed || animal.type || 'Indian Street Dog'}
                            </span>
                          </div>
                          {animal.color && !animal.breed && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Color:</span>
                              <span className="font-medium">{animal.color}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium">
                              {typeof animal.age === 'number' ? `${animal.age} yrs` : animal.age}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-medium">{animal.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-medium ${
                              animal.status === 'Ready for Adoption' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {animal.status}
                            </span>
                          </div>
                        </div>
                        
                        <Link
                          to={`/animal/${animal._id}`}
                          className="mt-4 block text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div>
                {!shelter.funding?.donations || shelter.funding.donations.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No donations recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shelter.funding.donations.map((donation, index) => (
                      <div key={donation._id || index} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <IndianRupee className="h-5 w-5 text-green-600 mr-1" />
                            <span className="text-2xl font-bold text-green-600">
                              {donation.amount?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">{donation.donorName}</p>
                          <p className="text-sm text-gray-600">{donation.donorEmail}</p>
                          {donation.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{donation.message}"</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(donation.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        {userRole === 'authority' && donation._id && (
                          <button
                            onClick={() => deleteDonation(donation._id)}
                            className="text-red-600 hover:text-red-700 ml-4"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Adoptions Tab */}
            {activeTab === 'adoptions' && (
              <div>
                {!shelter.adoptions || shelter.adoptions.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No adoptions recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shelter.adoptions.map((adoption, index) => (
                      <div key={adoption._id || index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">{adoption.adopterName}</h4>
                            <p className="text-sm text-gray-600">{adoption.adopterContact}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Adopted
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Adoption Fee:</span>
                            <div className="flex items-center font-medium mt-1">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {adoption.adoptionFee?.toLocaleString('en-IN') || 0}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Adoption Date:</span>
                            <div className="flex items-center font-medium mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(adoption.adoptionDate).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterDetail;
