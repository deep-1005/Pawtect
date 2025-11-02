import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, Heart, TrendingUp, Phone, Mail, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchShelters();
  }, [cityFilter, typeFilter]);

  const fetchShelters = async () => {
    try {
      let url = 'http://localhost:5000/api/shelters?';
      if (cityFilter) url += `city=${cityFilter}&`;
      if (typeFilter !== 'All') url += `type=${typeFilter}&`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setShelters(data.data);
      }
    } catch (error) {
      console.error('Error fetching shelters:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shelters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Animal Shelters</h1>
        <div className="grid gap-6">
          {shelters.map((shelter) => (
            <div key={shelter._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold">{shelter.name}</h3>
              <p>{shelter.address?.city}, {shelter.address?.state}</p>
              <Link to={`/shelters/${shelter._id}`} className="text-primary-600">View Details</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shelters;