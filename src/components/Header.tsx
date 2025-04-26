import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.jpg';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}> 
          <img src={logo} alt="PG WALA Logo" className="h-12 w-12 object-contain" />
          <span className="text-2xl font-bold text-gray-900 tracking-tight">PG <span className="text-yellow-500">WALA</span></span>
        </div>
        <div className="flex-1 mx-8">
          <input
            type="text"
            placeholder="Search by location..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary">List Your Property</button>
          <button className="btn btn-secondary">Login</button>
          <button className="btn btn-secondary">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header; 