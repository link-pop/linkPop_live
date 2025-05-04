/**
 * Extracts mentioned usernames from text
 * @param {string} text - The text to extract mentions from
 * @returns {string[]} - Array of usernames mentioned (without @ symbol)
 */
export default function extractMentions(text) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Push the username without the @ symbol
  }
  
  return [...new Set(mentions)]; // Remove duplicates
}
