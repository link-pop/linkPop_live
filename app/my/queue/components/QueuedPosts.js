"use client";

import { useSearchParams } from "next/navigation";
import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";
import QueuedItemsList from "./QueuedItemsList";

export default function QueuedPosts({ mongoUser, onSelect, selectedItem }) {
  const searchParams = useSearchParams();
  const postType = searchParams.get("type") || "all";

  const getPostsQuery = {
    createdBy: mongoUser?._id,
    scheduleAt: { $exists: true, $ne: null, $gt: new Date() },
  };

  // If using specific filters based on postType
  if (postType && postType !== "all") {
    // This would be enhanced based on the actual post type filters
  }

  return (
    <div className="w100p">
      <PostsClientInfiniteScroll
        data={getPostsQuery}
        isOwner={true}
        col={{ name: "feeds" }}
        mongoUser={mongoUser}
        limit={10}
        loadPostsOnce={false}
        sort={{ scheduleAt: 1 }} // Sort by scheduleAt date (ascending)
        className="w100p"
        showFoundNum={false}
        showCategories={false}
        top={null}
        postsPaginationType="infinite"
        customPostsComponent={({ posts, isLoading }) => (
          <QueuedItemsList
            items={posts}
            type="feeds"
            isLoading={isLoading}
            onSelect={onSelect}
            selectedItem={selectedItem}
          />
        )}
      />
    </div>
  );
}
