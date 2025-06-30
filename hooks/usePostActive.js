"use client";

import { useQueryClient } from "@tanstack/react-query";
import { update } from "@/lib/actions/crud";

// * handles active status change for posts; currently for: landingpages and directlinks
export default function usePostActive({ post, col }) {
  const queryClient = useQueryClient();

  const handleActiveChange = async (e) => {
    const newActiveState = e.target.checked;

    // Optimistically update the UI
    queryClient.setQueryData(["posts", col], (oldData) => {
      if (!oldData) return oldData;
      return oldData.map((p) =>
        p._id === post._id ? { ...p, active: newActiveState } : p
      );
    });

    try {
      const result = await update({
        col: col,
        data: { _id: post._id },
        update: { active: newActiveState },
      });

      if (!result) {
        throw new Error("Failed to update status");
      }

      // Invalidate the query to refetch fresh data
      queryClient.invalidateQueries(["posts", col]);

      return { success: true, active: newActiveState };
    } catch (error) {
      // Revert the optimistic update on error
      queryClient.setQueryData(["posts", col], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((p) =>
          p._id === post._id ? { ...p, active: !newActiveState } : p
        );
      });

      console.error("❌ Error updating active status:", error);
      return { success: false, active: !newActiveState };
    }
  };

  return {
    handleActiveChange,
  };
}
