import { getAllPostsNonOwner } from "@/lib/actions/getAllPostsNonOwner";
import { slugify } from "@/lib/utils/slugify";

// TODO !!!!! refactor ???
export default async function getPostBySlugOrId({ params, col, mongoUser }) {
  // Use slug-based routing only for these collections
  if (
    params.col === "products" ||
    params.col === "articles" ||
    params.col === "users"
  ) {
    // For users, try to find by name directly
    if (params.col === "users") {
      // Remove any potential URL encoding and convert to proper case
      const decodedName = decodeURIComponent(params.postId).replace(/-/g, " ");

      const posts = await getAllPostsNonOwner({
        col,
        mongoUser,
        data: {
          name: { $regex: new RegExp("^" + decodedName + "$", "i") }, // case-insensitive exact match
        },
      });
      return posts[0];
    } else {
      // * find PRODUCTS & ARTICLES
      // TODO !! not efficient ???, make like above to find user by name, but by slug/title
      // Get all posts to find the one with matching slug
      // * use getAllPostsNonOwner to get FullPost likes
      const allPosts = await getAllPostsNonOwner({
        col,
        mongoUser,
        populate:
          params.col === "orders"
            ? ["items.productId", "createdBy"]
            : undefined,
      });

      // Find post by slug
      return allPosts.find((post) => {
        const titleSlug = slugify(post.title);
        return titleSlug === params.postId;
      });
    }
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
