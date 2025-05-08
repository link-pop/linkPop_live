import React from "react";

// Substack SVG icon as a React component
const SubstackIcon = ({
  size = 24,
  width,
  height,
  className = "",
  style,
  ...rest
}) => {
  // Lucide icons accept `size`, `width`, `height`, `className`, `style`
  // size overrides width/height if provided
  const iconSize = size || width || height || 24;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={width || iconSize}
      height={height || iconSize}
      fill="currentColor"
      className={className}
      style={style}
      {...rest}
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
};

export default SubstackIcon;
