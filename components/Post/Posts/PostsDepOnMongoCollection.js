"use client";

import Post from "@/components/Post/Post/Post";
import NoPosts from "./NoPosts";
import PostsFoundNum from "./PostsFoundNum";
import PostsTopCustomContent from "./Custom/Top/PostsTopCustomContent";
import PostsBottomCustomContent from "./Custom/Bottom/PostsBottomCustomContent";

export default function PostsDepOnMongoCollection(props) {
  const {
    posts,
    postsFoundNum,
    col,
    isAdmin,
    postsPaginationType,
    hasMore,
    mongoUser,
    className = "",
    searchParams,
    showFoundNum,
    showCategories,
    isLoading,
    setCommentTextState,
    onReply,
  } = props;

  const renderPost = (post) => {
    let CustomPostComponent;
    try {
      // Import custom component based on collection name
      // name must look like this: eg: ArticlePost for "articles" collection
      const componentName = `${
        col.name.charAt(0).toUpperCase() + col.name.slice(1, -1)
      }Post`;

      // Use dynamic import with absolute path
      CustomPostComponent =
        require(`@/components/Post/Post/Custom/${componentName}`).default;

      return (
        <CustomPostComponent
          key={post._id}
          {...{
            post,
            mongoUser,
            col,
            isAdmin,
            postsPaginationType,
            setCommentTextState,
            onReply,
          }}
        />
      );
    } catch (error) {
      console.log(
        "Falling back to default Post for collection:",
        col.name,
        "Error:",
        error.message
      );
      // Fall back to default Post if custom component doesn't exist
      return (
        <Post
          key={post._id}
          {...{ post, mongoUser, col, isAdmin, postsPaginationType }}
        />
      );
    }
  };

  if (!posts) return null;

  return (
    <>
      <PostsTopCustomContent
        {...{ col, isAdmin, mongoUser, posts, showCategories }}
      />

      {!isLoading && showFoundNum && (
        <PostsFoundNum {...{ postsFoundNum, searchParams, col }} />
      )}
      <div className={`${className}`}>
        {posts.map((post) => renderPost(post))}
      </div>

      {/* // * commented to NOT show NoPosts on for comments (ugly)  */}
      {!isLoading && posts.length === 0 && !hasMore && <NoPosts {...{ col }} />}

      <PostsBottomCustomContent
        {...{ col, isAdmin, mongoUser, postsFoundNum }}
      />
    </>
  );
}
