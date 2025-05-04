import { getMongoCollectionFieldsToPopulate } from "./getMongoCollectionFieldsToPopulate";

export default function addPopulateMongoCollection(colName) {
  // auto-detect fields to populate
  const fieldsToPopulate = getMongoCollectionFieldsToPopulate(colName);
  if (fieldsToPopulate) {
    return fieldsToPopulate;
  }

  return {};
}
