"use client";

import { update } from "@/lib/actions/crud";
import { useQueryClient } from "@tanstack/react-query";

export default function useCommentCustomPostDeleteLogic({ post }) {
  const queryClient = useQueryClient();

  async function handleCommentDelete() {
    await update({
      col: { name: "feeds" },
      data: { _id: post.postId },
      update: { $inc: { comments: -1 } },
    });

    queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  }

  return { handleCommentDelete };
}
