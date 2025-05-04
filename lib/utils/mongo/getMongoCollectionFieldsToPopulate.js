import mongoose from "mongoose";

export function getMongoCollectionFieldsToPopulate(col) {
  try {
    const model = mongoose.model(col);
    const schema = model.schema;
    const populateFields = [];

    // Helper function to check if a path has a ref
    const hasRef = (path) =>
      path.options?.ref ||
      (path.instance === "Array" && path.caster?.options?.ref);

    // Helper function to get ref model name
    const getRefModelName = (path) =>
      path.instance === "Array"
        ? path.caster?.options?.ref
        : path.options?.ref;

    // Helper function to get nested fields to populate
    const getNestedFieldsToPopulate = (refModelName) => {
      try {
        const refModel = mongoose.model(refModelName);
        const refSchema = refModel.schema;
        const nestedFields = [];

        Object.keys(refSchema.paths).forEach((nestedPathName) => {
          const nestedPath = refSchema.paths[nestedPathName];
          if (hasRef(nestedPath)) {
            nestedFields.push({
              path: nestedPathName,
              model: getRefModelName(nestedPath)
            });
          }
        });

        return nestedFields;
      } catch (err) {
        return [];
      }
    };

    // Iterate through schema paths
    Object.keys(schema.paths).forEach((pathName) => {
      const path = schema.paths[pathName];

      if (hasRef(path)) {
        const refModelName = getRefModelName(path);
        if (refModelName) {
          // Get nested fields that need population
          const nestedFields = getNestedFieldsToPopulate(refModelName);
          
          if (nestedFields.length > 0) {
            // Add the main field with nested populate
            populateFields.push({
              path: pathName,
              populate: nestedFields
            });
          } else {
            populateFields.push(pathName);
          }
        }
      }
    });

    return populateFields.length > 0 ? populateFields : null;
  } catch (err) {
    console.error(
      `Error in getMongoCollectionFieldsToPopulate for collection ${col}:`,
      err
    );
    return null;
  }
}
