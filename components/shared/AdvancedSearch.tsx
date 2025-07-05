import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceCategory } from '../../types';
import { searchFiltersSchema, SearchFiltersData } from '../../schemas/validationSchemas';
import Icon from '../Icon';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFiltersData) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onReset, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SearchFiltersData>({
    resolver: zodResolver(searchFiltersSchema),
    defaultValues: {
      location: '',
      priceRange: [50, 1000],
      minRating: 0,
      availability: undefined,
      specializations: [],
      isVerified: false,
      maxDistance: 50,
    },
  });

  const priceRange = watch('priceRange');
  const selectedSpecializations = watch('specializations');

  const onSubmit = (data: SearchFiltersData) => {
    onSearch(data);
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  const toggleSpecialization = (category: ServiceCategory) => {
    const current = selectedSpecializations || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    
    // Update the form value
    reset({ ...watch(), specializations: updated });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Search Filters</h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-cyan-600 hover:text-cyan-700"
        >
          <span className="mr-2">{isExpanded ? 'Less Filters' : 'More Filters'}</span>
          <Icon 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            className="w-4 h-4"
          />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter city or area..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              )}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Price Range: {priceRange?.[0]} - {priceRange?.[1]} MAD
            </label>
            <Controller
              name="priceRange"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={field.value?.[0] || 50}
                    onChange={(e) => field.onChange([Number(e.target.value), field.value?.[1] || 1000])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={field.value?.[1] || 1000}
                    onChange={(e) => field.onChange([field.value?.[0] || 50, Number(e.target.value)])}
                    className="w-full"
                  />
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Rating</label>
            <Controller
              name="minRating"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  <option value={0}>Any Rating</option>
                  <option value={1}>1+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars Only</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                <Controller
                  name="availability"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="">Any Availability</option>
                      <option value="immediate">Available Now</option>
                      <option value="within-week">Within a Week</option>
                      <option value="flexible">Flexible Schedule</option>
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Distance: {watch('maxDistance')} km
                </label>
                <Controller
                  name="maxDistance"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      className="w-full"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Service Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.values(ServiceCategory).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleSpecialization(category)}
                    className={`px-3 py-2 text-xs rounded-full border transition-colors ${
                      selectedSpecializations?.includes(category)
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-slate-700 border-gray-300 hover:border-cyan-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Controller
                name="isVerified"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Show only verified artisans
                    </span>
                  </label>
                )}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Icon name="spinner" className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </div>
            ) : (
              'Search Artisans'
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-slate-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedSearch;
