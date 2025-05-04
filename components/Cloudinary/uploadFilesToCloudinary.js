"use client";

import axios from "axios";

export default async function uploadFilesToCloudinary(
  files,
  uploadedFrom,
  relatedPostId = null
) {
  if (!files) return;
  const promises = files.map((file) => {
    // * 1: if fileUrl exists in file =>
    // file is already uploaded to cloudinary =>
    // no need for uploading =>
    // return info about already uploaded file
    if (file?.fileUrl) {
      return Promise.resolve({
        data: {
          secure_url: file.fileUrl,
          original_filename: file.fileName,
          format: file.fileType,
          bytes: file.fileBytes,
          public_id: file.fileId,
          uploadedFrom: file.uploadedFrom || uploadedFrom, // Keep existing or use new
          relatedPostId: file.relatedPostId || relatedPostId, // Keep existing or use new
          blurred_url: file.blurredUrl || null, // Include blurred URL if exists
        },
      });
    }
    // * 2: else upload file to cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_NAME
    );

    // Determine resource type based on file type
    const resourceType = file.type.startsWith("video") ? "video" : "image";

    // For images, we'll create a blurred version
    if (resourceType === "image") {
      return axios
        .post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then(async (response) => {
          // After uploading the original image, create a blurred version
          const publicId = response.data.public_id;

          // Create a blurred, minified transformation URL
          // w_100,h_100 - resize to 100x100
          // e_blur:800 - apply blur effect with strength 800
          const blurredUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,e_blur:700/${publicId}`;

          // Add the blurred URL to the response
          return {
            ...response,
            data: {
              ...response.data,
              blurred_url: blurredUrl,
            },
          };
        });
    } else {
      // For videos, upload and create a blurred preview version
      return axios
        .post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then(async (response) => {
          // After uploading the original video, create a blurred preview
          const publicId = response.data.public_id;

          // Create a blurred, shorter preview URL for the video
          // eo_10p - extract only first 10% of the video
          // e_blur:300 - apply moderate blur effect
          // q_auto:low - lower quality to reduce size
          const blurredUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/eo_100p,e_blur:500,q_auto:low/${publicId}`;

          // Add the blurred URL to the response
          return {
            ...response,
            data: {
              ...response.data,
              blurred_url: blurredUrl,
            },
          };
        });
    }
  });

  const responses = await Promise.all(promises);
  const serverUploadedFiles = responses.map((response) => {
    const {
      secure_url,
      original_filename,
      format,
      bytes,
      public_id,
      resource_type,
      uploadedFrom: existingUploadedFrom,
      relatedPostId: existingRelatedPostId,
      blurred_url,
    } = response.data;
    return {
      fileUrl: secure_url,
      fileName: original_filename,
      fileType: resource_type === "video" ? "video" : format,
      fileBytes: bytes,
      fileId: public_id,
      uploadedFrom: existingUploadedFrom || uploadedFrom,
      relatedPostId: existingRelatedPostId || relatedPostId,
      blurredUrl: blurred_url || null,
    };
  });

  return serverUploadedFiles;
}
