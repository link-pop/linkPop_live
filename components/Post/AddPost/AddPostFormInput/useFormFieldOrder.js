export function useFormFieldOrder(elements, colSettings) {
  if (!elements || !colSettings?.fields) return elements;

  // Get order from settings
  const getOrderValue = (element) => {
    // Handle array inputs which are wrapped in a component
    if (element.key === "array-inputs") {
      // Instead of returning Infinity, return 0 to place array inputs in the middle
      return 0;
    }

    // Try to get field name from different props patterns
    const fieldName =
      element.props.name || // Regular inputs
      (element.props.defaultValue &&
      (colSettings.fields[element.props.name]?.subtype === "country" ||
        "country" in element.props.defaultValue)
        ? element.props.name
        : null); // country selector

    if (!fieldName) return Infinity;

    // If order is explicitly set, use it
    if (colSettings.fields[fieldName]?.order !== undefined) {
      return colSettings.fields[fieldName].order;
    }

    // When no order is provided:
    // - Text inputs go to the end (Infinity)
    // - Other inputs stay in the middle (0)
    const subtype = colSettings.fields[fieldName]?.subtype?.toLowerCase();
    if (subtype === "text") return Infinity;

    // Handle array type fields - place in middle
    const fieldType = colSettings.fields[fieldName]?.type?.toLowerCase();
    if (element.props.type === "array" || fieldType === "array") return 0;

    return 0;
  };

  // Sort elements based on their order value
  return [...elements].sort((a, b) => {
    const orderA = getOrderValue(a);
    const orderB = getOrderValue(b);
    return orderA - orderB;
  });
}
