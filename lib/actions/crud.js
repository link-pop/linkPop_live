"use server";

import mongoose from "mongoose";
import { connectToDb } from "../db/connectToDb";
// ! don't delete: used for mongoose.model(col) eg: mongoose.model(users)
import { models } from "../db/models/models";
import { revalidatePath } from "next/cache";
import addPopulateMongoCollection from "../utils/mongo/addPopulateMongoCollection";
import handleMongoCollectionSearch from "../utils/mongo/handleMongoCollectionSearch";
import { parseJsonValues } from "@/lib/utils/parseJsonValues";
import { getMongoCollectionFieldsToPopulate } from "@/lib/utils/mongo/getMongoCollectionFieldsToPopulate";
import { handleError } from "../utils/errorHandling";
import { deepSanitize } from "@/lib/utils/mongo/sanitizeMongo";
import { checkUserOwnership } from "@/lib/actions/checkUserOwnership";
import { checkUserSelfOwnership } from "@/lib/actions/checkUserOwnership";
import { sendErrorToAdmin } from "@/lib/actions/sendErrorToAdmin";

// Helper to get collection name
// TODO ??? get rid of col === 'string' pass only object (WHOLE PROJECT)
const getColName = (col) => (typeof col === "string" ? col : col?.name);

// ! CREATE
export const add = async ({ col, data = {}, revalidate = "/" }) => {
  const colName = getColName(col);
  if (!colName) return { error: "Collection name is required" };

  const parsedAdd = parseJsonValues(data);
  const populateInfo = addPopulateMongoCollection(colName);

  try {
    await connectToDb();

    // Get the model from our models object
    const Model = models[colName];
    if (!Model) {
      throw new Error(`Model ${colName} not found`);
    }

    const newDocument = new Model({
      ...parsedAdd,
      ...populateInfo,
    });

    const savedDocument = await newDocument.save();
    const sanitizedDoc = deepSanitize(savedDocument.toObject());
    const validRevalidatePath =
      typeof revalidate === "string" && revalidate.startsWith("/")
        ? revalidate
        : "/";
    revalidatePath(validRevalidatePath);
    return sanitizedDoc;
  } catch (err) {
    console.error("Error in add:", err);
    await sendErrorToAdmin({
      error: err,
      subject: "Add Operation Error",
      context: { col: colName, data: parsedAdd },
    });
    return handleError(err, "add", { col: colName, data: parsedAdd });
  }
};

// ! READ many [{}, {}, ...]
export const getAll = async ({
  col,
  data = {},
  populate = undefined,
  skip = 0,
  limit = 999999,
  searchParams = {},
  sort = { createdAt: -1 },
}) => {
  const colName = getColName(col);
  if (!colName) return { error: "Collection name is required" };

  const resolvedSearchParams = await handleMongoCollectionSearch({
    searchParams,
    col: colName,
  });

  try {
    await connectToDb();

    // Get the model from our models object
    const Model = models[colName];
    if (!Model) {
      throw new Error(`Model ${colName} not found`);
    }

    let query = Model.find({ ...data, ...resolvedSearchParams })
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // If populate is undefined, auto-detect fields to populate
    if (populate === undefined) {
      const fieldsToPopulate = getMongoCollectionFieldsToPopulate(colName);
      if (fieldsToPopulate) {
        query = query.populate(fieldsToPopulate);
      }
    }
    // If populate is explicitly set (including null), use that value
    else if (populate) {
      query = query.populate(populate);
    }

    const results = await query.lean();

    if (results.length === 0) return [];

    return results.map((doc) => deepSanitize(doc));
  } catch (err) {
    await sendErrorToAdmin({
      error: err,
      subject: "GetAll Operation Error",
      context: { col: colName, data, searchParams },
    });
    return handleError(err, "getAll");
  }
};

// ! READ one {}
export const getOne = async (args) => {
  try {
    const result = await getAll({ ...args });
    return result?.[0] || null;
  } catch (err) {
    await sendErrorToAdmin({
      error: err,
      subject: "GetOne Operation Error",
      context: { args },
    });
    return handleError(err, "getOne");
  }
};

// ! UPDATE
export const update = async ({ col, data, update, revalidate = "/" }) => {
  const colName = getColName(col);
  if (!colName) return { error: "Collection name is required" };

  if (!data) return { error: "Query data is required" };
  if (!update) return { error: "Update data is required" };

  const parsedUpdate = parseJsonValues(update);

  try {
    await connectToDb();

    // Get the model from our models object
    const Model = models[colName];
    if (!Model) {
      throw new Error(`Model ${colName} not found`);
    }

    // Get the document to check ownership
    const document = await Model.findOne({ ...data }).lean();
    if (!document) {
      return { error: "Document not found" };
    }

    // Special case for user documents
    const isUserDocument = colName === "users";

    // Check ownership using the appropriate utility function
    const { isOwner, error } = isUserDocument
      ? await checkUserSelfOwnership(document)
      : await checkUserOwnership(document);

    // If the user is not the owner of this document, deny the update
    if (!isOwner) {
      console.error(`Update permission denied: ${error}`);
      return { error };
    }

    const updatedDocument = await Model.findOneAndUpdate(
      { ...data },
      { ...parsedUpdate },
      { new: true }
    ).lean();

    if (!updatedDocument) {
      return { error: "Document not found or update failed" };
    }

    const safeRevalidatePath =
      typeof revalidate === "string" ? revalidate : "/";
    revalidatePath(safeRevalidatePath);
    return deepSanitize(updatedDocument);
  } catch (err) {
    console.error("Error in update:", err);
    await sendErrorToAdmin({
      error: err,
      subject: "Update Operation Error",
      context: { col: colName, data, update: parsedUpdate },
    });
    return handleError(err, "update", { col: colName, data });
  }
};

// ! DELETE one
export const removeOne = async ({
  col,
  data,
  revalidate = "/",
  postsPaginationType,
}) => {
  const colName = getColName(col);
  if (!colName) return { error: "Collection name is required" };

  try {
    await connectToDb();

    // Get the model from our models object
    const Model = models[colName];
    if (!Model) {
      throw new Error(`Model ${colName} not found`);
    }

    // Get the document to check ownership
    const document = await Model.findOne({ ...data }).lean();
    if (!document) {
      return { error: "Document not found" };
    }

    // Check ownership using the utility function
    const { isOwner, error } = await checkUserOwnership(document);

    // If the user is not the owner of this document, deny the deletion
    if (!isOwner) {
      return { error };
    }

    const deletedDocument = await Model.findOneAndDelete({ ...data }).lean();

    if (!deletedDocument) return { error: "Document not found" };

    const safeRevalidatePath =
      typeof revalidate === "string" ? revalidate : "/";
    if (postsPaginationType !== "infinite") {
      revalidatePath(safeRevalidatePath);
    }
    return deepSanitize(deletedDocument)._id.toString();
  } catch (err) {
    await sendErrorToAdmin({
      error: err,
      subject: "RemoveOne Operation Error",
      context: { col: colName, data },
    });
    return handleError(err, "remove");
  }
};

// ! DELETE many
export const removeAll = async (col) => {
  const colName = getColName(col);
  if (!colName) return { error: "Collection name is required" };

  try {
    await connectToDb();

    // Get the model from our models object
    const Model = models[colName];
    if (!Model) {
      throw new Error(`Model ${colName} not found`);
    }

    await Model.deleteMany({});
    return { success: true };
  } catch (error) {
    console.error("Error in removeAll:", error);
    await sendErrorToAdmin({
      error,
      subject: "RemoveAll Operation Error",
      context: { col: colName },
    });
    return handleError(error, "removeAll");
  }
};
