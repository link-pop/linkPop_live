// app/api/nsfw-check/route.js
// NSFW content detection using SightEngine API

import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import {
  EROTICA_THRESHOLD,
  WEAPONS_THRESHOLD,
  ALCOHOL_THRESHOLD,
  DRUGS_THRESHOLD,
  OFFENSIVE_THRESHOLD,
} from "@/lib/utils/constants";

/**
 * API route to check if an image contains NSFW content using SightEngine
 * Accepts image as base64 or URL
 * Now supports custom thresholds for moderation
 * Automatically rotates through multiple API keys when rate limits are reached
 * Handles cropped images with adjusted thresholds
 */
export async function POST(request) {
  try {
    // Check if user is admin
    const { isAdmin } = await getMongoUser();

    // If not admin, redirect to home page
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { imageUrl, imageBase64, customThresholds, isCroppedImage } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: "Either imageUrl or imageBase64 is required" },
        { status: 400 }
      );
    }

    // Default thresholds for content detection
    const DEFAULT_THRESHOLDS = {
      eroticaThreshold: EROTICA_THRESHOLD,
      weaponsThreshold: WEAPONS_THRESHOLD,
      alcoholThreshold: ALCOHOL_THRESHOLD,
      drugsThreshold: DRUGS_THRESHOLD,
      offensiveThreshold: OFFENSIVE_THRESHOLD,
    };

    // Apply custom thresholds if provided, otherwise use defaults
    let thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...(customThresholds || {}),
    };

    // If this is a cropped image, we can be more lenient with thresholds
    // since the user has specifically selected this portion of the image
    if (isCroppedImage) {
      console.log("Applying adjusted thresholds for cropped image");
      // Increase thresholds for cropped images
      thresholds = {
        ...thresholds,
        eroticaThreshold: Math.min(thresholds.eroticaThreshold + 0.15, 0.95),
        weaponsThreshold: Math.min(thresholds.weaponsThreshold + 0.1, 0.9),
        alcoholThreshold: Math.min(thresholds.alcoholThreshold + 0.1, 0.9),
        drugsThreshold: Math.min(thresholds.drugsThreshold + 0.1, 0.9),
        offensiveThreshold: Math.min(thresholds.offensiveThreshold + 0.1, 0.9),
      };
    }

    // Try multiple API keys in sequence if rate limits are hit
    const MAX_API_ATTEMPTS = 50; // Try up to 50 different API keys
    let responseData;
    let apiAttempt = 0;
    let lastError;

    while (apiAttempt < MAX_API_ATTEMPTS && !responseData) {
      apiAttempt++;

      // Get the API credentials based on the current attempt
      const apiUser = process.env[`SIGHTENGINE_API_USER_${apiAttempt}`];
      const apiSecret = process.env[`SIGHTENGINE_API_SECRET_${apiAttempt}`];

      if (!apiUser || !apiSecret) {
        console.warn(
          `API credentials not configured for attempt ${apiAttempt}`
        );
        continue; // Try the next set of credentials
      }

      try {
        // Process the image with current API key
        if (imageUrl) {
          // For URL-based image checks
          const response = await axios.get(
            "https://api.sightengine.com/1.0/check.json",
            {
              params: {
                url: imageUrl,
                models:
                  "nudity-2.1,weapon,alcohol,recreational_drug,offensive-2.0",
                api_user: apiUser,
                api_secret: apiSecret,
              },
            }
          );
          responseData = response.data;
        } else if (imageBase64) {
          // For base64 image data
          const base64Data = imageBase64.includes("base64,")
            ? imageBase64.split("base64,")[1]
            : imageBase64;

          const buffer = Buffer.from(base64Data, "base64");
          const data = new FormData();

          data.append("media", buffer, {
            filename: "image.jpg",
            contentType: "image/jpeg",
          });

          data.append(
            "models",
            "nudity-2.1,weapon,alcohol,recreational_drug,offensive-2.0"
          );
          data.append("api_user", apiUser);
          data.append("api_secret", apiSecret);

          const response = await axios({
            method: "post",
            url: "https://api.sightengine.com/1.0/check.json",
            data: data,
            headers: data.getHeaders(),
          });

          responseData = response.data;
        }

        // If we got here, we have a successful response
        console.log(`Successfully used API key ${apiAttempt}`);
      } catch (error) {
        lastError = error;

        // Check if this is a rate limit error (usually 429 Too Many Requests)
        const isRateLimit =
          error.response?.status === 429 ||
          error.response?.data?.error?.message?.includes("limit") ||
          error.message?.includes("limit");

        if (isRateLimit) {
          console.warn(
            `API key ${apiAttempt} rate limited, trying next key...`
          );
          // Continue to the next API key
        } else {
          // This is not a rate limit error, so no need to try other keys
          console.error(
            "SightEngine API error:",
            error.response?.data || error.message
          );
          break;
        }
      }
    }

    // If we couldn't get a response with any API key
    if (!responseData) {
      console.error("All API keys failed or reached rate limits");
      return NextResponse.json(
        {
          error:
            lastError?.response?.data?.error?.message ||
            "Error checking image content - API limits reached",
        },
        { status: lastError?.response?.status || 500 }
      );
    }

    // Process the API response using the v2.1 nudity model
    // Extract all relevant scores from the new nudity model

    // Intensity classes - only keeping erotica from the nudity detection
    const sexualActivityScore = responseData.nudity?.sexual_activity || 0;
    const sexualDisplayScore = responseData.nudity?.sexual_display || 0;
    const eroticaScore = responseData.nudity?.erotica || 0;
    const verySuggestiveScore = responseData.nudity?.very_suggestive || 0;

    // Suggestive classes (store all 19)
    const suggestiveClasses = responseData.nudity?.suggestive_classes || {};

    // Context classes (store all 3)
    const contextClasses = responseData.nudity?.context || {};

    // For legacy compatibility - still calculate nudityScore but don't use it for safety check
    const nudityScore = Math.max(
      sexualActivityScore,
      sexualDisplayScore,
      eroticaScore,
      verySuggestiveScore
    );

    // Additional checks
    const weaponsScore =
      (responseData.weapon?.classes?.firearm || 0) +
      (responseData.weapon?.classes?.knife || 0);
    const alcoholScore = responseData.alcohol?.prob || 0;
    const drugsScore = responseData.recreational_drug?.prob || 0;
    const offensiveScore = Math.max(
      responseData.offensive?.nazi || 0,
      responseData.offensive?.supremacist || 0,
      responseData.offensive?.terrorist || 0,
      responseData.offensive?.middle_finger || 0
    );

    // Use the provided or default thresholds to determine if the image is safe
    // No longer checking nudityScore, just the specific categories requested
    const isSafe =
      eroticaScore < thresholds.eroticaThreshold &&
      weaponsScore < thresholds.weaponsThreshold &&
      alcoholScore < thresholds.alcoholThreshold &&
      drugsScore < thresholds.drugsThreshold &&
      offensiveScore < thresholds.offensiveThreshold;

    return NextResponse.json({
      isSafe,
      // Legacy score for backward compatibility only - not used for safety check
      nudityScore,

      // Intensity classes - only keeping erotica from user request
      eroticaScore,

      // Suggestive classes
      suggestiveClasses,

      // Context classes
      contextClasses,

      // Additional scores
      weaponsScore,
      alcoholScore,
      drugsScore,
      offensiveScore,

      thresholdsUsed: thresholds,
      rawResponse: responseData,
    });
  } catch (error) {
    console.error("NSFW check error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
