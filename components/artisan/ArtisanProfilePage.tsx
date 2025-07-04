
import React from 'react';
import { Artisan } from '../../types';
import Icon from '../Icon';
import Rating from '../shared/Rating';
import Badge from '../shared/Badge';

interface ArtisanProfilePageProps {
  artisan: Artisan;
  onBack: () => void;
  onEdit?: () => void;
  backButtonText?: string;
}

const ArtisanProfilePage: React.FC<ArtisanProfilePageProps> = ({ artisan, onBack, onEdit, backButtonText }) => {
  const StatCard: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div className="bg-slate-100 p-4 rounded-lg text-center">
      <p className="text-2xl font-bold text-cyan-600">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );

  return (
    <div className="container mx-auto">
      <button onClick={onBack} className="mb-6 text-cyan-600 hover:text-cyan-800 font-semibold">
        {backButtonText || '&larr; Back to Bids'}
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
        {onEdit && (
          <button 
            onClick={onEdit} 
            className="absolute top-4 right-4 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition duration-300 shadow text-sm z-10"
          >
            Edit Profile
          </button>
        )}

        {/* Header */}
        <div className="p-6 bg-slate-50 border-b">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img src={artisan.avatarUrl} alt={artisan.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md" />
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-800">{artisan.name}</h2>
              <p className="text-lg text-slate-600">{artisan.specialization}</p>
               <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2 text-slate-500 text-sm">
                <Icon name="location" className="h-4 w-4" />
                <span>{artisan.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={artisan.rating} label="Overall Rating" />
            <StatCard value={artisan.jobsCompleted} label="Jobs Completed" />
            <StatCard value={`${artisan.totalEarnings} MAD`} label="Total Earning" />
            <StatCard value={`${artisan.acceptanceRate}%`} label="Bid Acceptance" />
          </div>

          {/* Badges */}
           <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">Badges & Achievements</h3>
              <div className="flex flex-wrap gap-3">
                {artisan.rating >= 4.8 && <Badge icon="trophy" label="Top Rated" color="amber" />}
                {artisan.jobsCompleted >= 100 && <Badge icon="briefcase" label="100+ Jobs Completed" color="blue" />}
                {artisan.isVerified && <Badge icon="check-verified" label="Verified Pro" color="cyan" />}
                {artisan.totalEarnings >= 100000 && <Badge icon="receipt" label="High Earner" color="green" />}
                {artisan.reviews.length === 0 && <p className="text-slate-500 text-sm italic">No badges earned yet.</p>}
              </div>
            </div>

          {/* Portfolio */}
          {artisan.portfolio && artisan.portfolio.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">Portfolio</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artisan.portfolio.map((imgUrl, index) => (
                  <img key={index} src={imgUrl} alt={`Portfolio work ${index + 1}`} className="rounded-lg object-cover w-full h-40 shadow-sm" />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Customer Reviews ({artisan.reviews.length})</h3>
            <div className="space-y-6">
              {artisan.reviews.length > 0 ? (
                artisan.reviews.map(review => (
                  <div key={review.id} className="flex space-x-4 bg-slate-50 p-4 rounded-lg">
                    <img src={review.avatarUrl} alt={review.customerName} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center space-x-2">
                         <h4 className="font-bold text-slate-800">{review.customerName}</h4>
                         <span className="text-xs text-slate-400">&bull; {new Date(review.timestamp).toLocaleDateString()}</span>
                      </div>
                      <Rating rating={review.rating} className="my-1" />
                      <p className="text-slate-600 text-sm">{review.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">This artisan has no reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfilePage;