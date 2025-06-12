/**
 * Utility to add isDev status to user objects
 * This ensures consistency across the application when checking dev status
 */

// Developer email for additional permissions (same as in getMongoUser)
const DEV_EMAILS = [
  process.env.DEV_EMAIL,
  process.env.DEV_EMAIL2,
  process.env.DEV_EMAIL3,
];

/**
 * Add isDev flag to user objects
 * @param {Object|Array} userOrUsers - Single user object or array of user objects
 * @returns {Object|Array} - User object(s) with isDev flag added
 */
export const addDevStatus = (userOrUsers) => {
  if (!userOrUsers) return userOrUsers;

  // Handle array of users
  if (Array.isArray(userOrUsers)) {
    return userOrUsers.map((user) => addDevStatusToSingleUser(user));
  }

  // Handle single user
  return addDevStatusToSingleUser(userOrUsers);
};

/**
 * Add isDev flag to a single user object
 * @param {Object} user - User object
 * @returns {Object} - User object with isDev flag
 */
const addDevStatusToSingleUser = (user) => {
  if (!user) return user;

  return {
    ...(user.toObject ? user.toObject() : user),
    isDev: DEV_EMAILS.includes(user.email),
  };
};

export default addDevStatus;
