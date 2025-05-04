"use server";

import { connectToDb } from "../db/connectToDb";
import GeoFilterModel from "../db/models/GeoFilterModel";
import { models } from "../db/models/models";
import { handleError } from "../utils/errorHandling";
import { sendErrorToAdmin } from "./sendErrorToAdmin";

// ! code start syncGeoFilterData
/**
 * Synchronizes geo filter data with the parent entity (landingpage or directlink)
 * This should be called when a geo filter is created or updated
 *
 * @param {string} entityId - ID of the entity to sync
 * @param {string} entityType - Type of entity (landingpage or directlink)
 * @returns {Promise<boolean>} - Whether the sync was successful
 */
export const syncGeoFilterData = async (entityId, entityType) => {
  if (!entityId || !entityType) {
    console.error("syncGeoFilterData: Missing entityId or entityType");
    return false;
  }

  try {
    await connectToDb();

    // Get the geo filter data
    const geoFilter = await GeoFilterModel.findOne({
      entityId,
      entityType,
    }).lean();

    if (!geoFilter) {
      console.log(`No geo filter found for ${entityType} ${entityId}`);
      return false;
    }

    // Determine the collection to update
    const collectionName =
      entityType === "landingpage" ? "landingpages" : "directlinks";
    const Model = models[collectionName];

    if (!Model) {
      throw new Error(`Model ${collectionName} not found`);
    }

    // Prepare update data
    const updateData = {
      geoFilterActive: geoFilter.active,
      geoFilterMode: geoFilter.mode,
      geoFilterLocations: geoFilter.locations || [],
    };

    // Update the entity
    const result = await Model.findByIdAndUpdate(entityId, updateData, {
      new: true,
    }).lean();

    if (!result) {
      console.error(
        `Failed to update ${entityType} ${entityId} with geo filter data`
      );
      return false;
    }

    console.log(
      `Successfully synchronized geo filter data for ${entityType} ${entityId}`
    );
    return true;
  } catch (error) {
    console.error("Error synchronizing geo filter data:", error);
    await sendErrorToAdmin({
      error,
      subject: "GeoFilter Sync Error",
      context: { entityId, entityType },
    });
    handleError(error, "syncGeoFilterData");
    return false;
  }
};

/**
 * Synchronizes all geo filter data with their parent entities
 * This can be used to update all entities after a schema change
 *
 * @returns {Promise<{success: number, failed: number}>} - Count of successful and failed syncs
 */
export const syncAllGeoFilterData = async () => {
  const stats = {
    success: 0,
    failed: 0,
  };

  try {
    await connectToDb();

    // Get all geo filters
    const geoFilters = await GeoFilterModel.find({}).lean();

    if (!geoFilters.length) {
      console.log("No geo filters found to sync");
      return stats;
    }

    // Process each geo filter
    for (const filter of geoFilters) {
      const success = await syncGeoFilterData(
        filter.entityId,
        filter.entityType
      );

      if (success) {
        stats.success++;
      } else {
        stats.failed++;
      }
    }

    console.log(
      `Geo filter sync complete: ${stats.success} successful, ${stats.failed} failed`
    );
    return stats;
  } catch (error) {
    console.error("Error in syncAllGeoFilterData:", error);
    await sendErrorToAdmin({
      error,
      subject: "Bulk GeoFilter Sync Error",
    });
    handleError(error, "syncAllGeoFilterData");
    return stats;
  }
};
// ? code end syncGeoFilterData
