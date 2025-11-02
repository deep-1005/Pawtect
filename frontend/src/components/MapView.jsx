// frontend/src/components/MapView.js
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const areaColors = {
  Girinagar: "red",
  "JP Nagar": "blue",
  Basavanagudi: "green",
};

export default function MapView() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use backend URL from env or fallback to localhost:5000
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    fetch(`${API}/api/dogs`)
      .then((r) => r.json())
      .then((data) => {
        setDogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-full w-full p-4">
      <div className="h-full rounded-lg overflow-hidden shadow">
        <MapContainer
          center={[12.93, 77.56]}
          zoom={13}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {loading ? null : dogs.map((dog) => (
            <CircleMarker
              key={dog.id}
              center={[dog.lat, dog.lng]}
              radius={8}
              pathOptions={{ color: areaColors[dog.area] || "gray" }}
            >
              <Popup>
                <strong>{dog.name}</strong>
                <br />
                Area: {dog.area}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
