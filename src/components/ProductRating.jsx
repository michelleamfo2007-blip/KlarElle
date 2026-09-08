import React from 'react';
import { Star } from 'lucide-react';

function ProductRating({ count = 0, average = null, className = 'product-rating' }) {
  const hasReviews = count > 0 && average;
  if (!hasReviews) return null;
  const filled = Math.round(Number(average));

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
        {`(${average}) ${count} ${count === 1 ? 'review' : 'reviews'}`}
      </span>
    </div>
  );
}

export default ProductRating;
