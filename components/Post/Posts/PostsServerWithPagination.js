import PostsPagination from "./PostsPagination";
import PostsDepOnMongoCollection from "./PostsDepOnMongoCollection";
import { getAllPostsNonOwner } from "@/lib/actions/getAllPostsNonOwner";

export default async function PostsServerWithPagination({
  searchParams,
  col = "products",
  isAdmin,
  postsPaginationType,
  limit,
  mongoUser,
}) {
  const page = parseInt(searchParams.page) || 1;

  const posts = await getAllPostsNonOwner({
    col,
    skip: limit * (page - 1),
    limit,
    searchParams,
    mongoUser,
  });

  let totalPosts = await getAllPostsNonOwner({
    col,
    searchParams,
    mongoUser,
  });

  const totalPages = Math.ceil((totalPosts?.length || 0) / limit);

  return (
    <div>
      <PostsDepOnMongoCollection
        {...{
          posts,
          col,
          isAdmin,
          postsPaginationType,
          mongoUser,
        }}
      />
      {totalPages > 1 && (
        <PostsPagination {...{ searchParams, col, totalPages }} />
      )}
    </div>
  );
}
