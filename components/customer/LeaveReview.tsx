import React, { useState } from 'react';
import { JobRequest, Artisan } from '../../types';
import Icon from '../Icon';

interface LeaveReviewProps {
  job: JobRequest;
  artisan: Artisan;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onClose: () => void;
}

const LeaveReview: React.FC<LeaveReviewProps> = ({ job, artisan, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please provide a comment of at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      onClose();
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-3xl transition-colors duration-200 ${
            i <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  const getRatingLabel = () => {
    const currentRating = hoveredRating || rating;
    switch (currentRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Rate Artisan's Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </div>

        {/* Artisan Info */}
        <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <img
            src={artisan.avatarUrl}
            alt={artisan.name}
            className="h-12 w-12 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="font-semibold text-slate-800">{artisan.name}</h3>
            <p className="text-sm text-slate-600">{artisan.specialization}</p>
          </div>
        </div>

        {/* Job Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Job Completed</h4>
          <p className="text-sm text-slate-600">{job.category}</p>
          <p className="text-sm text-slate-500 mt-1">{job.description}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              How would you rate this job?
            </label>
            <div className="flex items-center space-x-1 mb-2">
              {renderStars()}
            </div>
            <p className="text-sm text-slate-600">{getRatingLabel()}</p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Share your experience
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the quality of work, punctuality, professionalism, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters (minimum 10 characters)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-slate-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Icon name="star" className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveReview;
