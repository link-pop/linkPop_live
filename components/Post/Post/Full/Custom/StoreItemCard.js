"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import PostOtherIcons from "@/components/Post/Post/Icons/PostOtherIcons";
import CarouselWithContent from "@/components/ui/shared/CarouselWithContent/CarouselWithContent";

export default function StoreItemCard({ item, mongoUser, isOwner, isAdmin }) {
  const { t } = useTranslation();

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

  return (
    <div className="bg-background border rounded-lg overflow-hidden hover:shadow-md transition-shadow por">
      {/* PostOtherIcons for update/delete functionality */}
      <PostOtherIcons
        col={{ name: "storeitems" }}
        post={item}
        postsPaginationType="infinite"
        isAdmin={isAdmin}
        isOwner={isOwner}
        showAdminIcons={true}
        mongoUser={mongoUser}
      />

      {/* CarouselWithContent - combines images/videos with content */}
      <CarouselWithContent
        files={carouselFiles}
        content={content}
        className="w-full"
        contentPosition="bottom"
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
