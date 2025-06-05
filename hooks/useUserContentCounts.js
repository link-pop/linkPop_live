"use client";

import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/lib/actions/crud";

// TODO !!! move to User/MoreThanFriend/
export default function useUserContentCounts(userId, isOwner = false) {
  return useQuery({
    queryKey: ["content", "counts", userId, isOwner],
    queryFn: async () => {
      if (!userId) return { posts: 0, media: 0, store: 0 };

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

        const storeQuery = {
          col: "storeitems",
          data: {
            createdBy: userId,
          },
        };

        const [posts, media, store] = await Promise.all([
          getAll(postsQuery),
          getAll(mediaQuery),
          getAll(storeQuery),
        ]);

        return {
          posts: posts?.length || 0,
          media: media?.length || 0,
          store: store?.length || 0,
        };
      } catch (error) {
        console.error("Error fetching counts:", error);
        return { posts: 0, media: 0, store: 0 };
      }
    },
    enabled: Boolean(userId),
  });
}
