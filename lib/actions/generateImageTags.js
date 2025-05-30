"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  RACE_ETHNICITY_TAGS,
  HAIR_COLOR_TAGS,
  BODY_TYPE_TAGS,
  GENDER_TAGS,
} from "@/lib/constants/creatorTags";

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

/**
 * Generates descriptive tags for images using Gemini AI
 * @param {string} base64Image - Base64-encoded image
 * @param {Object} options - Options for tag generation
 * @returns {Promise<Object>} Result object with generated tags and creator tags
 */
export async function generateImageTags(base64Image, options = {}) {
  if (!base64Image) {
    return { success: false, error: "Missing base64 image data" };
  }

  // Check if Gemini API key is available
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
    return {
      success: false,
      error: "Gemini API key not configured",
      tags: [],
      creatorTags: null,
    };
  }

  try {
    // Remove the base64 prefix if present
    const imageContent = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // Create a model instance with vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the image for processing
    const imagePart = {
      inlineData: {
        data: imageContent,
        mimeType: "image/jpeg", // Assuming JPEG, adjust as needed
      },
    };

    // Create a comprehensive prompt for tag generation using constants
    const tagGenerationPrompt = `
      You are an expert adult content analyzer. Analyze this image and generate two types of tags:

      1. GENERAL CONTENT TAGS (for search/filtering):
      Focus on explicit content categorization with high confidence only:
      
      EXPLICIT BODY PARTS & FEATURES (only if clearly visible):
      - Specific body parts (e.g., "boobs", "tits", "breasts", "ass", "butt", "pussy", "vagina", "penis", "cock", "dick", "balls", "clit", "nipples")
      - Body hair details (e.g., "hairy pussy", "shaved pussy", "hairy", "trimmed", "bush", "smooth", "shaved balls")
      - Breast details (e.g., "big tits", "small boobs", "natural tits", "fake tits", "pierced nipples", "perky tits")
      - Genital details (e.g., "tight pussy", "wet pussy", "big cock", "hard cock", "veiny cock", "dripping cum", "cumshot", "gaping pussy")
      
      SEXUAL ACTS & POSITIONS (only if clearly happening):
      - Sexual activities (e.g., "blowjob", "deepthroat", "handjob", "titjob", "footjob", "anal", "doggy", "missionary", "cowgirl", "reverse cowgirl", "69")
      - Oral activities (e.g., "sucking cock", "eating pussy", "cunnilingus", "fellatio", "rimming", "licking balls")
      - Penetration (e.g., "fucking", "penetration", "insertion", "riding", "double penetration")
      - Masturbation (e.g., "masturbating", "fingering", "touching herself", "jerking off", "dildo play", "vibrator", "butt plug")
      - Finishes (e.g., "creampie", "squirting", "cumshot", "facial")
      
      PEOPLE & PARTICIPANTS (count carefully):
      - Number and gender (e.g., "solo female", "solo male", "lesbian", "gay", "straight couple", "threesome", "orgy")
      - Physical attributes (e.g., "milf", "mature", "muscular", "fit", "pigtails", "ponytail")
      
      CLOTHING & NUDITY (only if certain):
      - Nudity level (e.g., "nude", "naked", "topless", "bottomless", "fully clothed")
      - Underwear/lingerie (e.g., "panties", "bra", "thong", "g-string", "lace", "lingerie")
      - Fetish wear (e.g., "latex", "leather", "corset", "high heels", "boots")
      
      SETTINGS & SCENARIOS:
      - Locations (e.g., "bedroom", "bathroom", "shower", "outdoor", "beach", "office", "car")
      - Scenarios (e.g., "pov", "amateur", "homemade", "professional", "webcam", "selfie", "mirror view")
      
      FETISHES & KINKS (only if clearly visible):
      - Fetish contexts (e.g., "bdsm", "bondage", "domination", "submission", "spanking", "roleplay", "feet", "foot fetish")

      2. CREATOR TAGS (for matching suggestions):
      Extract these specific attributes for creator matching:
      
      RACE/ETHNICITY (choose most accurate from these options):
      ${RACE_ETHNICITY_TAGS.map((tag) => `"${tag}"`).join(", ")}
      
      HAIR COLOR (natural or dyed from these options):
      ${HAIR_COLOR_TAGS.map((tag) => `"${tag}"`).join(", ")}
      
      BODY TYPE (be objective, choose from these options):
      ${BODY_TYPE_TAGS.map((tag) => `"${tag}"`).join(", ")}
      
      GENDER (identify the gender of the main person from these options):
      ${GENDER_TAGS.map((tag) => `"${tag}"`).join(", ")}

      IMPORTANT GUIDELINES:
      - BE CONFIDENT: Only include tags you are 95%+ certain about
      - NO SUBJECTIVE BEAUTY TAGS: Avoid "beautiful", "attractive", "sexy", "hot", "gorgeous", "ugly", "fat" etc.
      - COUNT CAREFULLY: Don't use "solo" if multiple people are visible
      - CLOTHING ACCURACY: Don't tag "topless" if person is clothed
      - EXPLICIT ONLY: Focus on explicit adult content, not suggestive poses
      - CREATOR TAGS: Always try to identify race/ethnicity, hair color, body type, and gender for the main person
      - USE EXACT VALUES: For creator tags, use ONLY the exact values listed above
      - DO NOT DETECT AGE: Age will be taken from user profile, not from image analysis

      Return in this exact JSON format:
      {
        "generalTags": ["tag1", "tag2", "tag3"],
        "creatorTags": {
          "raceEthnicity": ["race1"],
          "hairColor": ["color1"],
          "bodyType": ["type1"],
          "gender": ["gender1"]
        }
      }

      If you cannot confidently identify creator attributes, use empty arrays for those categories.
      Limit general tags to 20-25 most relevant and confident tags.
    `;

    // Generate content using the image and prompt
    const result = await model.generateContent([
      tagGenerationPrompt,
      imagePart,
    ]);
    const response = await result.response;
    const generatedText = response.text().trim();

    // Try to parse JSON response
    let parsedResponse;
    try {
      // Clean the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      // Fallback: try to extract tags from text
      const tags = generatedText
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0 && tag.length <= 30)
        .slice(0, 25);

      return {
        success: true,
        tags: tags,
        creatorTags: null,
        rawResponse: generatedText,
      };
    }

    // Validate and clean the parsed response
    const generalTags = Array.isArray(parsedResponse.generalTags)
      ? parsedResponse.generalTags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0 && tag.length <= 30)
          .slice(0, 25)
      : [];

    const creatorTags =
      parsedResponse.creatorTags &&
      typeof parsedResponse.creatorTags === "object"
        ? {
            raceEthnicity: Array.isArray(
              parsedResponse.creatorTags.raceEthnicity
            )
              ? parsedResponse.creatorTags.raceEthnicity.slice(0, 1) // Only take first/most confident
              : [],
            hairColor: Array.isArray(parsedResponse.creatorTags.hairColor)
              ? parsedResponse.creatorTags.hairColor.slice(0, 1)
              : [],
            bodyType: Array.isArray(parsedResponse.creatorTags.bodyType)
              ? parsedResponse.creatorTags.bodyType.slice(0, 1)
              : [],
            gender: Array.isArray(parsedResponse.creatorTags.gender)
              ? parsedResponse.creatorTags.gender.slice(0, 1)
              : [],
          }
        : null;

    // Validate that we got some meaningful tags
    if (generalTags.length === 0) {
      return {
        success: false,
        error: "No valid tags could be generated from the image",
      };
    }

    return {
      success: true,
      tags: generalTags,
      creatorTags: creatorTags,
      rawResponse: generatedText,
    };
  } catch (error) {
    console.error("Error generating image tags:", error);

    // Handle specific Gemini API errors
    if (error.message && error.message.includes("SAFETY")) {
      return {
        success: false,
        error: "Content safety filters prevented tag generation",
        tags: [],
        creatorTags: null,
      };
    }

    if (error.message && error.message.includes("QUOTA_EXCEEDED")) {
      return {
        success: false,
        error: "API quota exceeded for tag generation",
        tags: [],
        creatorTags: null,
      };
    }

    return {
      success: false,
      error: error.message || "Error generating tags for the image",
      tags: [],
      creatorTags: null,
    };
  }
}
