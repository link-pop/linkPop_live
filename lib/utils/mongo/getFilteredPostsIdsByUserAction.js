import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

// * get liked/viewed posts
export const getFilteredPostsIdsByUserAction = async ({
  actionType,
  userId,
  collectionName,
}) => {
  const collection = actionType === "liked" ? "likes" : "analytics";

  const posts = await getAll({
    col: collection,
    data: {
      userId:
        actionType === "liked" ? new mongoose.Types.ObjectId(userId) : userId,
      postType: collectionName,
    },
  });

  const postIds = posts.map((item) => {
    const postId = item.postId?._id || item.postId;
    return new mongoose.Types.ObjectId(postId);
  });

  return postIds;
};
