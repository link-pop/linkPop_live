/**
 * Utility to invalidate React Query cache for posts collections
 * This ensures that posts data is refetched after updates
 */

/**
 * Invalidate posts cache for a specific collection
 * @param {Object} queryClient - React Query client instance
 * @param {string} collectionName - Name of the collection (e.g., 'directlinks', 'landingpages')
 */
export const invalidatePostsCache = (queryClient, collectionName) => {
  if (!queryClient || !collectionName) {
    console.error(
      "❌ invalidatePostsCache: Missing queryClient or collectionName"
    );
    return;
  }

  try {
    // Invalidate the specific collection posts cache
    queryClient.invalidateQueries(["posts", collectionName]);

    // Also invalidate any related caches that might depend on this data
    queryClient.invalidateQueries({
      queryKey: ["posts"],
      predicate: (query) => {
        // Invalidate any query that starts with ["posts", collectionName]
        return (
          query.queryKey[0] === "posts" && query.queryKey[1] === collectionName
        );
      },
    });

    console.log(`✅ Successfully invalidated ${collectionName} posts cache`);
  } catch (error) {
    console.error(
      `❌ Error invalidating ${collectionName} posts cache:`,
      error
    );
  }
};
