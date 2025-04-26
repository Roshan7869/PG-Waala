import React from 'react';
import { PG } from '../types/pg';

interface PGCardProps {
  pg: PG;
}

const PGCard: React.FC<PGCardProps> = ({ pg }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{pg.owner}</h3>
        <span className="text-lg font-bold text-blue-600">₹{pg.price}/month</span>
      </div>
      
      <div className="space-y-2 text-gray-600">
        <p className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {pg.location}
        </p>
        
        <p className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {pg.nearbyCoaching}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`px-3 py-1 rounded-full text-sm ${
            pg.wifi ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {pg.wifi ? 'Wi-Fi Available' : 'No Wi-Fi'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            pg.independent ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {pg.independent ? 'Independent' : 'Shared'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            pg.waterFacility === '24/7 Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {pg.waterFacility}
          </span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">Rules: {pg.rules}</p>
        </div>
      </div>
    </div>
  );
};

export default PGCard; 