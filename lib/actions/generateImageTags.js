"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

/**
 * Generates descriptive tags for images using Gemini AI
 * @param {string} base64Image - Base64-encoded image
 * @param {Object} options - Options for tag generation
 * @returns {Promise<Object>} Result object with generated tags
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

    // Create a comprehensive prompt for tag generation
    const tagGenerationPrompt = `
      You are an expert adult content analyzer specializing in explicit content categorization for an adult platform.
      Analyze this image and generate direct, explicit tags that accurately describe what you see.
      
      Focus on these categories when applicable:
      
      EXPLICIT BODY PARTS & FEATURES:
      - Specific body parts (e.g., "boobs", "tits", "breasts", "ass", "butt", "pussy", "vagina", "penis", "cock", "dick", "balls", "clit", "nipples")
      - Body hair details (e.g., "hairy pussy", "shaved pussy", "hairy", "trimmed", "bush", "smooth", "shaved balls")
      - Breast details (e.g., "big tits", "small boobs", "natural tits", "fake tits", "pierced nipples", "perky tits", "saggy tits")
      - Genital details (e.g., "tight pussy", "wet pussy", "big cock", "hard cock", "veiny cock", "dripping cum", "cum on face", "cumshot", "gaping pussy", "open pussy")
      
      SEXUAL ACTS & POSITIONS:
      - Sexual activities (e.g., "blowjob", "deepthroat", "gagging", "handjob", "titjob", "footjob", "anal", "doggy", "missionary", "cowgirl", "reverse cowgirl", "spooning", "69", "standing sex", "shower sex")
      - Oral activities (e.g., "sucking cock", "eating pussy", "cunnilingus", "fellatio", "rimming", "licking balls")
      - Penetration (e.g., "fucking", "penetration", "insertion", "riding", "double penetration")
      - Masturbation (e.g., "masturbating", "fingering", "touching herself", "jerking off", "dildo play", "vibrator", "butt plug")
      - Finishes (e.g., "creampie", "squirting", "edging")
      
      PEOPLE & PARTICIPANTS:
      - Number and gender (e.g., "solo female", "solo male", "lesbian", "gay", "bi", "straight couple", "threesome", "orgy", "gangbang", "cuckold", "gloryhole")
      - Physical attributes (e.g., "blonde", "brunette", "redhead", "black hair", "dyed hair", "milf", "teen", "mature", "gilf", "granny", "cougar", "daddy", "twink", "bear", "femboy", "sissy", "trap", "bbw", "chubby", "thick", "skinny", "fit", "muscular", "curvy", "pigtails", "ponytail")
      - Ethnicity when relevant (e.g., "asian", "latina", "ebony", "white", "arab", "indian", "mixed race")
      
      CLOTHING & NUDITY:
      - Nudity level (e.g., "nude", "naked", "topless", "bottomless", "fully clothed", "see-through", "wet t-shirt", "wardrobe malfunction")
      - Underwear/lingerie (e.g., "panties", "bra", "thong", "g-string", "lace", "garter belt", "fishnet", "sheer", "lingerie")
      - Fetish wear (e.g., "latex", "leather", "corset", "bondage gear", "high heels", "boots", "stripper heels", "maid outfit", "schoolgirl outfit", "nurse outfit")
      
      SETTINGS & SCENARIOS:
      - Locations (e.g., "bedroom", "bathroom", "shower", "bathtub", "outdoor", "beach", "public", "office", "classroom", "locker room", "kitchen", "car", "hotel")
      - Scenarios (e.g., "pov", "amateur", "homemade", "professional", "webcam", "selfie", "mirror view", "behind the scenes", "casting couch", "fake agent", "reality porn")
      
      FETISHES & KINKS:
      - Fetish contexts (e.g., "bdsm", "bondage", "domination", "submission", "dominant", "submissive", "spanking", "whipping", "roleplay", "feet", "foot fetish", "cumplay", "facials", "cum in mouth", "cock worship", "ball worship", "fisting", "pegging", "humiliation", "degradation", "slapping", "choking", "gagged", "piss play", "watersports", "breath play", "sensory play", "latex fetish", "leather fetish", "smoking fetish", "pantyhose fetish", "public sex", "exhibitionism", "voyeur", "forced orgasm", "orgasm control", "anal training", "diaper play")
      
      MISC & ROLEPLAY:
      - Roleplay scenarios (e.g., "stepmom", "stepsister", "stepbrother", "boss", "secretary", "teacher", "student", "babysitter", "neighbor", "massage", "therapist")
      - Styles (e.g., "cosplay", "anime", "hentai", "cartoon", "virtual", "vr porn", "slow motion", "oil", "shower scene", "tan lines", "body paint", "tattoos", "piercings")
      
      IMPORTANT GUIDELINES:
      - Be explicit and direct - this is for adult content categorization
      - Use common adult industry terminology
      - Include 20-30 relevant tags
      - Prioritize the most sexually explicit and prominent features
      - Use lowercase for consistency
      - Separate tags with commas
      - Focus on what adult users would search for
      - Don't be clinical - use street/porn terminology
      
      Return ONLY a comma-separated list of explicit tags, nothing else.
      Example format: "blonde, big tits, blowjob, deepthroat, pov, amateur, bedroom, sucking cock, nude, solo female"
    `;

    // Generate content using the image and prompt
    const result = await model.generateContent([
      tagGenerationPrompt,
      imagePart,
    ]);
    const response = await result.response;
    const generatedText = response.text().trim();

    // Parse the tags from the response
    const tags = generatedText
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length <= 30) // Filter out empty or overly long tags
      .slice(0, 30); // Limit to 30 tags

    // Validate that we got some meaningful tags
    if (tags.length === 0) {
      return {
        success: false,
        error: "No valid tags could be generated from the image",
      };
    }

    return {
      success: true,
      tags: tags,
      rawResponse: generatedText,
    };
  } catch (error) {
    console.error("Error generating image tags:", error);

    // Handle specific Gemini API errors
    if (error.message && error.message.includes("SAFETY")) {
      return {
        success: false,
        error: "Content safety filters prevented tag generation",
        tags: [], // Return empty tags for safety-filtered content
      };
    }

    if (error.message && error.message.includes("QUOTA_EXCEEDED")) {
      return {
        success: false,
        error: "API quota exceeded for tag generation",
        tags: [], // Return empty tags when quota exceeded
      };
    }

    return {
      success: false,
      error: error.message || "Error generating tags for the image",
      tags: [], // Return empty tags on error
    };
  }
}
