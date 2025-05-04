// removeHtmlFromText
const removeHtmlFromText = (html) => {
  // Remove HTML tags and trim whitespace
  const text = html?.replace(/<[^>]*>/g, "").trim();
  return text;
};

export default removeHtmlFromText;
