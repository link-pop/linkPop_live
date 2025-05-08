import React from "react";

const XingIcon = React.forwardRef(
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
          d="M18.188 2c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.29.35.56.66 1.104.66h4.403c.231 0 .414-.076.51-.226.104-.152.104-.337-.007-.5l-4.905-8.947c-.03-.05-.03-.076 0-.11l7.678-13.622c.11-.175.106-.347.006-.485-.106-.142-.298-.226-.52-.226h-4.559zM4.759 6.69c-.23 0-.422.084-.525.226-.107.15-.11.333-.002.503l2.612 4.533c.025.034.025.086 0 .118L4.18 17.365c-.104.174-.098.353.009.499.108.138.288.22.516.22h4.403c.537 0 .806-.31 1.007-.648 0 0 2.598-5.304 2.706-5.494-.015-.027-2.605-4.54-2.605-4.54-.198-.339-.47-.712-1.012-.712h-4.443z"
          stroke="none"
        />
      </svg>
    );
  }
);

XingIcon.displayName = "XingIcon";

export default XingIcon;
