import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, MapPin, QrCode, TrendingUp, Users } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <QrCode className="h-8 w-8" />,
      title: 'QR/RFID Tracking',
      description: 'Every rescued animal gets a unique ID for complete traceability'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Blockchain Verified',
      description: 'Tamper-proof records ensure ethical treatment and accountability'
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Live Location',
      description: 'Real-time tracking from rescue to shelter to adoption'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Community Reports',
      description: 'Citizens can report strays and track rescue progress'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Verified Shelters',
      description: 'Partner with trusted NGOs and municipal shelters'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Public Dashboard',
      description: 'Complete transparency with live statistics and updates'
    }
  ];

  const stats = [
    { number: '500+', label: 'Animals Rescued' },
    { number: '50+', label: 'Partner Shelters' },
    { number: '1000+', label: 'Active Users' },
    { number: '300+', label: 'Successful Adoptions' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Every Rescue Deserves <br />
              <span className="text-primary-200">Transparency & Trust</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Track rescued animals from rescue to adoption. End-to-end transparency with blockchain verification.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/dashboard"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition shadow-lg"
              >
                View Dashboard
              </Link>
              <Link
                to="/report"
                className="bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-800 transition border-2 border-white"
              >
                Report a Stray
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Pawtect Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              End-to-end transparency in animal rescue and shelter operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100"
              >
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Movement
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you're a citizen, NGO, or shelter - help us build a transparent future for animal welfare
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;