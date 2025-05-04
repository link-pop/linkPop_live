import { getAllFieldsInMongoCollection } from "@/lib/utils/mongo/getAllFieldsInMongoCollection";

export default async function checkAddPostFormHasFiles(col) {
  const allFieldNamesAndTypesInCol = await getAllFieldsInMongoCollection(col);
  const hasFiles = allFieldNamesAndTypesInCol.some(
    (field) => field.name === "files"
  );
  const isRequiredFiles = allFieldNamesAndTypesInCol.some(
    (field) => field.required
  );
  return { hasFiles, isRequiredFiles };
}
