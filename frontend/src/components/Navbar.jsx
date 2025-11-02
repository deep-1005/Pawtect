import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, PawPrint } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in (you can use context/redux later)
  const isLoggedIn = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <PawPrint className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                Paw<span className="text-primary-600">tect</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Dashboard
            </Link>
            <Link 
              to="/shelters" 
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Shelters
            </Link>
            <Link 
              to="/report" 
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Report Animal
            </Link>
            {/* Report Cruelty - Citizens/Volunteers Only */}
            {localStorage.getItem('userRole') !== 'authority' && (
              <Link 
                to="/report-cruelty" 
                className="text-red-600 hover:text-red-700 font-medium transition"
              >
                Report Cruelty
              </Link>
            )}
            {/* Cruelty Reports Management - Admin Only */}
            {localStorage.getItem('userRole') === 'authority' && (
              <Link 
                to="/cruelty-reports" 
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Cruelty Reports
              </Link>
            )}
            {/* Dog Tracker - Admin and Shelter Only */}
            {(localStorage.getItem('userRole') === 'authority' || localStorage.getItem('userRole') === 'shelter') && (
              <Link 
                to="/dog-tracker" 
                className="text-green-600 hover:text-green-700 font-medium transition"
              >
                🐾 Track Dogs
              </Link>
            )}

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hello, {userName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/shelters"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Shelters
            </Link>
            <Link
              to="/report"
              className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Report Animal
            </Link>
            {/* Report Cruelty - Citizens/Volunteers Only */}
            {localStorage.getItem('userRole') !== 'authority' && (
              <Link
                to="/report-cruelty"
                className="block px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                Report Cruelty
              </Link>
            )}
            {/* Cruelty Reports Management - Admin Only */}
            {localStorage.getItem('userRole') === 'authority' && (
              <Link
                to="/cruelty-reports"
                className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Cruelty Reports
              </Link>
            )}
            {/* Dog Tracker - Admin and Shelter Only */}
            {(localStorage.getItem('userRole') === 'authority' || localStorage.getItem('userRole') === 'shelter') && (
              <Link
                to="/dog-tracker"
                className="block px-3 py-2 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                🐾 Track Dogs
              </Link>
            )}
            
            {isLoggedIn ? (
              <>
                <div className="px-3 py-2 text-gray-700">Hello, {userName}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;