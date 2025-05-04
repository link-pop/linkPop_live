import models from "@/lib/db/models/models";

export async function getAllMongoCollectionsData(colName = null) {
  try {
    const modelData = Object.values(models).map((model) => {
      return {
        name: model.collection.collectionName,
        settings: model.schema.settings || {},
      };
    });

    const filteredData = modelData.filter(
      (model) => model.name.toLowerCase() !== "notThisCollection" // ! ENABLE_USER_PROFILE: erase "users"
    );

    if (colName) {
      // If colName is provided, return the object for that collection, not all collections
      return filteredData.find((c) => c.name === colName) || null;
    }

    return filteredData;

    // Now returns an array of objects like:
    // [
    //   {
    //     name: "faq",
    //     settings: {
    //       singular: true,
    //       noFullPost: true,
    //       onNavClickScroll: true,
    //     }
    //   },
    //   {
    //     name: "feature",
    //     settings: {
    //       noFullPost: true,
    //       onNavClickScroll: true,
    //     }
    //   },
    //   // ... etc
    // ]
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}
