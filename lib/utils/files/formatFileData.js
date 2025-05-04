"use client";

/**
 * Formats file data to match database schema requirements
 * @param {Object} file - File object from Cloudinary
 * @param {string} uploadedFrom - Collection name where file is being uploaded
 * @returns {Object} Formatted file data
 */
export function formatFileData(file, uploadedFrom) {
  return {
    "fileUrl": file.fileUrl,
    "blurredUrl": file.blurredUrl || null,
    "fileName": file.fileName,
    "fileType": file.fileType?.startsWith("video") ? "video" : "image",
    "fileBytes": file.fileBytes,
    "fileId": file.fileId,
    "uploadedFrom": file.uploadedFrom || uploadedFrom,
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
    "createdBy": userId,
    "isPaid": options.isPaid || false,
    "relatedPostId": options.relatedPostId || null,
  };
}
