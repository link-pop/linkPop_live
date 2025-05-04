import PostsClientInfiniteScroll from "./PostsClientInfiniteScroll";
import PostsLTRScrollWrap from "@/components/Post/Posts/PostsLTRScrollWrap";

// for posts like "you may also like" and so on...,
export default function PostsLTR({
  searchParams,
  col,
  isAdmin,
  mongoUser,
  top,
  className = "",
}) {
  return (
    <>
      <div className={`max-w-[1100px] wf mxa ${className}`}>
        <PostsLTRScrollWrap>
          <PostsClientInfiniteScroll
            {...{
              loadPostsOnce: true,
              scrollLTR: true,
              className: "fcc g10 my15 !justify-start !items-start",
              showCategories: false,
              searchParams,
              col,
              isAdmin,
              limit: 10,
              mongoUser,
              showFoundNum: false,
              top,
            }}
          />
        </PostsLTRScrollWrap>
      </div>
    </>
  );
}
