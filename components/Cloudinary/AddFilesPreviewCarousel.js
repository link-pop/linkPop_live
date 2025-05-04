"use client";

import React from "react";
import Carousel from "../ui/shared/Carousel/Carousel";
import DeleteIcon from "../ui/icons/DeleteIcon";

export default function AddFilesPreviewCarousel({
  previews,
  filesSet,
  deleteStateFile,
}) {
  return (
    <Carousel
      files={previews}
      imageSize={{ width: 320, height: 320 }}
      filesSet={filesSet}
      fileIcon={(file) => (
        <div
          className="absolute inset-0 flex items-start justify-end p-2"
          onClick={() => deleteStateFile(file.fileName)}
        >
          <DeleteIcon />
        </div>
      )}
    />
  );
}
