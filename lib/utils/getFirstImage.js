export const getFirstImage = ({ text, title = "", className = "", onError }) => {
  const imgMatch = text?.match(/<img[^>]+src=["']([^"'>]+)["']/);
  
  return imgMatch?.[1] ? (
    <img
      src={imgMatch[1]}
      alt={title}
      className={className}
      onError={onError}
    />
  ) : null;
};
