import { useId, useState } from "react";

const StarIcon = ({
  fillPercentage,
  index,
  ratingId,
  size = 6,
  onClick,
  onHover,
  fillColor = "var(--color-brand)",
}) => (
  <svg
    className={`w-${size} h-${size} cursor-pointer`}
    viewBox="0 0 24 24"
    style={{
      filter: "drop-shadow(0px 0px 1px rgba(0,0,0,0.2))",
      color: fillColor,
    }}
    onClick={() => onClick?.(index + 1)}
    onMouseEnter={() => onHover?.(index + 1)}
    onMouseLeave={() => onHover?.(0)}
  >
    <defs>
      <linearGradient id={`starGradient-${ratingId}-${index}`}>
        <stop offset={`${fillPercentage}%`} stopColor={fillColor} />
        <stop offset={`${fillPercentage}%`} stopColor="#e5e7eb" />
      </linearGradient>
    </defs>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={`url(#starGradient-${ratingId}-${index})`}
      stroke={fillColor}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function StarRating({
  rating,
  totalStars = 5,
  className = "",
  size = 6,
  onRatingChange,
  readonly = false,
  fillColor = "var(--color-brand)",
}) {
  const ratingId = useId();
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (newRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleStarHover = (rating) => {
    if (!readonly) {
      setHoveredRating(rating);
    }
  };

  return (
    <div className={`afade f g1 ${className}`}>
      {[...Array(totalStars)].map((_, i) => {
        const fillPercentage = Math.max(
          Math.min(((hoveredRating || rating) - i) * 100, 100),
          0
        );
        return (
          <StarIcon
            key={i}
            fillPercentage={fillPercentage}
            index={i}
            ratingId={ratingId}
            size={size}
            onClick={handleStarClick}
            onHover={handleStarHover}
            fillColor={fillColor}
          />
        );
      })}
    </div>
  );
}
