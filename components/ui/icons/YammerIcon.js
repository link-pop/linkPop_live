import React from "react";

const YammerIcon = React.forwardRef(
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
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          stroke="none"
        />
        <path
          fill={color}
          d="M16.93 9.09c-.63 0-1.45.34-2.29 1.36L12 14.09 9.36 10.3c-.84-1.01-1.66-1.2-2.29-1.2-1.44 0-2.61 1.17-2.61 2.61 0 .62.33 1.45 1.36 2.28L9.51 17l2.49 3c.63.84 1.46 1 2.09 1 .63 0 1.45-.34 2.09-1l2.49-3 3.69-3.01c1.03-.83 1.36-1.66 1.36-2.28 0-1.44-1.17-2.61-2.61-2.61h-.18z"
          stroke="none"
        />
      </svg>
    );
  }
);

YammerIcon.displayName = "YammerIcon";

export default YammerIcon;
