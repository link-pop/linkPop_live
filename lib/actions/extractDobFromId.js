"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { update } from "@/lib/actions/crud";

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

/**
 * Calculate age from a birthdate
 * @param {string} birthdate - Birthdate in YYYY-MM-DD format
 * @returns {number} Age in years
 */
function calculateAge(birthdate) {
  const birthDate = new Date(birthdate);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // If birth month is after current month or same month but birth day is after current day
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Extracts date of birth from an ID document image using Gemini AI
 * @param {string} userId - MongoDB user ID
 * @param {string} base64Image - Base64-encoded image of ID document
 * @returns {Promise<Object>} Result object with extraction status and birthday
 */
export async function extractDobFromId(userId, base64Image) {
  if (!userId || !base64Image) {
    return { success: false, error: "Missing required parameters" };
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

    // First, verify if the image is a legitimate ID document
    const verificationPrompt = `
      You are a document verification specialist. Analyze this image carefully.
      
      Is this a legitimate government-issued ID document (like a passport, driver's license, national ID card, etc.)?
      Look for these characteristics:
      - Official government seals or emblems
      - Security features (hologram indications, microprinting, etc.)
      - Professional format and layout expected of an official document
      - Photo of a person
      - Multiple fields of information (name, date of birth, ID number, etc.)
      - Barcode or machine-readable zone
      
      Also check for these potential problems:
      - Signs of digital manipulation or photoshopping
      - Poor quality or obviously fake IDs
      - Screenshots of documents rather than actual document photos
      - Expired ID documents if the expiry date is visible
      - IDs with intentionally obscured or tampered information
      
      Respond with ONLY:
      "VALID_ID" if it appears to be a legitimate ID document.
      "INVALID_ID" if it's not a legitimate ID document or just a simple image with text.
      "EXPIRED_ID" if it's a legitimate ID but clearly expired.
      "MANIPULATED_ID" if you detect signs of tampering or digital manipulation.
      "UNCERTAIN" if you can't determine with confidence.
    `;

    // Verify the document first
    const verificationResult = await model.generateContent([
      verificationPrompt,
      imagePart,
    ]);
    const verificationResponse = await verificationResult.response;
    const verificationText = verificationResponse.text().trim();

    // Check verification result
    if (verificationText === "INVALID_ID") {
      return {
        success: false,
        error:
          "The uploaded image does not appear to be a legitimate ID document",
      };
    }

    if (verificationText === "EXPIRED_ID") {
      return {
        success: false,
        error:
          "The ID document appears to be expired. Please provide a valid, non-expired ID",
      };
    }

    if (verificationText === "MANIPULATED_ID") {
      return {
        success: false,
        error:
          "The ID document appears to be digitally manipulated or tampered with",
      };
    }

    if (verificationText === "UNCERTAIN") {
      return {
        success: false,
        error:
          "Couldn't verify if this is a legitimate ID document. Please upload a clearer image",
      };
    }

    // If verification passed, proceed with DOB extraction
    const extractionPrompt = `
      You are a document analyzer specialized in ID extraction.
      Assuming this is a legitimate ID document, extract ONLY the date of birth (DOB).
      Format the date as YYYY-MM-DD.
      Return ONLY the date in this format, nothing else.
      If you cannot find a date of birth, respond with "NOT_FOUND".
    `;

    // Generate content using the image and prompt
    const result = await model.generateContent([extractionPrompt, imagePart]);
    const response = await result.response;
    const extractedText = response.text().trim();

    // Validate the extracted date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValidDate =
      dateRegex.test(extractedText) && !isNaN(Date.parse(extractedText));

    if (extractedText === "NOT_FOUND" || !isValidDate) {
      return {
        success: false,
        error: "Could not extract a valid date of birth from the image",
      };
    }

    // Calculate age from the extracted date of birth
    const age = calculateAge(extractedText);

    // Save the extracted DOB and calculated age to the user's profile
    await update({
      col: "users",
      data: { _id: userId },
      update: {
        birthday: extractedText,
        age, // This is the user's actual age from ID verification, not a preference
        idVerified: true,
        idVerificationDate: new Date().toISOString(),
      },
      revalidate: "/onboarding/5",
    });

    return {
      success: true,
      birthday: extractedText,
      age: age,
      verificationDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error extracting DOB:", error);
    return {
      success: false,
      error: error.message || "Error processing the ID document",
    };
  }
}
