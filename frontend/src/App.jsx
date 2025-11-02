import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Import Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AnimalProfile from './pages/AnimalProfile';
import ReportAnimal from './pages/ReportAnimal';
import ReportCruelty from './pages/ReportCruelty';
import CrueltyReports from './pages/CrueltyReports';
import Shelters from './pages/Shelters';
import ShelterDetail from './pages/ShelterDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Donate from './pages/Donate';
import VaccinatedDogsMap from './pages/VaccinatedDogsMap';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/animal/:id" element={<AnimalProfile />} />
            <Route path="/report" element={<ReportAnimal />} />
            <Route path="/report-cruelty" element={<ReportCruelty />} />
            <Route path="/cruelty-reports" element={<CrueltyReports />} />
            <Route path="/shelters" element={<Shelters />} />
            <Route path="/shelters/:id" element={<ShelterDetail />} />
            <Route path="/dog-tracker" element={<VaccinatedDogsMap />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;