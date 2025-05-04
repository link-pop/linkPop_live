import { getAllFieldsInMongoCollection } from "./getAllFieldsInMongoCollection";
import { getFilteredPostsIdsByUserAction } from "./getFilteredPostsIdsByUserAction";
import mongoose from "mongoose";

export default async function handleMongoCollectionSearch({
  searchParams,
  col,
}) {
  if (!searchParams) {
    // If no searchParams, return an empty object to match all documents
    return {};
  }

  const { ...specificSearchParams } = searchParams;

  // Retrieve all field names and types from the collection
  const allFieldNamesAndTypesInCol = await getAllFieldsInMongoCollection(col);

  let query = {};
  const collectionName = typeof col === "string" ? col : col.name;

  for (const [field, value] of Object.entries(specificSearchParams)) {
    // ! Handle excludeIds parameter
    if (field === "excludeIds" && Array.isArray(value) && value.length > 0) {
      query._id = { $nin: value };
      continue;
    }

    // ! Special handling for createdBy parameter (MongoDB ObjectId)
    if (field === "createdBy" && value && value !== "noUserId") {
      query.createdBy = new mongoose.Types.ObjectId(value);
      continue;
    }

    // ! Special handling for "liked" parameter
    if (field === "liked" && specificSearchParams.userId) {
      const postIds = await getFilteredPostsIdsByUserAction({
        actionType: "liked",
        userId: specificSearchParams.userId,
        collectionName,
      });
      if (value === "true" || value === true) {
        query = {
          ...query,
          ...{
            _id: {
              $in: postIds,
            },
          },
        };
      }
      if (value === "false" || value === false) {
        query = {
          ...query,
          ...{
            _id: {
              $nin: postIds,
            },
          },
        };
      }
      continue;
    }
    // ? Special handling for "liked" parameter

    // ! Special handling for "viewed" parameter
    if (field === "viewed" && specificSearchParams.userId) {
      const postIds = await getFilteredPostsIdsByUserAction({
        actionType: "viewed",
        userId: specificSearchParams.userId,
        collectionName,
      });
      if (value === "true" || value === true) {
        query = {
          ...query,
          ...{
            _id: {
              $in: postIds,
            },
          },
        };
      }
      if (value === "false" || value === false) {
        query = {
          ...query,
          ...{
            _id: {
              $nin: postIds,
            },
          },
        };
      }
      continue;
    }
    // ? Special handling for "viewed" parameter

    // ! makes search for auto-generated inputs
    // Extract the base field name and type (min/max) for date fields
    const isDateField = field.endsWith("_min") || field.endsWith("_max");
    const baseFieldName = isDateField
      ? field.replace(/_min$|_max$/, "")
      : field;

    const fieldInfo = allFieldNamesAndTypesInCol.find(
      (fieldObj) => fieldObj.name === baseFieldName
    );

    if (fieldInfo) {
      if (fieldInfo.type === "String") {
        query = {
          ...query,
          [field]: { $regex: value.toString(), $options: "i" },
        };
      } else if (fieldInfo.type === "Number") {
        const [min, max] = value.split("-").map(Number);
        query = {
          ...query,
          [field]: {
            ...(min !== undefined && !isNaN(min) && { $gte: min }),
            ...(max !== undefined && !isNaN(max) && { $lte: max }),
          },
        };
      } else if (fieldInfo.type === "Date") {
        const [minTimestamp, maxTimestamp] = value.split("-").map(Number);
        query[field] = {};

        if (minTimestamp && minTimestamp !== 0) {
          query[field].$gte = new Date(minTimestamp);
        }
        if (maxTimestamp && maxTimestamp !== 0) {
          query[field].$lte = new Date(maxTimestamp);
        }
      } else if (fieldInfo.type === "Array") {
        query = {
          ...query,
          [field]: {
            $elemMatch: {
              value: { $regex: `^${value.toString()}$`, $options: "i" },
            },
          },
        };
      } else {
        query = {
          ...query,
          [field]: value,
        };
      }
    }
  }

  return query;
}
