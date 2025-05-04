"use client";

import React from "react";
import { X } from "lucide-react";

export default function AddFilesPreviewList({ previews, deleteStateFile }) {
  return (
    <div className="w-full space-y-2 mt-4">
      {previews.map((file) => (
        <div
          key={file.fileName}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className="w-12 h-12 object-cover rounded"
            />
            <span className="text-sm text-gray-600">{file.fileName}</span>
          </div>
          <button
            onClick={() => deleteStateFile(file.fileName)}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
