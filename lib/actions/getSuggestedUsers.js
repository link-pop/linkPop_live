"use server";

import { getAll, getOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getMostFrequentCreatorTags } from "@/lib/utils/getMostFrequentCreatorTags";
import { hasUserPreferences } from "@/lib/utils/hasUserPreferences";
import { doesAgeMatch } from "@/lib/utils/ageRangeMatching";
import { createPriceFilter } from "@/lib/utils/suggestions/createPriceFilter";
import { createCreatorNameFilter } from "@/lib/utils/suggestions/createCreatorNameFilter";
import { shouldFallbackDueToCreatorName } from "@/lib/utils/suggestions/shouldFallbackDueToCreatorName";
import { combineFilters } from "@/lib/utils/suggestions/combineFilters";
import {
  MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING,
  SUGGESTIONS_USERCHECK_LIMIT,
} from "@/lib/utils/constants";

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
 * Get a list of suggested user profiles based on user preferences
 *
 * SUGGESTION LOGIC (PRIORITY ORDER):
 * 1. PRIMARY APPROACH: User Preferences Algorithm (Traditional Matching)
 *    - Always used FIRST when user has ANY preferences set
 *    - Only falls back to smart matching if traditional matching finds no results
 *
 * 2. SECONDARY APPROACH: Smart Matching Algorithm
 *    - Only used when user has NO preferences set
 *    - Uses most frequent tags from visited creators
 *
 * 3. FINAL FALLBACK: Show any creators with profile images and tags
 *    - Only used when both approaches above fail to find matches
 *
 * TRADITIONAL MATCHING (USER PREFERENCES) - PRIMARY APPROACH:
 * - Uses user's set preferences: preferAge, hairColor, bodyType
 * - Matches creators based on these explicit preferences
 * - This is always the PRIMARY method when any preferences exist
 *
 * SMART MATCHING (MOST FREQUENT TAGS) - SECONDARY APPROACH:
 * - Only used when user has NO explicit preferences set
 * - Gets the most frequent tag from each category in fan's lastVisitedCreatorsTags
 * - Gets the most frequent tag from each category in creator's lastUploadedCreatorTags
 * - Matches creators whose most frequent tags match the fan's most frequent tags
 * - Uses exact matching for the top 1 most frequent tag per category
 * - Includes profile attribute fallback for creators without uploaded tags
 *
 * @param {number} limit - Number of users to return
 * @param {boolean} showPaidOnly - Filter for paid creators only (default: true)
 * @param {number} skip - Number of users to skip for pagination/refresh (default: 0)
 * @returns {Object} - Object with users array and metadata about approach used
 */
export const getSuggestedUsers = async (
  limit = 15,
  showPaidOnly = true,
  skip = 0
) => {
  try {
    // Get current user to check preferences
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return { users: [], approach: "none", nameFilterFallback: false };
    }

    // Initialize base filters
    const baseFilters = {
      // Only get users with profile images
      profileImage: { $ne: "" },
    };

    // Create price filter
    const priceFilter = createPriceFilter(showPaidOnly);

    // Add creator name filter if user has set a preference
    const creatorNameFilter = createCreatorNameFilter(
      mongoUser?.preferCreatorName
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

    // Only apply preference filtering for 'fan' profiles
    if (mongoUser?.profileType === "fan") {
      let traditionalMatchingAttempted = false;
      let traditionalMatchingSuccessful = false;
      let smartMatchingAttempted = false;
      let smartMatchingSuccessful = false;

      // Check if user has set preferences for traditional matching using the reusable function
      const userHasPreferences = hasUserPreferences(mongoUser);

      console.log("🔍 User preferences analysis:");
      console.log("  preferAge:", mongoUser.preferAge);
      console.log("  preferRaceEthnicity:", mongoUser.preferRaceEthnicity);
      console.log("  preferHairColor:", mongoUser.preferHairColor);
      console.log("  preferBodyType:", mongoUser.preferBodyType);
      console.log("  preferGender:", mongoUser.preferGender);
      console.log("  preferCreatorName:", mongoUser.preferCreatorName);
      console.log("  userHasPreferences:", userHasPreferences);
      console.log("  profileType:", mongoUser.profileType);
      console.log("  showPaidOnly:", showPaidOnly);

      // STEP 1: PRIMARY APPROACH - Always try traditional matching FIRST if user has ANY preferences
      if (userHasPreferences) {
        traditionalMatchingAttempted = true;

        console.log("🎯 PRIMARY APPROACH: Traditional Matching Debug:");
        console.log("User preferences:", {
          preferAge: mongoUser.preferAge,
          preferRaceEthnicity: mongoUser.preferRaceEthnicity,
          preferHairColor: mongoUser.preferHairColor,
          preferBodyType: mongoUser.preferBodyType,
          preferGender: mongoUser.preferGender,
        });

        // Build base query for creators with price filter already included
        const preferenceFilters = {
          ...filters, // Include base filters (including price filter)
          profileType: "creator", // Only suggest creators to fans
        };

        // Age preference - use only if the fan has set a preferred age
        if (mongoUser?.preferAge) {
          const ageMin = Math.max(18, Number(mongoUser.preferAge) - 5);
          const ageMax = Number(mongoUser.preferAge) + 5;
          preferenceFilters.age = { $gte: ageMin, $lte: ageMax };
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
          preferenceFilters._id = {
            ...preferenceFilters._id,
            $nin: [...(preferenceFilters._id?.$nin || []), ...subscribedToIds],
          };
        }

        // Get ALL creators with price filter applied at database level
        const allCreators = await getAll({
          col: "users",
          data: preferenceFilters,
          limit: SUGGESTIONS_USERCHECK_LIMIT, // Get more to filter through
          skip: skip, // Add skip for pagination/refresh
        });

        console.log(
          "📊 Found",
          allCreators.length,
          "total creators for traditional matching (after price filter)"
        );

        // Filter creators that have at least one tag
        const creatorsWithTags = allCreators.filter(hasAnyUploadedTags);

        console.log(
          "📊 Found",
          creatorsWithTags.length,
          "creators with tags out of",
          allCreators.length,
          "total creators"
        );

        // Debug: Show first few creators and their tags
        if (creatorsWithTags.length > 0) {
          console.log("🔍 Sample creators with tags:");
          creatorsWithTags.slice(0, 3).forEach((creator, index) => {
            const creatorMostFrequentTags = getMostFrequentCreatorTags(
              creator.lastUploadedCreatorTags
            );
            console.log(`  Creator ${index + 1}: ${creator.name}`);
            console.log(
              `    lastUploadedCreatorTags:`,
              creator.lastUploadedCreatorTags
            );
            console.log(`    Most frequent tags:`, creatorMostFrequentTags);
            console.log(
              `    Profile attributes: hairColor=${creator.hairColor}, bodyType=${creator.bodyType}`
            );
          });
        }

        // Now filter by user preferences using lastUploadedCreatorTags
        const matchingCreators = [];

        for (const creator of creatorsWithTags) {
          // Skip if already subscribed
          if (subscribedToIds.includes(creator._id.toString())) {
            continue;
          }

          // Skip if in hidden suggestions
          if (mongoUser.hiddenSuggestions?.includes(creator._id.toString())) {
            continue;
          }

          let isMatch = true; // Start with true, must prove mismatch to exclude

          // Get creator's most frequent tags
          const creatorMostFrequentTags = getMostFrequentCreatorTags(
            creator.lastUploadedCreatorTags
          );

          console.log(
            `🎯 Traditional matching - checking creator ${creator.name}:`
          );
          console.log(
            "  Creator's most frequent tags:",
            creatorMostFrequentTags
          );
          console.log("  User preferences:", {
            preferAge: mongoUser.preferAge,
            preferRaceEthnicity: mongoUser.preferRaceEthnicity,
            preferHairColor: mongoUser.preferHairColor,
            preferBodyType: mongoUser.preferBodyType,
            preferGender: mongoUser.preferGender,
          });

          // Check age preference using range matching
          if (mongoUser?.preferAge) {
            if (
              !creatorMostFrequentTags.age ||
              !doesAgeMatch(creatorMostFrequentTags.age, mongoUser.preferAge)
            ) {
              isMatch = false;
              console.log(
                "  ❌ Age mismatch:",
                mongoUser.preferAge,
                "vs",
                creatorMostFrequentTags.age
              );
            } else {
              console.log("  ✅ Age match:", mongoUser.preferAge);
            }
          } else {
            console.log("  ⚪ Age preference not set");
          }

          // Check race/ethnicity preference
          if (
            mongoUser?.preferRaceEthnicity &&
            !["any", "other"].includes(
              mongoUser.preferRaceEthnicity.toLowerCase()
            )
          ) {
            if (
              !creatorMostFrequentTags.raceEthnicity ||
              mongoUser.preferRaceEthnicity !==
                creatorMostFrequentTags.raceEthnicity
            ) {
              isMatch = false;
              console.log(
                "  ❌ Race/ethnicity mismatch:",
                mongoUser.preferRaceEthnicity,
                "vs",
                creatorMostFrequentTags.raceEthnicity
              );
            } else {
              console.log(
                "  ✅ Race/ethnicity match:",
                mongoUser.preferRaceEthnicity
              );
            }
          } else {
            console.log(
              "  ⚪ Race/ethnicity preference not set or is 'any'/'other'"
            );
          }

          // Check hair color preference
          if (
            mongoUser?.preferHairColor &&
            !["any", "other"].includes(mongoUser.preferHairColor.toLowerCase())
          ) {
            if (
              !creatorMostFrequentTags.hairColor ||
              mongoUser.preferHairColor !== creatorMostFrequentTags.hairColor
            ) {
              isMatch = false;
              console.log(
                "  ❌ Hair color mismatch:",
                mongoUser.preferHairColor,
                "vs",
                creatorMostFrequentTags.hairColor
              );
            } else {
              console.log("  ✅ Hair color match:", mongoUser.preferHairColor);
            }
          } else {
            console.log(
              "  ⚪ Hair color preference not set or is 'any'/'other'"
            );
          }

          // Check body type preference
          if (
            mongoUser?.preferBodyType &&
            !["any", "other"].includes(mongoUser.preferBodyType.toLowerCase())
          ) {
            if (
              !creatorMostFrequentTags.bodyType ||
              mongoUser.preferBodyType !== creatorMostFrequentTags.bodyType
            ) {
              isMatch = false;
              console.log(
                "  ❌ Body type mismatch:",
                mongoUser.preferBodyType,
                "vs",
                creatorMostFrequentTags.bodyType
              );
            } else {
              console.log("  ✅ Body type match:", mongoUser.preferBodyType);
            }
          } else {
            console.log(
              "  ⚪ Body type preference not set or is 'any'/'other'"
            );
          }

          // Check gender preference
          if (
            mongoUser?.preferGender &&
            !["any", "other"].includes(mongoUser.preferGender.toLowerCase())
          ) {
            if (
              !creatorMostFrequentTags.gender ||
              mongoUser.preferGender !== creatorMostFrequentTags.gender
            ) {
              isMatch = false;
              console.log(
                "  ❌ Gender mismatch:",
                mongoUser.preferGender,
                "vs",
                creatorMostFrequentTags.gender
              );
            } else {
              console.log("  ✅ Gender match:", mongoUser.preferGender);
            }
          } else {
            console.log("  ⚪ Gender preference not set or is 'any'/'other'");
          }

          // Only add creator if they matched ALL user preferences
          if (isMatch) {
            matchingCreators.push(creator);
            console.log("  🎉 Creator matches user preferences!");
          }
        }

        console.log(
          "🎯 Traditional matching found",
          matchingCreators.length,
          "matching creators"
        );

        if (matchingCreators.length > 0) {
          traditionalMatchingSuccessful = true;

          // Limit results (price filter already applied at database level)
          const limitedResults = matchingCreators.slice(0, limit);

          return {
            users: limitedResults.map((user) => ({
              _id: user._id?.toString() || user._id,
              name: user.name || "",
              username: user.name?.toLowerCase().replace(/\s+/g, "") || "",
              profileImage: user.profileImage || "",
              coverImage: user.coverImage || "",
              isAvailable: Boolean(user.isAvailable),
              subscriptionPrice: user.subscriptionPrice || 0,
              age: user.age || null,
              hairColor: user.hairColor || "",
              bodyType: user.bodyType || "",
              raceEthnicity: user.raceEthnicity || "",
              lastUploadedCreatorTags: user.lastUploadedCreatorTags || null,
            })),
            approach: "traditional",
            nameFilterFallback: false,
          };
        } else {
          console.log(
            "🎯 Traditional matching found 0 results, checking if fallback due to creator name filter is needed"
          );

          // Check if we should fallback due to creator name filtering
          if (
            shouldFallbackDueToCreatorName(
              mongoUser,
              matchingCreators,
              traditionalMatchingAttempted
            )
          ) {
            console.log(
              "🔄 Creator name filter found no results, falling back to STEP 3 (final fallback) without name filter"
            );

            // Retry without creator name filter - go directly to final fallback
            const fallbackBaseFilters = {
              // Only get users with profile images
              profileImage: { $ne: "" },
              profileType: "creator",
            };

            const fallbackPriceFilter = createPriceFilter(showPaidOnly);

            // Combine filters without creator name filter
            const fallbackFilters = combineFilters(
              fallbackBaseFilters,
              fallbackPriceFilter
            );

            // If user has hidden suggestions, exclude them
            if (
              mongoUser?.hiddenSuggestions &&
              mongoUser.hiddenSuggestions.length > 0
            ) {
              fallbackFilters._id = { $nin: mongoUser.hiddenSuggestions };
            }

            // Get subscriptions to exclude
            const subscriptions = await getAll({
              col: "subscriptions",
              data: {
                createdBy: mongoUser._id,
                active: true,
              },
            });

            const subscribedToIds = subscriptions.map(
              (sub) => sub.subscribedTo
            );

            if (subscribedToIds.length > 0) {
              fallbackFilters._id = {
                ...fallbackFilters._id,
                $nin: [
                  ...(fallbackFilters._id?.$nin || []),
                  ...subscribedToIds,
                ],
              };
            }

            const allFallbackUsers = await getAll({
              col: "users",
              data: fallbackFilters,
              limit,
              skip: skip,
              sort: { _id: 1 },
            });

            // Filter to only include creators with at least one tag
            const fallbackUsers = allFallbackUsers.filter(hasAnyUploadedTags);

            console.log(
              "🔄 Creator name fallback found",
              fallbackUsers.length,
              "users with tags out of",
              allFallbackUsers.length,
              "total users (after price filter)"
            );

            // Limit results
            const limitedFallbackUsers = fallbackUsers.slice(0, limit);

            return {
              users: limitedFallbackUsers.map((user) => ({
                _id: user._id?.toString() || user._id,
                name: user.name || "",
                username: user.name?.toLowerCase().replace(/\s+/g, "") || "",
                profileImage: user.profileImage || "",
                coverImage: user.coverImage || "",
                isAvailable: Boolean(user.isAvailable),
                subscriptionPrice: user.subscriptionPrice || 0,
                age: user.age || null,
                hairColor: user.hairColor || "",
                bodyType: user.bodyType || "",
                raceEthnicity: user.raceEthnicity || "",
                lastUploadedCreatorTags: user.lastUploadedCreatorTags || null,
              })),
              approach: "fallback",
              nameFilterFallback: true,
            };
          } else {
            console.log(
              "🎯 Traditional matching found 0 results, but user has preferences - will NOT fall back to smart matching"
            );
          }
        }
      }

      // STEP 2: SECONDARY APPROACH - Only try smart matching if user has NO preferences
      // If user has preferences, we should NEVER fall back to smart matching
      if (userHasPreferences) {
        console.log(
          "🚫 User has preferences - skipping smart matching entirely"
        );
      }

      if (
        !userHasPreferences &&
        (!traditionalMatchingAttempted || !traditionalMatchingSuccessful)
      ) {
        // Check if user has lastVisitedCreatorsTags for smart matching
        const hasVisitedCreatorsTags =
          mongoUser?.lastVisitedCreatorsTags &&
          ((mongoUser.lastVisitedCreatorsTags.raceEthnicity &&
            mongoUser.lastVisitedCreatorsTags.raceEthnicity.length >=
              MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
            (mongoUser.lastVisitedCreatorsTags.hairColor &&
              mongoUser.lastVisitedCreatorsTags.hairColor.length >=
                MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
            (mongoUser.lastVisitedCreatorsTags.bodyType &&
              mongoUser.lastVisitedCreatorsTags.bodyType.length >=
                MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
            (mongoUser.lastVisitedCreatorsTags.gender &&
              mongoUser.lastVisitedCreatorsTags.gender.length >=
                MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
            (mongoUser.lastVisitedCreatorsTags.age &&
              mongoUser.lastVisitedCreatorsTags.age.length >=
                MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING));

        if (hasVisitedCreatorsTags) {
          smartMatchingAttempted = true;

          console.log("🔍 SECONDARY APPROACH: Smart Matching Debug:");
          if (!userHasPreferences) {
            console.log(
              "No user preferences found, using smart matching as fallback"
            );
          } else {
            console.log(
              "Traditional matching failed, trying smart matching as fallback"
            );
          }

          // Get the most frequent tags from fan's visited creator tags
          const fanMostFrequentTags = getMostFrequentCreatorTags(
            mongoUser.lastVisitedCreatorsTags
          );

          console.log("Fan's most frequent tags:", fanMostFrequentTags);

          // If we have valid most frequent tags, use smart matching
          if (
            fanMostFrequentTags.raceEthnicity ||
            fanMostFrequentTags.hairColor ||
            fanMostFrequentTags.bodyType ||
            fanMostFrequentTags.gender ||
            fanMostFrequentTags.age
          ) {
            // Get ALL creators with price filter applied at database level
            const allCreators = await getAll({
              col: "users",
              data: {
                ...filters,
                profileType: "creator",
              },
              limit: SUGGESTIONS_USERCHECK_LIMIT, // Get more to filter through
              skip: skip, // Add skip for pagination/refresh
            });

            console.log(
              "📊 Found",
              allCreators.length,
              "total creators to analyze (after price filter)"
            );

            // Get subscriptions to exclude
            const subscriptions = await getAll({
              col: "subscriptions",
              data: {
                createdBy: mongoUser._id,
                active: true,
              },
            });

            const subscribedToIds = subscriptions.map((sub) =>
              sub.subscribedTo.toString()
            );

            // Filter creators by comparing most frequent tags
            const matchingCreators = [];

            // First, filter for creators with at least one tag
            const creatorsWithTags = allCreators.filter(hasAnyUploadedTags);

            console.log(
              "📊 Found",
              creatorsWithTags.length,
              "creators with at least one tag out of",
              allCreators.length,
              "total creators"
            );

            for (const creator of creatorsWithTags) {
              // Skip if already subscribed
              if (subscribedToIds.includes(creator._id.toString())) {
                continue;
              }

              // Skip if in hidden suggestions
              if (
                mongoUser.hiddenSuggestions?.includes(creator._id.toString())
              ) {
                continue;
              }

              let isMatch = false; // Start with false, must prove match

              // STRATEGY 1: Compare with creator's lastUploadedCreatorTags (most accurate)
              if (creator.lastUploadedCreatorTags) {
                const creatorMostFrequentTags = getMostFrequentCreatorTags(
                  creator.lastUploadedCreatorTags
                );

                console.log(`🎯 Comparing creator ${creator.name}:`);
                console.log(
                  "  Creator's uploaded tags most frequent:",
                  creatorMostFrequentTags
                );

                // Check ALL categories that fan has preferences for - EVERY ONE must match
                let allCategoriesMatch = true;
                let hasAnyComparison = false; // Track if we actually compared anything

                // Race/Ethnicity check
                if (fanMostFrequentTags.raceEthnicity) {
                  hasAnyComparison = true;
                  if (
                    !creatorMostFrequentTags.raceEthnicity ||
                    fanMostFrequentTags.raceEthnicity !==
                      creatorMostFrequentTags.raceEthnicity
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Race/ethnicity mismatch:",
                      fanMostFrequentTags.raceEthnicity,
                      "vs",
                      creatorMostFrequentTags.raceEthnicity
                    );
                  } else {
                    console.log(
                      "  ✅ Race/ethnicity match:",
                      fanMostFrequentTags.raceEthnicity
                    );
                  }
                }

                // Hair Color check
                if (fanMostFrequentTags.hairColor) {
                  hasAnyComparison = true;
                  if (
                    !creatorMostFrequentTags.hairColor ||
                    fanMostFrequentTags.hairColor !==
                      creatorMostFrequentTags.hairColor
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Hair color mismatch:",
                      fanMostFrequentTags.hairColor,
                      "vs",
                      creatorMostFrequentTags.hairColor
                    );
                  } else {
                    console.log(
                      "  ✅ Hair color match:",
                      fanMostFrequentTags.hairColor
                    );
                  }
                }

                // Body Type check
                if (fanMostFrequentTags.bodyType) {
                  hasAnyComparison = true;
                  if (
                    !creatorMostFrequentTags.bodyType ||
                    fanMostFrequentTags.bodyType !==
                      creatorMostFrequentTags.bodyType
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Body type mismatch:",
                      fanMostFrequentTags.bodyType,
                      "vs",
                      creatorMostFrequentTags.bodyType
                    );
                  } else {
                    console.log(
                      "  ✅ Body type match:",
                      fanMostFrequentTags.bodyType
                    );
                  }
                }

                // Gender check
                if (fanMostFrequentTags.gender) {
                  hasAnyComparison = true;
                  if (
                    !creatorMostFrequentTags.gender ||
                    fanMostFrequentTags.gender !==
                      creatorMostFrequentTags.gender
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Gender mismatch:",
                      fanMostFrequentTags.gender,
                      "vs",
                      creatorMostFrequentTags.gender
                    );
                  } else {
                    console.log(
                      "  ✅ Gender match:",
                      fanMostFrequentTags.gender
                    );
                  }
                }

                // Age check using range matching
                if (fanMostFrequentTags.age) {
                  hasAnyComparison = true;
                  if (
                    !creatorMostFrequentTags.age ||
                    !doesAgeMatch(
                      creatorMostFrequentTags.age,
                      fanMostFrequentTags.age
                    )
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Age mismatch:",
                      fanMostFrequentTags.age,
                      "vs",
                      creatorMostFrequentTags.age
                    );
                  } else {
                    console.log("  ✅ Age match:", fanMostFrequentTags.age);
                  }
                }

                // If we compared something AND all categories matched, this creator is a match
                if (hasAnyComparison && allCategoriesMatch) {
                  isMatch = true;
                  console.log("  🎉 Creator matches via uploaded tags!");
                }
              }

              // STRATEGY 2: Fallback to profile attributes if no uploaded tags or no match
              if (!isMatch) {
                console.log(
                  `🔄 Fallback check for creator ${creator.name} via profile attributes:`
                );

                let allCategoriesMatch = true;
                let hasAnyComparison = false;

                // Race/Ethnicity check
                if (fanMostFrequentTags.raceEthnicity) {
                  hasAnyComparison = true;
                  if (
                    !creator.raceEthnicity ||
                    fanMostFrequentTags.raceEthnicity !== creator.raceEthnicity
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Profile race/ethnicity mismatch:",
                      fanMostFrequentTags.raceEthnicity,
                      "vs",
                      creator.raceEthnicity
                    );
                  } else {
                    console.log(
                      "  ✅ Profile race/ethnicity match:",
                      fanMostFrequentTags.raceEthnicity
                    );
                  }
                }

                // Hair Color check
                if (fanMostFrequentTags.hairColor) {
                  hasAnyComparison = true;
                  if (
                    !creator.hairColor ||
                    fanMostFrequentTags.hairColor !== creator.hairColor
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Profile hair color mismatch:",
                      fanMostFrequentTags.hairColor,
                      "vs",
                      creator.hairColor
                    );
                  } else {
                    console.log(
                      "  ✅ Profile hair color match:",
                      fanMostFrequentTags.hairColor
                    );
                  }
                }

                // Body Type check
                if (fanMostFrequentTags.bodyType) {
                  hasAnyComparison = true;
                  if (
                    !creator.bodyType ||
                    fanMostFrequentTags.bodyType !== creator.bodyType
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Profile body type mismatch:",
                      fanMostFrequentTags.bodyType,
                      "vs",
                      creator.bodyType
                    );
                  } else {
                    console.log(
                      "  ✅ Profile body type match:",
                      fanMostFrequentTags.bodyType
                    );
                  }
                }

                // Gender check - even in profile fallback, we should check if creator has gender in their uploaded tags
                if (fanMostFrequentTags.gender) {
                  hasAnyComparison = true;
                  // For gender, we need to check the creator's most frequent uploaded gender tag, not profile
                  const creatorMostFrequentTags = getMostFrequentCreatorTags(
                    creator.lastUploadedCreatorTags
                  );
                  if (
                    !creatorMostFrequentTags.gender ||
                    fanMostFrequentTags.gender !==
                      creatorMostFrequentTags.gender
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Profile fallback gender mismatch:",
                      fanMostFrequentTags.gender,
                      "vs",
                      creatorMostFrequentTags.gender
                    );
                  } else {
                    console.log(
                      "  ✅ Profile fallback gender match:",
                      fanMostFrequentTags.gender
                    );
                  }
                }

                // Age check using range matching (age is available in profile)
                if (fanMostFrequentTags.age) {
                  hasAnyComparison = true;
                  if (
                    !creator.age ||
                    !doesAgeMatch(creator.age, fanMostFrequentTags.age)
                  ) {
                    allCategoriesMatch = false;
                    console.log(
                      "  ❌ Profile age mismatch:",
                      fanMostFrequentTags.age,
                      "vs",
                      creator.age
                    );
                  } else {
                    console.log(
                      "  ✅ Profile age match:",
                      fanMostFrequentTags.age
                    );
                  }
                }

                // If we compared something AND all categories matched, this creator is a match
                if (hasAnyComparison && allCategoriesMatch) {
                  isMatch = true;
                  console.log("  🎉 Creator matches via profile attributes!");
                }
              }

              // Only add creator if they matched ALL required categories
              if (isMatch) {
                matchingCreators.push(creator);
              }
            }

            console.log(
              "📊 Smart matching found",
              matchingCreators.length,
              "matching creators"
            );

            if (matchingCreators.length > 0) {
              smartMatchingSuccessful = true;

              // Limit results (price filter already applied at database level)
              const limitedResults = matchingCreators.slice(0, limit);

              return {
                users: limitedResults.map((user) => ({
                  _id: user._id?.toString() || user._id,
                  name: user.name || "",
                  username: user.name?.toLowerCase().replace(/\s+/g, "") || "",
                  profileImage: user.profileImage || "",
                  coverImage: user.coverImage || "",
                  isAvailable: Boolean(user.isAvailable),
                  subscriptionPrice: user.subscriptionPrice || 0,
                  age: user.age || null,
                  hairColor: user.hairColor || "",
                  bodyType: user.bodyType || "",
                  raceEthnicity: user.raceEthnicity || "",
                  lastUploadedCreatorTags: user.lastUploadedCreatorTags || null,
                })),
                approach: "smart",
                nameFilterFallback: false,
              };
            }
          }
        }
      }

      // STEP 3: FINAL FALLBACK - show any creators with profile images AND at least one tag
      console.log(
        "🆘 FINAL FALLBACK: Using general matching - showing any creators with tags"
      );
      console.log(
        "Traditional matching attempted:",
        traditionalMatchingAttempted
      );
      console.log(
        "Traditional matching successful:",
        traditionalMatchingSuccessful
      );
      console.log("Smart matching attempted:", smartMatchingAttempted);
      console.log("Smart matching successful:", smartMatchingSuccessful);
      console.log(
        "User displayAllUsersIfNoMatchFoundForSuggestions setting:",
        mongoUser.displayAllUsersIfNoMatchFoundForSuggestions
      );

      // Check if user wants to see all creators when no matches are found
      if (!mongoUser.displayAllUsersIfNoMatchFoundForSuggestions) {
        console.log(
          "🚫 User has disabled showing all creators when no matches found. Returning empty array."
        );
        return { users: [], approach: "none", nameFilterFallback: false };
      }

      const fallbackFilters = {
        ...filters, // Include base filters (including price filter)
        profileType: "creator",
      };

      // Get subscriptions to exclude
      const subscriptions = await getAll({
        col: "subscriptions",
        data: {
          createdBy: mongoUser._id,
          active: true,
        },
      });

      const subscribedToIds = subscriptions.map((sub) => sub.subscribedTo);

      if (subscribedToIds.length > 0) {
        fallbackFilters._id = {
          ...fallbackFilters._id,
          $nin: [...(fallbackFilters._id?.$nin || []), ...subscribedToIds],
        };
      }

      const allFallbackUsers = await getAll({
        col: "users",
        data: fallbackFilters,
        limit,
        skip: skip, // Add skip for pagination/refresh
        sort: { _id: 1 },
      });

      // Filter to only include creators with at least one tag
      const fallbackUsers = allFallbackUsers.filter(hasAnyUploadedTags);

      console.log(
        "🆘 Fallback found",
        fallbackUsers.length,
        "users with tags out of",
        allFallbackUsers.length,
        "total users (after price filter)"
      );

      // Limit results (price filter already applied at database level)
      const limitedFallbackUsers = fallbackUsers.slice(0, limit);

      return {
        users: limitedFallbackUsers.map((user) => ({
          _id: user._id?.toString() || user._id,
          name: user.name || "",
          username: user.name?.toLowerCase().replace(/\s+/g, "") || "",
          profileImage: user.profileImage || "",
          coverImage: user.coverImage || "",
          isAvailable: Boolean(user.isAvailable),
          subscriptionPrice: user.subscriptionPrice || 0,
          age: user.age || null,
          hairColor: user.hairColor || "",
          bodyType: user.bodyType || "",
          raceEthnicity: user.raceEthnicity || "",
          lastUploadedCreatorTags: user.lastUploadedCreatorTags || null,
        })),
        approach: "fallback",
        nameFilterFallback: false,
      };
    }

    // For non-fan users, get creators with profile images AND at least one tag
    const allCreatorsFilters = {
      ...filters, // Include base filters (including price filter)
      profileType: "creator",
    };

    // Check if user wants to see all creators (for non-fan users, default to true if not set)
    const shouldShowAllCreators =
      mongoUser.displayAllUsersIfNoMatchFoundForSuggestions !== false;

    if (!shouldShowAllCreators) {
      console.log(
        "🚫 Non-fan user has disabled showing all creators. Returning empty array."
      );
      return { users: [], approach: "none", nameFilterFallback: false };
    }

    const allUsers = await getAll({
      col: "users",
      data: allCreatorsFilters,
      limit,
      skip: skip, // Add skip for pagination/refresh
      sort: { _id: 1 },
    });

    // Filter to only include creators with at least one tag
    const usersWithTags = allUsers.filter(hasAnyUploadedTags);

    console.log(
      "💰 Non-fan users found:",
      usersWithTags.length,
      "creators with tags (after price filter)"
    );

    // Limit results (price filter already applied at database level)
    const limitedUsers = usersWithTags.slice(0, limit);

    return {
      users: limitedUsers.map((user) => ({
        _id: user._id?.toString() || user._id,
        name: user.name || "",
        username: user.name?.toLowerCase().replace(/\s+/g, "") || "",
        profileImage: user.profileImage || "",
        coverImage: user.coverImage || "",
        isAvailable: Boolean(user.isAvailable),
        subscriptionPrice: user.subscriptionPrice || 0,
        age: user.age || null,
        hairColor: user.hairColor || "",
        bodyType: user.bodyType || "",
        raceEthnicity: user.raceEthnicity || "",
        lastUploadedCreatorTags: user.lastUploadedCreatorTags || null,
      })),
      approach: "general",
      nameFilterFallback: false,
    };
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return { users: [], approach: "error", nameFilterFallback: false };
  }
};
