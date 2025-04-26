import React, { useState } from 'react';
import { PG, FilterOptions } from './types/pg';
import { pgData } from './data/pgData';
import PGCard from './components/PGCard';
import PGFilter from './components/PGFilter';
import Header from './components/Header';

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredPGs = pgData.filter(pg => {
    if (filters.minPrice && pg.price < filters.minPrice) return false;
    if (filters.maxPrice && pg.price > filters.maxPrice) return false;
    if (filters.location && !pg.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.nearbyCoaching && !pg.nearbyCoaching.toLowerCase().includes(filters.nearbyCoaching.toLowerCase())) return false;
    if (filters.waterFacility && pg.waterFacility !== filters.waterFacility) return false;
    if (filters.hasWifi !== undefined && pg.wifi !== filters.hasWifi) return false;
    if (filters.isIndependent !== undefined && pg.independent !== filters.isIndependent) return false;
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      // For now, only PGs are supported, so match 'PG' type
      if (!filters.propertyTypes.includes('PG')) return false;
    }
    if (filters.amenities && filters.amenities.length > 0) {
      // Only support 'wifi' and 'independent' for now
      if (filters.amenities.includes('wifi') && !pg.wifi) return false;
      if (filters.amenities.includes('independent') && !pg.independent) return false;
      // Add more amenity checks as you add more data fields
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PGFilter filters={filters} onFilterChange={setFilters} />
          </div>
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Best PGs in Bhilai
              </h2>
              <p className="text-gray-500 text-sm">
                Showing {filteredPGs.length} of {pgData.length} properties in Bhilai
              </p>
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