/**
 * HighlightedText component for highlighting matching parts of text
 * @param {string} text - The full text to display
 * @param {string} highlight - The text to highlight within the full text
 * @param {string} className - Additional CSS classes for the container
 * @param {string} highlightClassName - CSS classes for highlighted parts
 */
export default function HighlightedText({
  text,
  highlight,
  className = "",
  highlightClassName = "brand",
}) {
  if (!text) return null;

  // If no highlight term or empty, return original text
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const highlightTerm = highlight.trim();

  // Create case-insensitive regex for global matching
  const regex = new RegExp(
    `(${highlightTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );

  // Split text by the highlight term while preserving the matches
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the highlight term (case-insensitive)
        const isHighlight = part.toLowerCase() === highlightTerm.toLowerCase();

        return isHighlight ? (
          <span key={index} className={highlightClassName}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}
