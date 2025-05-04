import mongoose from "mongoose";
import { skipSearchMongoCollectionFields } from "./_settingsSkipSearchMongoCollectionFields";

export async function getAllFieldsInMongoCollection(col) {
  // TODO ??? get rid of col === 'string' pass only object (WHOLE PROJECT)
  col = typeof col === "string" ? col : col?.name;
  try {
    const model = mongoose.models[col] || mongoose.model(col);
    if (!model) {
      console.log(`Model for collection ${col} not found.`);
      return [];
    }

    const schemaPaths = model.schema.paths;
    const fieldNamesAndTypes = Object.keys(schemaPaths)
      .filter((field) => !skipSearchMongoCollectionFields.includes(field))
      .map((field) => ({
        name: field,
        type: schemaPaths[field].instance,
        required: schemaPaths[field].isRequired || false,
        defaultValue:
          typeof schemaPaths[field].defaultValue === "function"
            ? schemaPaths[field].defaultValue()
            : schemaPaths[field].defaultValue,
      }));

    return fieldNamesAndTypes;
    // console.log({ fieldNamesAndTypes });
    // fieldNamesAndTypes: [
    //   { name: 'title', type: 'String', required: true, defaultValue: '' },
    //   { name: 'price', type: 'Number', required: true, defaultValue: 0 },
    //   { name: 'tags', type: 'Array', required: false, defaultValue: [] },
    //   { name: 'active', type: 'Boolean', required: false, defaultValue: true }
    // ]
  } catch (error) {
    console.error(
      `Error retrieving field names and types for collection ${col}:`,
      error
    );
    return [];
  }
}
