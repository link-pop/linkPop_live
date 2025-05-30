/**
 * Combine multiple MongoDB filters that may contain $or operators
 * This ensures that $or conditions don't overwrite each other when using spread operator
 * @param {...Object} filters - Multiple filter objects to combine
 * @returns {Object} Combined MongoDB filter object
 */
export const combineFilters = (...filters) => {
  // Filter out null/undefined filters
  const validFilters = filters.filter(
    (filter) => filter && typeof filter === "object"
  );

  if (validFilters.length === 0) {
    return {};
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  // Check if any filters contain $or operators
  const filtersWithOr = validFilters.filter((filter) => filter.$or);
  const filtersWithoutOr = validFilters.filter((filter) => !filter.$or);

  // If no $or operators, we can safely use spread operator
  if (filtersWithOr.length === 0) {
    return Object.assign({}, ...validFilters);
  }

  // If only one filter has $or, combine it with others using spread
  if (filtersWithOr.length === 1) {
    const combinedWithoutOr = Object.assign({}, ...filtersWithoutOr);
    return { ...combinedWithoutOr, ...filtersWithOr[0] };
  }

  // Multiple filters have $or - need to use $and to combine them
  const combinedWithoutOr = Object.assign({}, ...filtersWithoutOr);
  const andConditions = filtersWithOr.map((filter) => {
    // If filter has other properties besides $or, wrap the entire filter
    const otherProps = Object.keys(filter).filter((key) => key !== "$or");
    if (otherProps.length > 0) {
      return filter;
    }
    // If filter only has $or, return just the $or condition
    return { $or: filter.$or };
  });

  // Combine everything
  const result = { ...combinedWithoutOr };

  if (andConditions.length > 0) {
    result.$and = andConditions;
  }

  return result;
};
