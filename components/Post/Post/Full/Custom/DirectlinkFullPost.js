"use client";

import { useState, useEffect } from "react";
import { useFacebookPixel, FacebookPixelScript } from "@/lib/utils/fbPixel";

export default function DirectlinkFullPost({ post }) {
  // Use our custom Facebook Pixel hook
  const fbPixelLoaded = useFacebookPixel(post?.facebookPixelId);

  // Return the component with Facebook Pixel script
  return (
    <>
      {/* Use our FacebookPixelScript component */}
      {post?.facebookPixelId && (
        <FacebookPixelScript pixelId={post.facebookPixelId} />
      )}

      {/* Display while redirecting */}
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-medium mb-2">Redirecting...</h1>
          <p className="text-muted-foreground">
            You'll be redirected in a moment.
          </p>
        </div>
      </div>
    </>
  );
}
