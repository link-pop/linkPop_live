const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    blurredUrl: {
      type: String,
      required: false,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // for UPDATE MODE to work
    },
    fileBytes: {
      type: Number,
      required: true,
    },
    uploadedFrom: {
      type: String,
      required: true,
      enum: ["chatmessages", "welcomeMessage", "feeds", null],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    relatedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      // For chat messages, this should be set to the message ID, not the chat room ID
      // This allows proper purchase verification for paid content
    },
    fileName: {
      type: String,
      required: false,
      default: null,
    },
    fileId: {
      type: String,
      required: false,
      default: null,
    },
    isCropped: {
      type: Boolean,
      default: false,
    },
    originalFileId: {
      type: String,
      required: false,
      default: null,
    },
    faceCount: {
      type: Number,
      default: 0,
    },
    hasMinor: {
      type: Boolean,
      default: false,
    },
    hasSunglasses: {
      type: Boolean,
      default: false,
    },
    // Image quality score (0-1, higher is better)
    imageQualityScore: {
      type: Number,
      default: 1, // Default to highest quality
    },
    // Quality assessment result
    isLowQuality: {
      type: Boolean,
      default: false,
    },
    // NSFW Data - Intensity classes
    nsfw_sexual_activity: {
      type: Number,
      default: 0,
    },
    nsfw_sexual_display: {
      type: Number,
      default: 0,
    },
    nsfw_erotica: {
      type: Number,
      default: 0,
    },
    nsfw_very_suggestive: {
      type: Number,
      default: 0,
    },
    nsfw_suggestive: {
      type: Number,
      default: 0,
    },
    nsfw_mildly_suggestive: {
      type: Number,
      default: 0,
    },
    nsfw_none: {
      type: Number,
      default: 1, // Default to 1 (100%) safe
    },
    // NSFW Suggestive classes
    nsfw_visibly_undressed: {
      type: Number,
      default: 0,
    },
    nsfw_sextoy: {
      type: Number,
      default: 0,
    },
    nsfw_suggestive_focus: {
      type: Number,
      default: 0,
    },
    nsfw_suggestive_pose: {
      type: Number,
      default: 0,
    },
    nsfw_lingerie: {
      type: Number,
      default: 0,
    },
    nsfw_male_underwear: {
      type: Number,
      default: 0,
    },
    nsfw_cleavage: {
      type: Number,
      default: 0,
    },
    nsfw_cleavage_very_revealing: {
      type: Number,
      default: 0,
    },
    nsfw_cleavage_revealing: {
      type: Number,
      default: 0,
    },
    nsfw_cleavage_none: {
      type: Number,
      default: 0,
    },
    nsfw_male_chest: {
      type: Number,
      default: 0,
    },
    nsfw_male_chest_very_revealing: {
      type: Number,
      default: 0,
    },
    nsfw_male_chest_revealing: {
      type: Number,
      default: 0,
    },
    nsfw_male_chest_slightly_revealing: {
      type: Number,
      default: 0,
    },
    nsfw_male_chest_none: {
      type: Number,
      default: 0,
    },
    nsfw_nudity_art: {
      type: Number,
      default: 0,
    },
    nsfw_schematic: {
      type: Number,
      default: 0,
    },
    nsfw_bikini: {
      type: Number,
      default: 0,
    },
    nsfw_swimwear_one_piece: {
      type: Number,
      default: 0,
    },
    nsfw_swimwear_male: {
      type: Number,
      default: 0,
    },
    nsfw_minishort: {
      type: Number,
      default: 0,
    },
    nsfw_miniskirt: {
      type: Number,
      default: 0,
    },
    nsfw_other: {
      type: Number,
      default: 0,
    },
    // NSFW Context classes
    nsfw_sea_lake_pool: {
      type: Number,
      default: 0,
    },
    nsfw_outdoor_other: {
      type: Number,
      default: 0,
    },
    nsfw_indoor_other: {
      type: Number,
      default: 0,
    },
    // Other NSFW-related scores
    nsfw_weapons_score: {
      type: Number,
      default: 0,
    },
    nsfw_alcohol_score: {
      type: Number,
      default: 0,
    },
    nsfw_drugs_score: {
      type: Number,
      default: 0,
    },
    nsfw_offensive_score: {
      type: Number,
      default: 0,
    },
    nsfw_is_safe: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create the model
const Attachment =
  mongoose?.models?.attachments ||
  mongoose.model("attachments", attachmentSchema);

// Export both the model and schema
module.exports = Attachment;
module.exports.attachmentSchema = attachmentSchema;
