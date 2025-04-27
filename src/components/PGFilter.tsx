/* global HTMLSelectElement */
/// <reference lib="dom" />
import React, { useState } from 'react';
import { FilterOptions } from '../types/pg';

const LOCATIONS = [
  'All Areas',
  'Bhilai Nagar',
  'Borsi',
  'Kohka',
  'Supela',
  'Maroda',
  'Bhim Nagar',
  'Charoda',
  'Titagarh',
  'Indra Place',
  'Junwani',
  'Chandrakar Nagar',
  'Rajendra Nagar',
  'Smriti Nagar',
  'Hathkhoj',
  'Ujala Bhawan',
  'Vasant Vihar',
  'Akash Ganga',
  'Kasturba Nagar',
  'Rahul Nagar',
  'Moharpara',
  'Guru Nagar',
];

const PROPERTY_TYPES = ['PG', 'Hostel', 'Apartment'];
const AMENITIES = [
  { key: 'wifi', label: 'WiFi', icon: '📶' },
  { key: 'ac', label: 'AC', icon: '❄️' },
  { key: 'food', label: 'Food', icon: '🍽️' },
  { key: 'furnished', label: 'Furnished', icon: '🛏️' },
  { key: 'parking', label: 'Parking', icon: '🚗' },
  { key: 'tv', label: 'TV', icon: '📺' },
  { key: 'independent', label: 'Independent', icon: '🏠' },
  { key: 'water', label: '24/7 Water', icon: '💧' },
];

interface PGFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const PGFilter: React.FC<PGFilterProps> = ({ filters, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([4000, 7000]);

  // Handler for location dropdown
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, location: e.target.value === 'All Areas' ? undefined : e.target.value });
  };

  // Handler for amenities chips
  const handleAmenityToggle = (key: string) => {
    const amenities = filters.amenities || [];
    if (amenities.includes(key)) {
      onFilterChange({ ...filters, amenities: amenities.filter(a => a !== key) });
    } else {
      onFilterChange({ ...filters, amenities: [...amenities, key] });
    }
  };

  // Handler for property type checkboxes
  const handlePropertyTypeToggle = (type: string) => {
    const types = filters.propertyTypes || [];
    if (types.includes(type)) {
      onFilterChange({ ...filters, propertyTypes: types.filter(t => t !== type) });
    } else {
      onFilterChange({ ...filters, propertyTypes: [...types, type] });
    }
  };

  // Handler for price slider
  const handlePriceChange = (idx: 0 | 1, value: number) => {
    const newRange: [number, number] = [...priceRange];
    newRange[idx] = value;
    setPriceRange(newRange);
    onFilterChange({ ...filters, minPrice: newRange[0], maxPrice: newRange[1] });
  };

  // Handler for clear all
  const handleClearAll = () => {
    setPriceRange([4000, 7000]);
    onFilterChange({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button className="text-blue-600 text-sm underline" onClick={handleClearAll}>Clear All</button>
      </div>
      {/* Location Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <select
          name="location"
          value={filters.location || 'All Areas'}
          onChange={handleLocationChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Select location"
        >
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      {/* Price Range Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={3000}
            max={15000}
            value={priceRange[0]}
            onChange={e => handlePriceChange(0, Number(e.target.value))}
            className="w-1/2 accent-blue-500"
            placeholder="Min price"
          />
          <span className="text-xs">₹{priceRange[0] / 1000}k</span>
          <span className="mx-1">-</span>
          <input
            type="range"
            min={3000}
            max={15000}
            value={priceRange[1]}
            onChange={e => handlePriceChange(1, Number(e.target.value))}
            className="w-1/2 accent-blue-500"
            placeholder="Max price"
          />
          <span className="text-xs">₹{priceRange[1] / 1000}k</span>
        </div>
      </div>
      {/* Property Type Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
        <div className="flex flex-wrap gap-3">
          {PROPERTY_TYPES.map(type => (
            <label key={type} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.propertyTypes?.includes(type) || false}
                onChange={() => handlePropertyTypeToggle(type)}
                className="accent-blue-600"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Amenities Chips */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => (
            <button
              key={a.key}
              type="button"
              className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm transition-colors duration-150 ${
                filters.amenities?.includes(a.key)
                  ? 'bg-blue-100 border-blue-500 text-blue-700 font-semibold'
                  : 'bg-gray-100 border-gray-300 text-gray-700'
              }`}
              onClick={() => handleAmenityToggle(a.key)}
            >
              <span>{a.icon}</span> {a.label}
              {filters.amenities?.includes(a.key) && (
                <span className="ml-1 text-green-600 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* More Filters (Expandable, placeholder for now) */}
      <div>
        <button className="text-blue-600 text-sm underline">More Filters</button>
      </div>
    </div>
  );
};

export default PGFilter; 