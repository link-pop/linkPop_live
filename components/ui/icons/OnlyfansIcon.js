import React from "react";

// OnlyFans SVG icon as a React component
const OnlyfansIcon = ({
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
      // aria-label="OnlyFans" // ! don't uncomment !
      width={width || iconSize}
      height={height || iconSize}
      fill="currentColor"
      className={className}
      style={style}
      {...rest}
    >
      <path d="M24 4.003h-4.015c-3.45 0-5.3.197-6.748 1.957a7.996 7.996 0 1 0 2.103 9.211c3.182-.231 5.39-2.134 6.085-5.173 0 0-2.399.585-4.43 0 4.018-.777 6.333-3.037 7.005-5.995zM5.61 11.999A2.391 2.391 0 0 1 9.28 9.97a2.966 2.966 0 0 1 2.998-2.528h.008c-.92 1.778-1.407 3.352-1.998 5.263A2.392 2.392 0 0 1 5.61 12Zm2.386-7.996a7.996 7.996 0 1 0 7.996 7.996 7.996 7.996 0 0 0-7.996-7.996Zm0 10.394A2.399 2.399 0 1 1 10.395 12a2.396 2.396 0 0 1-2.399 2.398Z" />
    </svg>
  );
};

export default OnlyfansIcon;
