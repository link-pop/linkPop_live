import React from "react";

// Bluesky SVG icon as a React component
const BlueskyIcon = ({
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
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.5 14.61c-.15 0-.291-.061-.4-.18L7.6 12.117a.523.523 0 010-.734.509.509 0 01.73 0l2.17 2.17V8a.504.504 0 01.5-.5c.276 0 .5.224.5.5v4.705l3.57-3.57a.5.5 0 01.71.007.507.507 0 010 .709l-3.57 3.571 1.43 1.431a.509.509 0 010 .725.509.509 0 01-.731 0L12 14.26l-.37.37a.509.509 0 01-.13.11z" />
    </svg>
  );
};

export default BlueskyIcon;
