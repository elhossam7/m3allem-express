
import React from 'react';
import Icon from '../Icon';

interface RatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({ rating, maxRating = 5, className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => (
        <Icon
          key={i}
          name="star"
          className={`h-4 w-4 ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
};

export default Rating;
