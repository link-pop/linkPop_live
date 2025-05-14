"use client";

import { useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import NSFWContentAlert from "@/components/ui/shared/NSFWContentAlert/NSFWContentAlert";

// Client component for NSFW content detection test
export default function NSFWCheckTestClient() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Only accept images
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle image upload and NSFW check
  const handleCheck = async () => {
    if (!file) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get base64 of the image
      const base64Image = await fileToBase64(file);

      // Call the NSFW check API
      const response = await fetch("/api/nsfw-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to check image";
        throw new Error(errorMessage);
      }

      setResult(data);
    } catch (err) {
      console.error("Error checking image:", err);
      setError(err.message || "Failed to check image");
    } finally {
      setLoading(false);
    }
  };

  // Clear the current selection
  const handleClear = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 bg-background text-foreground`}>
      <h1 className={`text-2xl font-bold mb-6`}>NSFW Content Detection Test</h1>

      <div className={`mb-6 p-4 border border-accent rounded-md`}>
        <h2 className={`text-xl mb-4`}>Upload an image to check</h2>

        <div className={`flex items-center gap-4 mb-4`}>
          <label
            className={`flex items-center justify-center w-full h-12 px-4 py-2 border border-dashed border-accent rounded-md cursor-pointer hover:bg-accent/10 transition-colors`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`hidden`}
            />
            <Upload size={20} className={`mr-2`} />
            <span>{file ? file.name : "Select image"}</span>
          </label>

          {file && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-2 text-destructive hover:bg-destructive/10 rounded-full`}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {imagePreview && (
          <div className={`mb-4`}>
            <div
              className={`relative aspect-video max-h-[300px] overflow-hidden rounded-md`}
            >
              <img
                src={imagePreview}
                alt="Preview"
                className={`w-full h-full object-contain`}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            className={`mb-4 p-3 bg-destructive/20 text-destructive rounded-md flex items-center`}
          >
            <AlertCircle size={18} className={`mr-2 flex-shrink-0`} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleCheck}
          disabled={!file || loading}
          className={`w-full h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Checking..." : "Check Image"}
        </button>
      </div>

      {result && (
        <div className={`border border-accent rounded-md overflow-hidden`}>
          <NSFWContentAlert scores={result} image={imagePreview} />
        </div>
      )}
    </div>
  );
}

// Helper function to convert File object to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
