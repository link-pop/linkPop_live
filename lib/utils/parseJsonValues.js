export function parseJsonValues(data) {
  // Handle null or undefined data
  if (!data) return {};

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      try {
        // Handle checkbox/switch values that come as "on" string
        if (value === "on") {
          return [key, true];
        }
        // Handle checkbox/switch values that are not present in form data (unchecked)
        if (value === undefined && key === "active") {
          return [key, false];
        }

        // If value is already an array of objects, return it as is
        if (
          Array.isArray(value) &&
          value.every((item) => typeof item === "object" && item !== null)
        ) {
          return [key, value];
        }

        // Try to parse the value if it's a string
        if (typeof value === "string") {
          const parsedValue = JSON.parse(value);
          // Check if parsedValue is an array of objects or a single object
          if (
            Array.isArray(parsedValue) &&
            parsedValue.every(
              (item) => typeof item === "object" && item !== null
            )
          ) {
            return [key, parsedValue];
          }
          if (typeof parsedValue === "object" && parsedValue !== null) {
            return [key, [parsedValue]]; // Wrap single object in array
          }
        }
        return [key, value];
      } catch {
        return [key, value];
      }
    })
  );
}
