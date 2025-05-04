import SelectMulti from "@/components/ui/shared/Select/SelectMulti";
import mongoose from "mongoose";
import React from "react";

export default async function AddPostFormInputArray({
  col,
  allFieldNamesAndTypesInCol,
  updatingPost,
}) {
  // Fetch unique options for all array fields before rendering
  const uniqueOptionsMap = {};
  for (const field of allFieldNamesAndTypesInCol.filter(
    (field) => field.type === "Array"
  )) {
    uniqueOptionsMap[field.name] = await mongoose
      .model(col.name)
      .distinct(field.name);
  }

  return allFieldNamesAndTypesInCol
    .filter((field) => field.type === "Array")
    .map((field) => {
      // Use default values from allFieldNamesAndTypesInCol if updatingPost is not provided
      const defaultValues = field.defaultValue || [];
      const selectedValues = updatingPost?.[field.name] || defaultValues;
      const selectedValueLookup = new Set(
        selectedValues.map((item) => item.value)
      );

      const availableOptions = uniqueOptionsMap[field.name].filter(
        (option) => !selectedValueLookup.has(option.value)
      );

      return (
        <SelectMulti
          key={field.name}
          name={field.name}
          selectedValues={selectedValues}
          required={field.required}
          availableOptions={availableOptions}
        />
      );
    });
}
