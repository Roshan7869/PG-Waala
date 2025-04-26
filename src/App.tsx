import React, { useState } from 'react';
import { PG, FilterOptions } from './types/pg';
import { pgData } from './data/pgData';
import PGCard from './components/PGCard';
import PGFilter from './components/PGFilter';

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredPGs = pgData.filter(pg => {
    if (filters.maxPrice && pg.price > filters.maxPrice) return false;
    if (filters.location && !pg.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.nearbyCoaching && !pg.nearbyCoaching.toLowerCase().includes(filters.nearbyCoaching.toLowerCase())) return false;
    if (filters.waterFacility && pg.waterFacility !== filters.waterFacility) return false;
    if (filters.hasWifi !== undefined && pg.wifi !== filters.hasWifi) return false;
    if (filters.isIndependent !== undefined && pg.independent !== filters.isIndependent) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">PG Waala</h1>
          <p className="mt-1 text-sm text-gray-500">Find your perfect PG accommodation</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PGFilter filters={filters} onFilterChange={setFilters} />
          </div>
          
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredPGs.length} PGs found
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPGs.map(pg => (
                <PGCard key={pg.id} pg={pg} />
              ))}
            </div>
            
            {filteredPGs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No PGs found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App; 