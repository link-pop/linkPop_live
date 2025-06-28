"use server";

export const dynamic = "force-dynamic";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { createPriceFilter } from "@/lib/utils/suggestions/createPriceFilter";
import { createCreatorNameFilter } from "@/lib/utils/suggestions/createCreatorNameFilter";
import { combineFilters } from "@/lib/utils/suggestions/combineFilters";
import { doesLocationMatch } from "@/lib/utils/suggestions/locationMatching";
import { doesAgeMatch } from "@/lib/utils/ageRangeMatching";
import { SUGGESTIONS_USERCHECK_LIMIT } from "@/lib/utils/constants";

/**
 * Check if creator has at least one tag in any category of lastUploadedCreatorTags
 */
const hasAnyUploadedTags = (creator) => {
  if (!creator.lastUploadedCreatorTags) return false;

  return (
    (creator.lastUploadedCreatorTags.raceEthnicity &&
      creator.lastUploadedCreatorTags.raceEthnicity.length > 0) ||
    (creator.lastUploadedCreatorTags.hairColor &&
      creator.lastUploadedCreatorTags.hairColor.length > 0) ||
    (creator.lastUploadedCreatorTags.bodyType &&
      creator.lastUploadedCreatorTags.bodyType.length > 0) ||
    (creator.lastUploadedCreatorTags.gender &&
      creator.lastUploadedCreatorTags.gender.length > 0) ||
    (creator.lastUploadedCreatorTags.age &&
      creator.lastUploadedCreatorTags.age.length > 0)
  );
};

/**
 * Search for creators based on search parameters
 *
 * @param {Object} searchParams - Search parameters object
 * @param {number} limit - Number of users to return (default: 20)
 * @param {number} skip - Number of users to skip for pagination (default: 0)
 * @returns {Object} - Object with users array and metadata about search results
 */
export const searchCreators = async (
  searchParams = {},
  limit = 20,
  skip = 0
) => {
  try {
    // Get current user
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return {
        users: [],
        approach: "none",
        nameFilterFallback: false,
        totalCount: 0,
        hasMore: false,
      };
    }

    console.log("🔍 Search parameters:", searchParams);

    // Initialize base filters
    const baseFilters = {
      // Only get users with profile images
      profileImage: { $ne: "" },
      // Only search creators
      profileType: "creator",
    };

    // Create price filter based on showPaidOnly parameter
    const priceFilter = createPriceFilter(searchParams.showPaidOnly !== false);

    // Add creator name filter if provided
    const creatorNameFilter = createCreatorNameFilter(
      searchParams.preferCreatorName
    );

    // Combine all filters properly to avoid $or conflicts
    let filters = combineFilters(baseFilters, priceFilter, creatorNameFilter);

    // If user has hidden suggestions, exclude them
    if (
      mongoUser?.hiddenSuggestions &&
      mongoUser.hiddenSuggestions.length > 0
    ) {
      filters._id = { $nin: mongoUser.hiddenSuggestions };
    }

    // Age filter - use only if provided
    if (searchParams.preferAge) {
      const ageMin = Math.max(18, Number(searchParams.preferAge) - 5);
      const ageMax = Number(searchParams.preferAge) + 5;
      filters.age = { $gte: ageMin, $lte: ageMax };
    }

    // Get users that the current user is subscribed to
    const subscriptions = await getAll({
      col: "subscriptions",
      data: {
        createdBy: mongoUser._id,
        active: true,
      },
    });

    const subscribedToIds = subscriptions.map((sub) => sub.subscribedTo);

    // Exclude users that the current user is already subscribed to
    if (subscribedToIds.length > 0) {
      filters._id = {
        ...filters._id,
        $nin: [...(filters._id?.$nin || []), ...subscribedToIds],
      };
    }

    console.log("🔍 Database filters:", JSON.stringify(filters, null, 2));

    // Get ALL creators with filters applied at database level
    const allCreators = await getAll({
      col: "users",
      data: filters,
      limit: SUGGESTIONS_USERCHECK_LIMIT, // Get more to filter through
      skip: skip,
    });

    console.log("📊 Found", allCreators.length, "total creators from database");

    // Filter creators that have at least one tag (for better matching)
    const creatorsWithTags = allCreators.filter(hasAnyUploadedTags);

    console.log("📊 Found", creatorsWithTags.length, "creators with tags");

    let matchedCreators = [];
    let approach = "database_filter";
    let nameFilterFallback = false;

    // Apply client-side filtering for more complex matching
    for (const creator of creatorsWithTags) {
      let isMatch = true;

      // Gender matching
      if (searchParams.preferGender && searchParams.preferGender !== "any") {
        const creatorGender =
          creator.gender ||
          (creator.lastUploadedCreatorTags?.gender &&
          creator.lastUploadedCreatorTags.gender.length > 0
            ? creator.lastUploadedCreatorTags.gender[0]
            : null);

        if (!creatorGender || creatorGender !== searchParams.preferGender) {
          isMatch = false;
        }
      }

      // Hair color matching
      if (
        searchParams.preferHairColor &&
        searchParams.preferHairColor !== "any"
      ) {
        const creatorHairColor =
          creator.hairColor ||
          (creator.lastUploadedCreatorTags?.hairColor &&
          creator.lastUploadedCreatorTags.hairColor.length > 0
            ? creator.lastUploadedCreatorTags.hairColor[0]
            : null);

        if (
          !creatorHairColor ||
          creatorHairColor !== searchParams.preferHairColor
        ) {
          isMatch = false;
        }
      }

      // Body type matching
      if (
        searchParams.preferBodyType &&
        searchParams.preferBodyType !== "any"
      ) {
        const creatorBodyType =
          creator.bodyType ||
          (creator.lastUploadedCreatorTags?.bodyType &&
          creator.lastUploadedCreatorTags.bodyType.length > 0
            ? creator.lastUploadedCreatorTags.bodyType[0]
            : null);

        if (
          !creatorBodyType ||
          creatorBodyType !== searchParams.preferBodyType
        ) {
          isMatch = false;
        }
      }

      // Race/Ethnicity matching
      if (
        searchParams.preferRaceEthnicity &&
        searchParams.preferRaceEthnicity !== "any"
      ) {
        const creatorRaceEthnicity =
          creator.raceEthnicity ||
          (creator.lastUploadedCreatorTags?.raceEthnicity &&
          creator.lastUploadedCreatorTags.raceEthnicity.length > 0
            ? creator.lastUploadedCreatorTags.raceEthnicity[0]
            : null);

        if (
          !creatorRaceEthnicity ||
          creatorRaceEthnicity !== searchParams.preferRaceEthnicity
        ) {
          isMatch = false;
        }
      }

      // Location matching
      if (searchParams.preferCountry || searchParams.preferCountryCode) {
        if (
          !doesLocationMatch(
            searchParams.preferCountry,
            searchParams.preferCountryCode,
            creator
          )
        ) {
          isMatch = false;
        }
      }

      if (isMatch) {
        matchedCreators.push(creator);
      }
    }

    console.log(
      "📊 Found",
      matchedCreators.length,
      "matched creators after client-side filtering"
    );

    // If no matches found and displayAllUsersIfNoMatchFoundForSuggestions is true, show all creators
    if (
      matchedCreators.length === 0 &&
      searchParams.displayAllUsersIfNoMatchFoundForSuggestions
    ) {
      matchedCreators = creatorsWithTags;
      approach = "fallback_all";
      nameFilterFallback = true;
      console.log("📊 Using fallback: showing all creators");
    }

    // Limit results for pagination
    const paginatedResults = matchedCreators.slice(0, limit);
    const hasMore = matchedCreators.length > limit;

    console.log("📊 Returning", paginatedResults.length, "creators");

    return {
      users: paginatedResults,
      approach,
      nameFilterFallback,
      totalCount: matchedCreators.length,
      hasMore,
    };
  } catch (error) {
    console.error("Error searching creators:", error);
    return {
      users: [],
      approach: "error",
      nameFilterFallback: false,
      totalCount: 0,
      hasMore: false,
      error: error.message,
    };
  }
};
