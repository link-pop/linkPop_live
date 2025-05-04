import { useState, useEffect } from "react";

export function useGenerateSortableFields(
  collection,
  allFieldNamesAndTypesInCol
) {
  const [sortableFields, setSortableFields] = useState([
    { value: "createdAt", labelAsc: "Oldest First", labelDesc: "Newest First" },
  ]);

  useEffect(() => {
    // Add collection fields based on their types
    const generatedFields = allFieldNamesAndTypesInCol?.reduce(
      (acc, field) => {
        if (field.type === "String" || field.type === "Number") {
          const fieldName = field.name;
          const fieldLabel = fieldName
            .split(/(?=[A-Z])|_|\s/)
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");

          const sortField = {
            value: fieldName,
            labelAsc:
              field.type === "Number"
                ? `${fieldLabel}: Low to High`
                : `${fieldLabel} (A-Z)`,
            labelDesc:
              field.type === "Number"
                ? `${fieldLabel}: High to Low`
                : `${fieldLabel} (Z-A)`,
          };
          return [...acc, sortField];
        }
        return acc;
      },
      [
        // Default timestamp field
        {
          value: "createdAt",
          labelAsc: "Oldest First",
          labelDesc: "Newest First",
        },
      ]
    );

    setSortableFields(generatedFields);
  }, [collection, allFieldNamesAndTypesInCol]);

  return sortableFields;
}
