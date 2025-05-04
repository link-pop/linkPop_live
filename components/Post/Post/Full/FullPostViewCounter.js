"use client";

import { useEffect } from "react";
import { updateFullPostViews } from "@/lib/actions/updateFullPostViews";

// Global map to track updates across component instances
const updatedPosts = new Map();

export default function FullPostViewCounter({ col, postId }) {
  useEffect(() => {
    const handleView = async () => {
      const key = `${col}-${postId}`;
      
      if (updatedPosts.has(key)) return;
      updatedPosts.set(key, true);
      
      try {
        await updateFullPostViews(col, postId);
      } catch (error) {
        console.error("Error updating view count:", error);
        // Remove from map if update fails so it can be retried
        updatedPosts.delete(key);
      }
    };

    handleView();

    // Cleanup function to remove from map when component unmounts
    return () => {
      const key = `${col}-${postId}`;
      setTimeout(() => {
        updatedPosts.delete(key);
      }, 1000); // Small delay to prevent immediate recounting during navigation
    };
  }, [col, postId]);

  return null;
}
