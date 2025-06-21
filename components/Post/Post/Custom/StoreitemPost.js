"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import StoreItemCard from "../Full/Custom/StoreItemCard";
import StoreAuctionItemCard from "../Full/Custom/StoreAuctionItemCard";

export default function StoreitemPost({ post, mongoUser, isAdmin }) {
  const { t } = useTranslation();

  // Determine if the current user is the owner of this store item
  const isOwner = post?.createdBy?._id === mongoUser?._id;

  // If no post data, return null
  if (!post) {
    return null;
  }

  // Check if this is an auction item or regular store item
  const isAuctionItem = post.type === "auction";

  // Render the appropriate card component based on type
  if (isAuctionItem) {
    return (
      <StoreAuctionItemCard
        item={post}
        mongoUser={mongoUser}
        isOwner={isOwner}
        isAdmin={isAdmin}
      />
    );
  }

  // Default to regular store item card
  return (
    <StoreItemCard
      item={post}
      mongoUser={mongoUser}
      isOwner={isOwner}
      isAdmin={isAdmin}
    />
  );
}
