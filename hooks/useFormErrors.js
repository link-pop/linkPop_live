import { useState } from "react";

/**
 * Custom hook for managing form errors
 * @param {Object} initialErrors - Initial errors object
 * @returns {Object} - Error handling utilities
 */
export default function useFormErrors(initialErrors = {}) {
  const [errors, setErrors] = useState(initialErrors);

  /**
   * Clear all errors
   */
  const clearAllErrors = () => {
    setErrors({});
  };

  /**
   * Set multiple errors at once
   * @param {Object} newErrors - Object containing new errors
   */
  const setMultipleErrors = (newErrors) => {
    setErrors(newErrors);
  };

  /**
   * Set error for a specific field
   * @param {string} fieldName - Name of the field
   * @param {string} errorMessage - Error message
   */
  const setError = (fieldName, errorMessage) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));
  };

  /**
   * Clear error for a specific field
   * @param {string} fieldName - Name of the field to clear error for
   */
  const clearError = (fieldName) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  /**
   * Create an onChange handler that clears errors when user types
   * @param {Function} originalOnChange - Original onChange handler
   * @returns {Function} - Enhanced onChange handler that clears errors
   */
  const createChangeHandler = (originalOnChange) => {
    return (e) => {
      const { name } = e.target;

      // Clear error for this field if it exists
      if (errors[name]) {
        clearError(name);
      }

      // Call the original onChange handler
      if (originalOnChange) {
        originalOnChange(e);
      }
    };
  };

  /**
   * Check if there are any errors
   * @returns {boolean} - True if there are errors
   */
  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    setMultipleErrors,
    createChangeHandler,
    hasErrors,
  };
}
