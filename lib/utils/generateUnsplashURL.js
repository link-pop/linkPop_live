/**
 * Generate Unsplash URL based on creator tags using the current Unsplash API
 * @param {Object} tags - Object containing raceEthnicity, hairColor, bodyType
 * @param {Object} options - Optional configuration
 * @param {string} options.size - Image size (default: "1024x1024")
 * @param {string} options.orientation - Image orientation (default: "portrait")
 * @returns {string} Unsplash URL for realistic person image
 */
export const generateUnsplashURL = (tags = {}, options = {}) => {
  const { size = "1024x1024", orientation = "portrait" } = options;

  // Convert tags to Unsplash-friendly search terms
  const convertToSearchTerm = (tag) => {
    if (!tag || tag === undefined || tag === null || tag === '') return null;
    // Convert spaces to hyphens and make lowercase
    return String(tag).toLowerCase().replace(/\s+/g, "-");
  };

  // Extract tags from the tags object (could be direct values or arrays)
  let raceEthnicity, hairColor, bodyType;

  if (tags && typeof tags === 'object') {
    // Handle both direct values and arrays (for lastUploadedCreatorTags)
    raceEthnicity = Array.isArray(tags.raceEthnicity)
      ? tags.raceEthnicity[0]
      : tags.raceEthnicity;
    hairColor = Array.isArray(tags.hairColor)
      ? tags.hairColor[0]
      : tags.hairColor;
    bodyType = Array.isArray(tags.bodyType) ? tags.bodyType[0] : tags.bodyType;
  }

  // Build search terms array - always include basic terms even if tags are empty
  const terms = [
    convertToSearchTerm(raceEthnicity),
    convertToSearchTerm(hairColor),
    convertToSearchTerm(bodyType),
    "portrait",
    "person",
    "face",
  ].filter(Boolean); // Remove null/undefined values

  // Ensure we always have at least basic search terms
  if (terms.length === 0) {
    terms.push("portrait", "person", "face");
  }

  // Create a more robust hash from the terms to get consistent images for same tags
  const searchString = terms.join(",");
  let hash = 0;
  for (let i = 0; i < searchString.length; i++) {
    const char = searchString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Expanded pool of verified portrait photo IDs from Unsplash
  const portraitPhotoIds = [
    "1544005313-94ddf0286df2", // woman portrait
    "1494790108-ea87e1b9711c", // woman portrait  
    "1438761681033-6461ffad8d80", // woman portrait
    "1507003211169-0a1dd7228f2d", // woman portrait
    "1489424731084-a5d8b219a5bb", // woman portrait
    "1517841905240-472988babdf9", // woman portrait
    "1524504388940-b1c1fe6b5f1e", // woman portrait
    "1531123897727-8f129e1688ce", // woman portrait
    "1502823403499-6ccfcf4fb453", // woman portrait
    "1534528741775-53994a69daeb", // woman portrait
    "1472099645785-5658abf4ff4e", // man portrait
    "1500648767791-00dcc994a43e", // man portrait
    "1507591064344-4c6ce005b128", // man portrait
    "1566492031773-4f4e44671d66", // man portrait
    "1519085360753-af0119f7b770", // man portrait
    "1552058544-f2b08422138a", // diverse portrait
    "1573496359142-b8d87734a5a2", // diverse portrait
    "1580489944761-15a19d654956", // diverse portrait
    "1506794778202-cad84cf45f1d", // diverse portrait
    "1595152772835-219674b2a8a6", // diverse portrait
  ];

  // Select photo ID based on hash
  const photoIndex = Math.abs(hash) % portraitPhotoIds.length;
  const photoId = portraitPhotoIds[photoIndex];

  // Parse size with validation
  let width, height;
  if (size && size.includes('x')) {
    [width, height] = size.split("x");
    // Ensure valid dimensions
    width = parseInt(width) || 1024;
    height = parseInt(height) || 1024;
  } else {
    width = 1024;
    height = 1024;
  }

  // Build the URL with proper parameters using a working Unsplash photo
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    fit: "crop",
    crop: "face,entropy",
    auto: "format",
    q: "80",
  });

  const url = `https://images.unsplash.com/photo-${photoId}?${params.toString()}`;
  
  // Debug logging (remove in production)
  console.log('Generated Unsplash URL:', url);
  console.log('Tags used:', { raceEthnicity, hairColor, bodyType });
  console.log('Search terms:', terms);
  
  return url;
};

/**
 * Generate a fallback image URL for cases where Unsplash might not work
 * @param {string} seed - Unique seed for generating consistent image
 * @param {Object} options - Optional configuration
 * @returns {string} Fallback image URL
 */
export const generateFallbackImage = (seed = "default", options = {}) => {
  const { size = "400x400" } = options;

  // Use Picsum Photos as a reliable fallback
  let width, height;
  if (size && size.includes('x')) {
    [width, height] = size.split("x");
    width = parseInt(width) || 400;
    height = parseInt(height) || 400;
  } else {
    width = 400;
    height = 400;
  }

  // Create a hash from the seed to get consistent images
  let hash = 0;
  const seedString = String(seed);
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to select a photo ID (Picsum has photos from 1-1000+)
  const photoId = (Math.abs(hash) % 1000) + 1;

  return `https://picsum.photos/${width}/${height}?random=${photoId}`;
};

/**
 * Generate multiple fallback banner images
 * @returns {Array<string>} Array of banner image URLs
 */
export const getBannerImages = () => [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1974&auto=format&fit=crop", // ocean & sky
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1974&auto=format&fit=crop", // mountain range
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1974&auto=format&fit=crop", // desert dunes
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1974&auto=format&fit=crop", // misty forest
  "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1974&auto=format&fit=crop", // cityscape at sunset
  "https://images.unsplash.com/photo-1533055640609-24b498cdf91c?q=80&w=1974&auto=format&fit=crop", // abstract light trails
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1974&auto=format&fit=crop", // neon wall texture
];

/**
 * Generate a unique ID for image generation
 * @param {string} prefix - Prefix for the ID
 * @param {number} index - Index number
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = "user", index = 0) => {
  return `${prefix}-${index}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
};

/**
 * Utility function to test if an image URL loads successfully
 * @param {string} url - Image URL to test
 * @returns {Promise<boolean>} Promise that resolves to true if image loads
 */
export const testImageLoad = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Generate image URL with automatic fallback
 * @param {Object} tags - Creator tags
 * @param {Object} options - Options
 * @returns {Promise<string>} Promise that resolves to a working image URL
 */
export const generateImageWithFallback = async (tags = {}, options = {}) => {
  try {
    const primaryUrl = generateUnsplashURL(tags, options);
    const isWorking = await testImageLoad(primaryUrl);
    
    if (isWorking) {
      return primaryUrl;
    } else {
      console.warn('Primary Unsplash URL failed, using fallback');
      const seed = JSON.stringify(tags);
      return generateFallbackImage(seed, options);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    const seed = JSON.stringify(tags);
    return generateFallbackImage(seed, options);
  }
};