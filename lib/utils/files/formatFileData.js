"use client";

/**
 * Formats file data to match database schema requirements
 * @param {Object} file - File object from Cloudinary
 * @param {string} uploadedFrom - Collection name where file is being uploaded
 * @returns {Object} Formatted file data
 */
export function formatFileData(file, uploadedFrom) {
  // Extract NSFW data from file.rawResponse or use default values
  const nsfw = file.rawResponse?.nudity || {};
  const suggestiveClasses = nsfw.suggestive_classes || {};
  const cleavageCategories = suggestiveClasses.cleavage_categories || {};
  const maleChestCategories = suggestiveClasses.male_chest_categories || {};
  const contextClasses = nsfw.context || {};

  return {
    fileUrl: file.fileUrl,
    blurredUrl: file.blurredUrl || null,
    fileName: file.fileName,
    fileType: file.fileType?.startsWith("video") ? "video" : "image",
    fileBytes: file.fileBytes,
    fileId: file.fileId,
    uploadedFrom: file.uploadedFrom || uploadedFrom,
    faceCount: file.faceCount || 0,
    hasMinor: file.hasMinor || false,
    hasSunglasses: file.hasSunglasses || false,

    // NSFW Data - Intensity classes
    nsfw_sexual_activity: nsfw.sexual_activity || 0,
    nsfw_sexual_display: nsfw.sexual_display || 0,
    nsfw_erotica: nsfw.erotica || 0,
    nsfw_very_suggestive: nsfw.very_suggestive || 0,
    nsfw_suggestive: nsfw.suggestive || 0,
    nsfw_mildly_suggestive: nsfw.mildly_suggestive || 0,
    nsfw_none: nsfw.none || 1, // Default to 1 (100%) safe

    // NSFW Suggestive classes
    nsfw_visibly_undressed: suggestiveClasses.visibly_undressed || 0,
    nsfw_sextoy: suggestiveClasses.sextoy || 0,
    nsfw_suggestive_focus: suggestiveClasses.suggestive_focus || 0,
    nsfw_suggestive_pose: suggestiveClasses.suggestive_pose || 0,
    nsfw_lingerie: suggestiveClasses.lingerie || 0,
    nsfw_male_underwear: suggestiveClasses.male_underwear || 0,
    nsfw_cleavage: suggestiveClasses.cleavage || 0,
    nsfw_cleavage_very_revealing: cleavageCategories.very_revealing || 0,
    nsfw_cleavage_revealing: cleavageCategories.revealing || 0,
    nsfw_cleavage_none: cleavageCategories.none || 0,
    nsfw_male_chest: suggestiveClasses.male_chest || 0,
    nsfw_male_chest_very_revealing: maleChestCategories.very_revealing || 0,
    nsfw_male_chest_revealing: maleChestCategories.revealing || 0,
    nsfw_male_chest_slightly_revealing:
      maleChestCategories.slightly_revealing || 0,
    nsfw_male_chest_none: maleChestCategories.none || 0,
    nsfw_nudity_art: suggestiveClasses.nudity_art || 0,
    nsfw_schematic: suggestiveClasses.schematic || 0,
    nsfw_bikini: suggestiveClasses.bikini || 0,
    nsfw_swimwear_one_piece: suggestiveClasses.swimwear_one_piece || 0,
    nsfw_swimwear_male: suggestiveClasses.swimwear_male || 0,
    nsfw_minishort: suggestiveClasses.minishort || 0,
    nsfw_miniskirt: suggestiveClasses.miniskirt || 0,
    nsfw_other: suggestiveClasses.other || 0,

    // NSFW Context classes
    nsfw_sea_lake_pool: contextClasses.sea_lake_pool || 0,
    nsfw_outdoor_other: contextClasses.outdoor_other || 0,
    nsfw_indoor_other: contextClasses.indoor_other || 0,

    // Other NSFW-related scores
    nsfw_weapons_score: file.rawResponse?.weapon
      ? (file.rawResponse?.weapon?.classes?.firearm || 0) +
        (file.rawResponse?.weapon?.classes?.knife || 0)
      : 0,
    nsfw_alcohol_score: file.rawResponse?.alcohol?.prob || 0,
    nsfw_drugs_score: file.rawResponse?.recreational_drug?.prob || 0,
    nsfw_offensive_score: file.rawResponse?.offensive
      ? Math.max(
          file.rawResponse.offensive.nazi || 0,
          file.rawResponse.offensive.supremacist || 0,
          file.rawResponse.offensive.terrorist || 0,
          file.rawResponse.offensive.middle_finger || 0
        )
      : 0,
    nsfw_is_safe: file.isSafe !== undefined ? file.isSafe : true,
  };
}

/**
 * Formats file data for attachment creation
 * @param {Object} file - File object from Cloudinary
 * @param {string} uploadedFrom - Collection name where file is being uploaded
 * @param {string} userId - User ID creating the attachment
 * @param {Object} options - Additional options like isPaid and relatedPostId
 * @returns {Object} Formatted attachment data
 */
export function formatAttachmentData(file, uploadedFrom, userId, options = {}) {
  return {
    ...formatFileData(file, uploadedFrom),
    createdBy: userId,
    isPaid: options.isPaid || false,
    relatedPostId: options.relatedPostId || null,
  };
}
