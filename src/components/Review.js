// src/components/Review.js
import React from 'react';

function Review({ review }) {
  if (!review) return null;

  return (
    <div className="review">
      <h2>Review</h2>
      <p>Similarity Score: {review.similarityScore}</p>
      <p>Rating: {review.rating}/5</p>
      <h3>Suggestions:</h3>
      <p>{review.suggestions}</p>
    </div>
  );
}

export default Review;