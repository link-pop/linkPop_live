import models from "@/lib/db/models/models";

export async function getMongoCollectionDateFieldRanges(
  collectionName,
  fieldName
) {
  const collection = models[collectionName];

  const aggregation = await collection.aggregate([
    {
      $group: {
        _id: null,
        minDate: { $min: `$${fieldName}` },
        maxDate: { $max: `$${fieldName}` },
      },
    },
  ]);

  if (aggregation.length === 0) {
    return {
      minDate: null,
      maxDate: null,
    };
  }

  // Format dates to YYYY-MM-DD
  const minDate = aggregation[0].minDate
    ? new Date(aggregation[0].minDate).toISOString().split("T")[0]
    : null;
  const maxDate = aggregation[0].maxDate
    ? new Date(aggregation[0].maxDate).toISOString().split("T")[0]
    : null;

  return { minDate, maxDate };
}
