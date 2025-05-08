import React from "react";

const BufferIcon = React.forwardRef(
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
          d="M2.32 6.16L12 11l9.68-4.84L12 2 2.32 6.16zm0 5.84L12 17l9.68-4.84L21.7 12l-9.68-4.84L2.32 12zm0 5.84L12 23l9.68-4.84L21.7 18l-9.68-4.84L2.32 18z"
          stroke="none"
        />
      </svg>
    );
  }
);

BufferIcon.displayName = "BufferIcon";

export default BufferIcon;
