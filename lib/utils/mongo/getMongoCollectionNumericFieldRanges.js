import mongoose from "mongoose";

export async function getMongoCollectionNumericFieldRanges(col) {
  try {
    const model = mongoose.model(col.name);
    const schemaPaths = model.schema.paths;

    // Identify numeric fields
    const numericFields = Object.keys(schemaPaths).filter(
      (field) => schemaPaths[field].instance === "Number"
    );

    if (numericFields.length === 0) {
      console.warn(`No numeric fields found in collection: ${col}`);
      return {};
    }

    // Create aggregation pipeline
    const pipeline = [
      {
        $group: numericFields.reduce(
          (acc, field) => {
            acc[`min_${field}`] = { $min: `$${field}` };
            acc[`max_${field}`] = { $max: `$${field}` };
            return acc;
          },
          { _id: null }
        ),
      },
    ];

    const result = await model.aggregate(pipeline).exec();

    if (result.length === 0) {
      console.warn(
        `No results found for numeric field ranges in collection: ${col}`
      );
      return {};
    }

    // Transform the result to a more usable format
    const min = {};
    const max = {};
    numericFields.forEach((field) => {
      min[field] = result[0][`min_${field}`];
      max[field] = result[0][`max_${field}`];
    });

    return { min, max };
  } catch (error) {
    console.error("Error fetching numeric field ranges:", error);
    return {};
  }
}
