import React from "react";

const TrelloIcon = React.forwardRef(
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
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          ry="2"
          fill={color}
          stroke="none"
        />
        <rect
          x="7"
          y="7"
          width="3"
          height="9"
          rx="1"
          ry="1"
          fill="white"
          stroke="none"
        />
        <rect
          x="14"
          y="7"
          width="3"
          height="5"
          rx="1"
          ry="1"
          fill="white"
          stroke="none"
        />
      </svg>
    );
  }
);

TrelloIcon.displayName = "TrelloIcon";

export default TrelloIcon;
