"use client";

import ViewMoreCommentsLink from "./ViewMoreCommentsLink";
import PostsClientInfiniteScroll from "../Post/Posts/PostsClientInfiniteScroll";
import { usePathname } from "next/navigation";
import { MAIN_ROUTE } from "@/lib/utils/constants";

export default function Comments({
  postId,
  postType,
  mongoUser,
  setCommentTextState,
  postCommentsNum,
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <PostsClientInfiniteScroll
        {...{
          limit: pathname === MAIN_ROUTE ? 3 : 20,
          loadPostsOnce: pathname === MAIN_ROUTE ? true : false, // save "MEMO"
          searchParams: {
            postId,
          },
          col: {
            name: "comments",
            settings: { noFullPost: true, noUpdateIcon: true, hasLikes: true },
          },
          // isAdmin,
          mongoUser,
          showFoundNum: false,
          setCommentTextState,
        }}
      />

      {postCommentsNum > 3 && (
        <ViewMoreCommentsLink {...{ postId, postType }} />
      )}
    </div>
  );
}
