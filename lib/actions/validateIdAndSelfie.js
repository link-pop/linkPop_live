"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

/**
 * Validates ID document and selfie using Gemini AI
 * @param {string} idBase64 - Base64-encoded image of ID document
 * @param {string} selfieBase64 - Base64-encoded image of selfie
 * @returns {Promise<Object>} Result object with validation status and details
 */
export async function validateIdAndSelfie(idBase64, selfieBase64) {
  if (!idBase64 || !selfieBase64) {
    return {
      valid: false,
      error: "Missing required images",
      errorCode: "MISSING_IMAGES",
    };
  }

  try {
    console.log("Starting ID and selfie validation with Gemini AI...");

    // Remove the base64 prefix if present
    const idImageContent = idBase64.replace(/^data:image\/\w+;base64,/, "");
    const selfieImageContent = selfieBase64.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    // Create a model instance with vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the images for processing
    const idImagePart = {
      inlineData: {
        data: idImageContent,
        mimeType: "image/jpeg", // Assuming JPEG, adjust as needed
      },
    };

    const selfieImagePart = {
      inlineData: {
        data: selfieImageContent,
        mimeType: "image/jpeg", // Assuming JPEG, adjust as needed
      },
    };

    // First, verify if the ID image is a legitimate ID document
    console.log("Verifying ID document...");

    const idVerificationPrompt = `
      You are a document verification specialist. Analyze this image carefully.
      
      Is this a legitimate government-issued ID document (like a passport, driver's license, national ID card, etc.)?
      
      Respond with ONLY:
      "VALID_ID_DOCUMENT" if it appears to be a legitimate ID document.
      "NOT_ID_DOCUMENT" if it's not a legitimate ID document.
      "UNCERTAIN" if you can't determine with confidence.
    `;

    // Verify the ID document
    const idVerificationResult = await model.generateContent([
      idVerificationPrompt,
      idImagePart,
    ]);
    const idVerificationResponse = await idVerificationResult.response;
    const idVerificationText = idVerificationResponse.text().trim();

    console.log(`ID verification result: ${idVerificationText}`);

    // Check ID verification result
    if (idVerificationText !== "VALID_ID_DOCUMENT") {
      console.log(`ID document verification failed: ${idVerificationText}`);
      return {
        valid: false,
        error: "The first image does not appear to be a legitimate ID document",
        errorCode: "INVALID_ID_DOCUMENT",
      };
    }

    // Next, verify if the selfie image is a legitimate selfie (not another ID document)
    console.log("Verifying selfie photo...");

    const selfieVerificationPrompt = `
      You are a document verification specialist. Analyze this image carefully.
      
      This image is supposed to be a selfie or portrait photo of a person, not an ID document.
      
      IMPORTANT GUIDELINES:
      - A valid selfie or portrait photo should show just the person's face or upper body
      - It should NOT have document elements like borders, emblems, or ID markings
      - It should NOT appear to be cropped directly from an ID document
      - The photo might be informal or taken in a normal environment (not a formal ID background)
      
      Respond with ONLY:
      "VALID_SELFIE" if it appears to be a regular portrait/selfie photo.
      "ID_DOCUMENT" if it appears to be an ID document, passport, driver's license, etc.
      "CROPPED_FROM_ID" if it appears to be a photo portion cropped from an ID document.
      "UNCERTAIN" if you can't determine with confidence.
    `;

    // Verify the selfie
    const selfieVerificationResult = await model.generateContent([
      selfieVerificationPrompt,
      selfieImagePart,
    ]);
    const selfieVerificationResponse = await selfieVerificationResult.response;
    const selfieVerificationText = selfieVerificationResponse.text().trim();

    console.log(`Selfie verification result: ${selfieVerificationText}`);

    // Check selfie verification result
    if (
      selfieVerificationText === "ID_DOCUMENT" ||
      selfieVerificationText === "CROPPED_FROM_ID"
    ) {
      console.log(`Selfie verification failed: ${selfieVerificationText}`);
      return {
        valid: false,
        error:
          "The second image appears to be from an ID document rather than a separate selfie photo",
        errorCode: "SELFIE_IS_ID_DOCUMENT",
      };
    }

    if (selfieVerificationText === "UNCERTAIN") {
      // If uncertain, we'll proceed but log a warning
      console.warn(
        "Uncertain about selfie verification, proceeding with caution"
      );
    }

    // Finally, check if the two images are the same or very similar
    console.log("Comparing ID and selfie photos...");

    const imageComparisonPrompt = `
      You are an image verification specialist. Compare these two images carefully.
      
      For this comparison, I need you to determine if these are two DIFFERENT PHOTOS of the same person, or if they are the SAME IMAGE duplicated.
      
      The first image is an ID document (passport, license, etc) with a photo.
      The second image is supposed to be a selfie or recent photo of the same person.
      
      IMPORTANT DISTINCTION:
      - It's EXPECTED and CORRECT that both images show the same person
      - What we're checking for is whether the user submitted the exact same image twice
      - Or if they correctly submitted two different photos (ID document and a separate selfie)
      
      Respond with ONLY:
      "SAME_IMAGE" if the images appear to be identical or the same photo (e.g., they used the ID photo for the selfie or just duplicated the entire ID)
      "DIFFERENT_PHOTOS" if they are clearly different photos of what appears to be the same person
      "UNCERTAIN" if you can't determine with confidence
    `;

    // Compare the two images
    const imageComparisonResult = await model.generateContent([
      imageComparisonPrompt,
      idImagePart,
      selfieImagePart,
    ]);
    const imageComparisonResponse = await imageComparisonResult.response;
    const imageComparisonText = imageComparisonResponse.text().trim();

    console.log(`Image comparison result: ${imageComparisonText}`);

    // Check image comparison result
    if (imageComparisonText !== "DIFFERENT_PHOTOS") {
      console.log(`Image comparison failed: ${imageComparisonText}`);
      return {
        valid: false,
        error: "The ID document and selfie appear to be the same image",
        errorCode: "DUPLICATE_IMAGES",
      };
    }

    // If all checks pass, return success
    console.log("All image validations passed successfully!");
    return {
      valid: true,
      message: "ID document and selfie validated successfully",
    };
  } catch (error) {
    console.error("Error validating images:", error);
    return {
      valid: false,
      error: error.message || "Error processing the images",
      errorCode: "PROCESSING_ERROR",
    };
  }
}
