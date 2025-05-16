"use client";

import { useSearchParams } from "next/navigation";
import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";
import QueuedItemsList from "./QueuedItemsList";

export default function QueuedMessages({ mongoUser, onSelect, selectedItem }) {
  const searchParams = useSearchParams();

  const getMessagesQuery = {
    createdBy: mongoUser?._id,
    scheduleAt: { $exists: true, $ne: null, $gt: new Date() },
  };

  return (
    <div className="w100p">
      <PostsClientInfiniteScroll
        data={getMessagesQuery}
        isOwner={true}
        col={{ name: "chatmessages" }}
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
            type="chatmessages"
            isLoading={isLoading}
            onSelect={onSelect}
            selectedItem={selectedItem}
          />
        )}
      />
    </div>
  );
}
