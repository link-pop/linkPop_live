import { getAllPostsNonOwner } from "@/lib/actions/getAllPostsNonOwner";

export default async function getPostBySlugOrId({ params, col, mongoUser }) {
  // Use slug-based routing only for users collection
  if (params.col === "users") {
    // For users, try to find by name directly
    // Remove any potential URL encoding and convert to proper case
    const decodedName = decodeURIComponent(params.postId).replace(/-/g, " ");

    // Create different query variations to improve user lookup
    const searchQuery = {
      $or: [
        // Exact name match (case-insensitive)
        { name: { $regex: new RegExp("^" + decodedName + "$", "i") } },

        // Name with no spaces (for users generated with no spaces)
        {
          name: {
            $regex: new RegExp(
              "^" + decodedName.replace(/\s+/g, "") + "$",
              "i"
            ),
          },
        },

        // Try to match with the original slug pattern
        {
          name: {
            $regex: new RegExp(
              "^" + params.postId.replace(/-/g, "") + "$",
              "i"
            ),
          },
        },
      ],
    };

    const posts = await getAllPostsNonOwner({
      col,
      mongoUser,
      data: searchQuery,
    });

    return posts[0];
  } else {
    // Use ID-based routing for other collections
    const posts = await getAllPostsNonOwner({
      col,
      data: { _id: params.postId },
      mongoUser,
      populate:
        params.col === "orders" ? ["items.productId", "createdBy"] : undefined,
    });
    return posts[0];
  }
}
