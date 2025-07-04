
import React, { useState } from 'react';
import { JobRequest, Artisan } from '../../types';
import Icon from '../Icon';
import { useToast } from '../../contexts/ToastContext';

// A new interactive star rating component for the form
interface InteractiveRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}
const InteractiveRating: React.FC<InteractiveRatingProps> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
            <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
            aria-label={`Rate ${i + 1} star`}
            >
            <Icon
                name="star"
                className={`h-8 w-8 transition-colors cursor-pointer ${
                (hoverRating || rating) > i ? 'text-amber-400' : 'text-slate-300'
                }`}
            />
            </button>
        ))}
        </div>
    );
};


interface ReviewFormProps {
    job: JobRequest;
    artisan: Artisan;
    onCancel: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ job, artisan, onCancel, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            addToast('Please select a star rating.', 'error');
            return;
        }
        setIsLoading(true);
        await onSubmit(rating, comment);
        addToast('Thank you for your review!', 'success');
        // No need to set loading to false, as the component will unmount
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-800">Leave a Review</h2>
                        <p className="text-slate-500 mt-1">Share your experience with <span className="font-semibold">{artisan.name}</span> for the job: <span className="font-semibold">{job.category}</span>.</p>
                        
                        <div className="my-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
                            <InteractiveRating rating={rating} setRating={setRating} />
                        </div>

                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-slate-700">Your Comment (optional)</label>
                            <textarea
                                id="comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder={`How was your experience with ${artisan.name}?`}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
                        <button type="button" onClick={onCancel} disabled={isLoading} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition duration-300 disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading || rating === 0} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md disabled:bg-slate-300 flex items-center">
                            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
