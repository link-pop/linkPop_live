"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import PostOtherIcons from "@/components/Post/Post/Icons/PostOtherIcons";
import StoreItemCardContent from "@/components/ui/shared/StoreItemCardContent/StoreItemCardContent";
import OutOfStockBadge from "@/components/ui/shared/StockIndicator/OutOfStockBadge";
import StoreAuctionItemCard from "./StoreAuctionItemCard";

export default function StoreItemCard({ item, mongoUser, isOwner, isAdmin }) {
  const { t } = useTranslation();

  // Check if this is an auction item
  if (item.type === "auction") {
    return (
      <StoreAuctionItemCard
        item={item}
        mongoUser={mongoUser}
        isOwner={isOwner}
        isAdmin={isAdmin}
      />
    );
  }

  // Continue with regular store item logic
  // Prepare files for carousel
  const carouselFiles =
    item.files?.map((file) => ({
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileName: file.fileName || "",
      _id: file._id,
    })) || [];

  // Prepare content for display
  const content = {
    title: item.title,
    text: item.text,
    price: item.price,
    category: item.category,
    storeItem: item, // Pass the full store item for cart functionality
  };

  const sizeFixClass = "maw575 !wf !mah575 !hf min-[600px]:miw575";
  const isOutOfStock = item.stock < 1;

  return (
    <div
      className={`${sizeFixClass} bg-background border rounded-lg overflow-hidden hover:shadow-md transition-shadow por`}
    >
      {/* PostOtherIcons for update/delete functionality */}
      {isOwner && (
        <PostOtherIcons
          col={{ name: "storeitems" }}
          post={item}
          postsPaginationType="infinite"
          isAdmin={isAdmin}
          isOwner={isOwner}
          showAdminIcons={true}
          mongoUser={mongoUser}
        />
      )}

      {isOutOfStock && (
        <div className="poa b10 r10 z-20">
          <OutOfStockBadge variant="compact" />
        </div>
      )}

      {/* StoreItemCardContent - combines images/videos with content */}
      <StoreItemCardContent
        files={carouselFiles}
        content={content}
        className="w-full"
        aspectRatio="aspect-square"
        showThumbnails={false}
        showIndicators={false}
        showArrows={carouselFiles.length > 1}
        imageClassName="w-full h-full object-cover"
        mongoUser={mongoUser}
        contentClassName="min-h-fit"
      />
    </div>
  );
}
