/**
 * Generates a unique referral code
 *
 * @param {string} userId - The user's ID to base the code on
 * @param {string} [name] - Optional username to include in the code
 * @param {number} [length=8] - Length of the random part of the code
 * @returns {string} A unique referral code
 */
export function generateReferralCode(userId, name, length = 8) {
  // Create a prefix from the user's name (if provided) or first part of userId
  let prefix = "";

  if (name && name.trim()) {
    // Use the first 3-5 characters of the name (lowercase, alphanumeric only)
    prefix = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric chars
      .slice(0, Math.min(5, name.length));
  } else if (userId) {
    // Use first 4 chars of userId
    prefix = userId.toString().slice(0, 4).toLowerCase();
  }

  if (prefix.length < 2) {
    prefix = "rf";
  }

  // Generate random characters
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomPart = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }

  // Combine parts and ensure minimum length
  let code = `${prefix}-${randomPart}`;

  // Ensure code is at least 8 characters long
  while (code.length < 8) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}
