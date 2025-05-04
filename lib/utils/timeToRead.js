// Calculates the estimated reading time for a given text
export function timeToRead(text, wordsPerMinute = 200) {
  // Return 0 if no text is provided
  if (!text) return 0;

  // Remove HTML tags and trim whitespace
  const cleanText = text.replace(/<[^>]*>/g, "").trim();

  // Count words (split by whitespace)
  const wordCount = cleanText.split(/\s+/).length;

  // Calculate reading time
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return `${minutes === 1 ? "1 min" : `${minutes} mins`} read`;
}
