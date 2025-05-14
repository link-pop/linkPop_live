"use client";

import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/lib/actions/crud";

// TODO !!! move to User/MoreThanFriend/
export default function useUserContentCounts(userId, isOwner = false) {
  return useQuery({
    queryKey: ["content", "counts", userId, isOwner],
    queryFn: async () => {
      if (!userId) return { posts: 0, media: 0 };

      try {
        const postsQuery = {
          col: "feeds",
          data: {
            createdBy: userId,
          },
        };

        const mediaQuery = {
          col: "attachments",
          data: {
            createdBy: userId,
            ...(isOwner ? {} : { uploadedFrom: "feeds" }),
          },
        };

        const [posts, media] = await Promise.all([
          getAll(postsQuery),
          getAll(mediaQuery),
        ]);

        return {
          posts: posts?.length || 0,
          media: media?.length || 0,
        };
      } catch (error) {
        console.error("Error fetching counts:", error);
        return { posts: 0, media: 0 };
      }
    },
    enabled: Boolean(userId),
  });
}
