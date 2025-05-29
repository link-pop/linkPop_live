"use server";

import { getAll } from "./crud";
import {
  RACE_ETHNICITY_TAGS,
  HAIR_COLOR_TAGS,
  BODY_TYPE_TAGS,
} from "@/lib/constants/creatorTags";

/**
 * Get creator tags from a user's most recent uploads
 * @param {string} userId - The user ID to get creator tags for
 * @param {number} limit - Number of recent attachments to analyze (default: 10)
 * @returns {Promise<Object>} Creator tags object with raceEthnicity, hairColor, bodyType arrays
 */
export const getUserCreatorTags = async (userId, limit = 10) => {
  if (!userId) {
    return { error: "User ID is required" };
  }

  try {
    // Get user's most recent attachments from feeds
    const attachments = await getAll({
      col: "attachments",
      data: {
        createdBy: userId,
        uploadedFrom: "feeds",
      },
      limit,
      sort: { createdAt: -1 }, // Most recent first
    });

    if (!attachments || attachments.length === 0) {
      return {
        raceEthnicity: [],
        hairColor: [],
        bodyType: [],
      };
    }

    // Extract and aggregate creator tags from attachments
    const aggregatedTags = {
      raceEthnicity: [],
      hairColor: [],
      bodyType: [],
    };

    // Count frequency of each tag type
    const tagCounts = {
      raceEthnicity: {},
      hairColor: {},
      bodyType: {},
    };

    attachments.forEach((attachment) => {
      // Check if attachment has tags (this would be from AI analysis)
      if (attachment.tags && Array.isArray(attachment.tags)) {
        attachment.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();

          // Race/Ethnicity detection using constants
          const matchedRace = RACE_ETHNICITY_TAGS.find((race) =>
            lowerTag.includes(race.toLowerCase())
          );
          if (matchedRace) {
            tagCounts.raceEthnicity[matchedRace] =
              (tagCounts.raceEthnicity[matchedRace] || 0) + 1;
          }

          // Hair color detection using constants
          const matchedHair = HAIR_COLOR_TAGS.find((hair) =>
            lowerTag.includes(hair.toLowerCase())
          );
          if (matchedHair) {
            tagCounts.hairColor[matchedHair] =
              (tagCounts.hairColor[matchedHair] || 0) + 1;
          }

          // Body type detection using constants
          const matchedBody = BODY_TYPE_TAGS.find((body) =>
            lowerTag.includes(body.toLowerCase())
          );
          if (matchedBody) {
            tagCounts.bodyType[matchedBody] =
              (tagCounts.bodyType[matchedBody] || 0) + 1;
          }
        });
      }
    });

    // Convert counts to sorted arrays (most frequent first)
    Object.keys(tagCounts).forEach((category) => {
      const sortedTags = Object.entries(tagCounts[category])
        .sort(([, a], [, b]) => b - a) // Sort by count descending
        .map(([tag]) => tag)
        .slice(0, 3); // Take top 3 most frequent

      aggregatedTags[category] = sortedTags;
    });

    return aggregatedTags;
  } catch (error) {
    console.error("Error getting user creator tags:", error);
    return {
      raceEthnicity: [],
      hairColor: [],
      bodyType: [],
    };
  }
};
