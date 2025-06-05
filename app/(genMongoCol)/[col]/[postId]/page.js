import FullPost from "@/components/Post/Post/Full/FullPost";
import { getAllPostsNonOwner } from "@/lib/actions/getAllPostsNonOwner";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils/slugify";
import { LOGIN_ROUTE } from "@/lib/utils/constants";
import getPostBySlugOrId from "@/lib/actions/getPostBySlugOrId";

// * fullPostPage
export default async function fullPostPage({ params }) {
  const col = await getAllMongoCollectionsData(params.col);
  // ! getting user by name (postId)
  const { mongoUser, isAdmin, visitedMongoUser } = await getMongoUser(
    params.postId
  );
  if (!mongoUser) redirect(LOGIN_ROUTE);

  let post = await getPostBySlugOrId({ params, col, mongoUser });

  // If post not found, redirect to col posts page
  if (!post) {
    redirect(`/${params.col}`);
  }

  return (
    <>
      <FullPost
        {...{
          post,
          col,
          isAdmin,
          mongoUser,
          visitedMongoUser,
        }}
      />
    </>
  );
}
