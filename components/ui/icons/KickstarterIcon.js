import React from "react";

// Kickstarter SVG icon as a React component
const KickstarterIcon = ({
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
      <path d="M14.81 3.519c-3.719 0-4.233 2.313-4.235 4.993v.431c0 .241.005.244.132.47.151.221.18.236.155.256-.061.23-1.225-1.368-1.225-1.368-1.738-2.088-3.862-2.153-4.96-1.177-1.224 1.256-1.645 4.329.392 6.859.002 0 2.099 2.723 2.33 3.037v.001c.235.397.181.345-.132.106-.329-.228-2.037-1.447-2.037-1.447-2.01-1.445-4.159-1.054-4.779.739-.779 2.716 1.754 5.877 6.741 5.899 3.15.104 7.596-1.087 8.953-5.28.88-2.573.765-7.181-1.335-13.519zm-.035 9.991c-.871 1.542-2.298 1.254-2.298 1.254s-1.688.01-1.691-.009l-.9-1.148c-.54-.686-.631-.835-.631-.835s-.034-.151-.279-.151c-.363 0-.345.151-.345.151v.823c0 .21-.041.38.035 1.169.009.47.001.746-.347.746-.265 0-.253-.104-.267-.746-.004-.714.024-4.899.024-5.381 0-.431.034-.482.263-.482h2.148c.89.017 2.083.284 2.575 1.874.474 1.584-.057 2.352-.379 2.735z" />
    </svg>
  );
};

export default KickstarterIcon;
