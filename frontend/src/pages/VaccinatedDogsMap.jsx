import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Filter, Search } from 'lucide-react';

const VaccinatedDogsMap = () => {
  const mapRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [dogCount, setDogCount] = useState(0);
  const dogsRef = useRef([]);
  const mapInstanceRef = useRef(null);

  // Bangalore area zones
  const areas = [
    { name: 'Girinagar', lat: 12.94, lng: 77.55 },
    { name: 'Basavanagudi', lat: 12.94, lng: 77.57 },
    { name: 'Jayanagar', lat: 12.93, lng: 77.59 },
    { name: 'Banashankari', lat: 12.91, lng: 77.56 },
    { name: 'BTM Layout', lat: 12.91, lng: 77.61 },
    { name: 'Koramangala', lat: 12.93, lng: 77.63 },
    { name: 'Whitefield', lat: 12.97, lng: 77.75 },
    { name: 'Indiranagar', lat: 12.97, lng: 77.64 },
    { name: 'Hebbal', lat: 13.03, lng: 77.59 },
    { name: 'Malleshwaram', lat: 12.99, lng: 77.57 },
  ];

  const latMin = 12.85, latMax = 13.05, lngMin = 77.45, lngMax = 77.70;

  const getNearestArea = (lat, lng) => {
    let nearest = areas[0];
    let minDist = Infinity;
    for (const area of areas) {
      const dist = Math.sqrt(
        Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = area;
      }
    }
    return nearest.name;
  };

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS if not already loaded
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      initializeMap();
    };

    loadLeaflet();

    return () => {
      // Cleanup interval when component unmounts
      if (window.mapUpdateInterval) {
        clearInterval(window.mapUpdateInterval);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = window.L.map(mapRef.current).setView([12.9716, 77.5946], 12);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Paw icon
    const pawIcon = window.L.divIcon({
      className: 'paw-icon',
      html: '🐾',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Fetch vaccinated dogs from database and generate markers
    fetchVaccinatedDogs().then(dbDogs => {
      const dogs = [];
      
      // If we have dogs from DB, use them; otherwise generate sample data
      const dogsToUse = dbDogs.length > 0 ? dbDogs : generateSampleDogs(50);
      
      dogsToUse.forEach((dog, i) => {
        const lat = dog.location?.coordinates?.latitude || (latMin + Math.random() * (latMax - latMin));
        const lng = dog.location?.coordinates?.longitude || (lngMin + Math.random() * (lngMax - lngMin));
        const pawId = dog.paw_id || `PAW${i + 1}`;
        const shelterId = dog.shelter?.shelterId || `SHELTER-${String(i + 1).padStart(3, '0')}`;
        const area = getNearestArea(lat, lng);

        const marker = window.L.marker([lat, lng], { icon: pawIcon }).addTo(map);
        marker.bindPopup(
          `<div style="font-family: sans-serif;">
            <b>🐾 Dog ID:</b> ${pawId}<br>
            <b>Name:</b> ${dog.name || 'Unknown'}<br>
            <b>Shelter ID:</b> ${shelterId}<br>
            <b>Area:</b> ${area}<br>
            <b>Status:</b> ${dog.status || 'Vaccinated & Released'}<br>
            <b>Coordinates:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>`
        );

        dogs.push({ marker, lat, lng, id: i + 1, shelterId, pawId, name: dog.name, area });
      });

      dogsRef.current = dogs;
      setDogCount(dogs.length);

      // Update dog positions every 2.5 seconds
      window.mapUpdateInterval = setInterval(() => {
        dogs.forEach((dog) => {
          let newLat = dog.lat + (Math.random() - 0.5) * 0.01;
          let newLng = dog.lng + (Math.random() - 0.5) * 0.01;

          newLat = Math.max(latMin, Math.min(latMax, newLat));
          newLng = Math.max(lngMin, Math.min(lngMax, newLng));

          const newArea = getNearestArea(newLat, newLng);

          dog.lat = newLat;
          dog.lng = newLng;
          dog.area = newArea;

          dog.marker.setLatLng([newLat, newLng]);

          const popupContent = `<div style="font-family: sans-serif;">
            <b>🐾 Dog ID:</b> ${dog.pawId}<br>
            <b>Name:</b> ${dog.name || 'Unknown'}<br>
            <b>Shelter ID:</b> ${dog.shelterId}<br>
            <b>Current Area:</b> ${newArea}<br>
            <b>Coordinates:</b> ${newLat.toFixed(4)}, ${newLng.toFixed(4)}
          </div>`;
          dog.marker._popup.setContent(popupContent);
        });
      }, 2500);
    });
  };

  const fetchVaccinatedDogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rescued-dogs?status=Adopted');
      const data = await response.json();
      if (data.success) {
        // Filter for vaccinated/released dogs
        return data.data.filter(dog => 
          dog.status === 'Adopted' || 
          dog.health_status === 'Healthy' ||
          dog.vaccination_status === 'Completed'
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching vaccinated dogs:', error);
      return [];
    }
  };

  const generateSampleDogs = (count) => {
    const samples = [];
    for (let i = 1; i <= count; i++) {
      samples.push({
        paw_id: `PAW-SIM-${i}`,
        name: `Dog ${i}`,
        status: 'Vaccinated & Released',
        shelter: { shelterId: `SHELTER-${String(i).padStart(3, '0')}` }
      });
    }
    return samples;
  };

  const filteredDogs = dogsRef.current.filter(dog => {
    const matchesSearch = !searchTerm || 
      dog.pawId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dog.shelterId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = selectedArea === 'all' || dog.area === selectedArea;
    
    return matchesSearch && matchesArea;
  });

  const focusOnDog = (dog) => {
    if (mapInstanceRef.current && dog.marker) {
      mapInstanceRef.current.setView([dog.lat, dog.lng], 15);
      dog.marker.openPopup();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                🐾 Live Dog Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Track vaccinated dogs released back to streets in real-time
              </p>
            </div>
            <div className="bg-primary-50 px-6 py-3 rounded-lg border-2 border-primary-200">
              <div className="text-sm text-gray-600">Total Tracked Dogs</div>
              <div className="text-3xl font-bold text-primary-600">{dogCount}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by PAW ID, Name, or Shelter ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Area Filter */}
            <div className="min-w-[200px]">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Areas</option>
                  {areas.map(area => (
                    <option key={area.name} value={area.name}>{area.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Dog List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 h-[600px] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              Dogs on Map ({filteredDogs.length})
            </h2>
            <div className="space-y-2">
              {filteredDogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => focusOnDog(dog)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
                >
                  <div className="font-semibold text-sm">{dog.pawId}</div>
                  <div className="text-xs text-gray-600">{dog.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{dog.area}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden">
            <div
              ref={mapRef}
              style={{ height: '600px', width: '100%' }}
              className="rounded-lg"
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        .paw-icon {
          font-size: 30px;
          color: black;
          text-shadow: 0 0 3px white;
        }
        .leaflet-popup-content {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default VaccinatedDogsMap;
