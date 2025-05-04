export const skipInputRenderAddPostForm = {
  // Add collection-specific fields to skip here
  // Example: users: ["password", "email"],
  default: [], // default fields to skip for all collections
  contacts: ["name", "email", "message"],
};

// Helper function to get fields to skip for a specific collection
export const getSkipFieldsForCollection = (collectionName) => {
  return [
    ...(skipInputRenderAddPostForm.default || []),
    ...(skipInputRenderAddPostForm[collectionName] || []),
  ];
};
