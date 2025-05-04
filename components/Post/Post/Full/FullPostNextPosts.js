import { getAll } from "@/lib/actions/crud";
import FullPostNextPost from "./FullPostNextPost";

export default async function FullPostNextPosts({ post, col }) {
  let nextPost = null;
  let prevPost = null;

  try {
    // Get next post
    const nextPosts = await getAll({
      col,
      data: {
        createdAt: { $gt: post.createdAt },
        _id: { $ne: post._id },
      },
      limit: 1,
      sort: { createdAt: 1 },
    });

    // Get previous post
    const prevPosts = await getAll({
      col,
      data: {
        createdAt: { $lt: post.createdAt },
        _id: { $ne: post._id },
      },
      limit: 1,
      sort: { createdAt: -1 },
    });

    nextPost = nextPosts[0];
    prevPost = prevPosts[0];
  } catch (error) {
    console.error("Error fetching next/prev posts:", error);
  }

  if (!nextPost && !prevPost) return null;

  return (
    <div className="min-[1700px]:pof min-[1700px]:t250 wf flex justify-between items-start gap-8">
      <FullPostNextPost post={prevPost} col={col} type="prev" />
      <FullPostNextPost post={nextPost} col={col} type="next" />
    </div>
  );
}
