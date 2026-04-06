import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (level: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const display = hover || value;

  return (
    <div
      className="star-rating"
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((level) => (
        <span
          key={level}
          className={`star ${level <= display ? 'active' : ''}`}
          onClick={() => onChange(level)}
          onMouseEnter={() => setHover(level)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
