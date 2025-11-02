import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <PawPrint className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">
                Paw<span className="text-primary-500">tect</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Transparent tracking and ethical treatment of rescued animals. Building trust through technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="hover:text-primary-500 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/shelters" className="hover:text-primary-500 transition">
                  Shelters
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-primary-500 transition">
                  Report Animal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-500 transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-primary-500 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <span className="text-sm">support@pawtect.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <span className="text-sm">+91 1800-PAWTECT</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span className="text-sm">PES University, Bangalore</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2024 Pawtect - Team ctrl+alt+rescue. All rights reserved. Made with ❤️ for animals.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;