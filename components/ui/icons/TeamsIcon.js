import React from "react";

const TeamsIcon = React.forwardRef(
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
          d="M19.25 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 1.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
          stroke="none"
        />
        <path
          fill={color}
          d="M14 12c0-2.21 1.79-4 4-4h3.5c.28 0 .5.22.5.5v5c0 .28-.22.5-.5.5H18c-2.21 0-4-1.79-4-4z"
          stroke="none"
        />
        <path
          fill={color}
          d="M10.25 7a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 1.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
          stroke="none"
        />
        <path
          fill={color}
          d="M1 12c0-2.21 1.79-4 4-4h8.5c.28 0 .5.22.5.5v9.96c0 1.93-1.57 3.5-3.5 3.5h-2c-1.93 0-3.5-1.57-3.5-3.5V15H4c-2.21 0-4-1.79-4-4s1.79-4 4-4z"
          stroke="none"
        />
      </svg>
    );
  }
);

TeamsIcon.displayName = "TeamsIcon";

export default TeamsIcon;
