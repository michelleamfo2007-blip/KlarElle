import React from 'react';
import { Star } from 'lucide-react';

function ProductRating({ count = 0, average = null, className = 'product-rating' }) {
  const hasReviews = count > 0 && average;
  const filled = hasReviews ? Math.round(Number(average)) : 0;

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="star-icon luxury-star"
          size={14}
          fill={star <= filled ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      ))}
      <span>
        {hasReviews
          ? `(${average}) ${count} ${count === 1 ? 'review' : 'reviews'}`
          : 'No reviews yet'}
      </span>
    </div>
  );
}

export default ProductRating;
