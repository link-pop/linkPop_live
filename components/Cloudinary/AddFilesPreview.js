"use client";

import React, { useEffect, useState } from "react";
import AddFilesPreviewCarousel from "./AddFilesPreviewCarousel";
import AddFilesPreviewList from "./AddFilesPreviewList";
import AddFilesPreviewGallery from "./AddFilesPreviewGallery";

export default function AddFilesPreview({
  files,
  filesSet,
  addFilesPreviewType = "gallery",
  addFilesPreviewClassName = "",
}) {
  const [previews, previewsSet] = useState([]);

  // make previews
  useEffect(() => {
    console.log("Files changed:", files);
    // * 1: if fileUrl exists in file =>
    // file is already uploaded to cloudinary =>
    // show server-uploaded-files in preview
    // * 2: else show blobs in preview
    previewsSet(
      files.map((file) => {
        if (file.fileUrl) {
          console.log("Server file:", file);
          // For server files, use _id as identifier
          // ! 1: real file
          return {
            fileUrl: file.fileUrl,
            fileBytes: file.fileBytes,
            fileType: file.fileType,
            _id: file._id,
            // Use _id as identifier for server files
            identifier: file._id || `file-${Math.random().toString(36).substring(2, 11)}`,
          };
        }
        console.log("Local file:", file);
        // For new files, use name as identifier
        // ! 2: blob

        // Determine file type
        let fileType = file.fileType || file.type;
        if (fileType.startsWith("video/")) {
          fileType = "video";
        } else if (fileType.startsWith("image/")) {
          fileType = "image";
        }

        // Ensure file has a unique identifier
        const identifier = file.name || `new-file-${Math.random().toString(36).substring(2, 11)}`;

        return {
          fileUrl: file.preview || URL.createObjectURL(file),
          fileBytes: file.size,
          fileType,
          // Use name as identifier for local files
          identifier,
        };
      })
    );
  }, [files]);

  function deleteStateFile(identifier) {
    console.log("Deleting file with identifier:", identifier);
    console.log("Current files:", files);

    const newFiles = files.filter((file) => {
      // For server files use _id, for local files use name
      const fileIdentifier = file.fileUrl ? file._id : file.name;
      console.log("Comparing", fileIdentifier, "with", identifier);
      return fileIdentifier !== identifier;
    });

    console.log("Files after deletion:", newFiles);
    filesSet(newFiles);
  }

  // ! handleReorder
  function handleReorder(reorderedPreviews) {
    previewsSet(reorderedPreviews);

    // Update the files state to match the new order
    const reorderedFiles = reorderedPreviews.map((preview) => {
      // Find the corresponding file in the original files array
      const matchingFile = files.find(
        (file) =>
          (file.name && file.name === preview.identifier) ||
          (file._id && file._id === preview.identifier)
      );
      
      // If we can't find a matching file, return the original file
      return matchingFile || files.find(file => 
        (file.fileUrl && preview.fileUrl && file.fileUrl === preview.fileUrl)
      );
    }).filter(Boolean); // Remove any undefined entries

    filesSet(reorderedFiles);
  }
  // ? handleReorder

  if (!previews.length) return null;

  return (
    <div className={`px15 my15 ${addFilesPreviewClassName}`}>
      {addFilesPreviewType === "carousel" && (
        <AddFilesPreviewCarousel
          previews={previews}
          deleteStateFile={deleteStateFile}
        />
      )}

      {addFilesPreviewType === "list" && (
        <AddFilesPreviewList
          previews={previews}
          deleteStateFile={deleteStateFile}
        />
      )}

      {addFilesPreviewType === "gallery" && (
        <AddFilesPreviewGallery
          previews={previews}
          deleteStateFile={deleteStateFile}
          onReorder={handleReorder}
        />
      )}
    </div>
  );
}
