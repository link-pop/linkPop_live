

// Add more specific error handling based on the type of error
export const handleError = async (error, functionName, context = {}) => {
  // Basic error logging
  console.error(`Error in ${functionName}:`, error);


  // Handle MongoDB validation errors
  if (error.name === "ValidationError") {
    const validationErrors = {};

    for (const field in error.errors) {
      validationErrors[field] = error.errors[field].message;
    }

    return {
      error: "Validation Error",
      validationErrors,
    };
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      error: `Duplicate value for ${field}. This value already exists.`,
    };
  }

  // Handle other specific error types as needed

  // Default error response
  return {
    error: error.message || "An unknown error occurred",
  };
};
