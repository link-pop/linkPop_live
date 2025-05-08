import React from "react";

const DiggIcon = React.forwardRef(
  ({ color = "currentColor", size = 24, ...rest }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        <path
          fill={color}
          d="M8.5 5v5h-3V5H3v9h2.5v-2h3v2H11V5H8.5z"
          stroke="none"
        />
        <path
          fill={color}
          d="M13 5v7h-2.5v2H14c.55 0 1-.45 1-1V5h-2z"
          stroke="none"
        />
        <path
          fill={color}
          d="M18.5 5v7h-3V5h-2v9c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V5h-2z"
          stroke="none"
        />
      </svg>
    );
  }
);

DiggIcon.displayName = "DiggIcon";

export default DiggIcon;
