"use client";

import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/lib/actions/crud";
import { useTranslation } from "@/components/Context/TranslationContext";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import StoreItemCard from "./StoreItemCard";

export default function UserStoreItems({
  mongoUser,
  visitedMongoUser,
  isOwner,
  isAdmin,
}) {
  const { t } = useTranslation();

  const {
    data: storeItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storeItems", visitedMongoUser?._id],
    queryFn: async () => {
      if (!visitedMongoUser?._id) return [];

      try {
        const items = await getAll({
          col: "storeitems",
          data: {
            createdBy: visitedMongoUser._id,
          },
        });

        return items || [];
      } catch (error) {
        console.error("Error fetching store items:", error);
        return [];
      }
    },
    enabled: Boolean(visitedMongoUser?._id),
  });

  if (isLoading) {
    return <PostsLoader isLoading />;
  }

  if (error) {
    return (
      <div className="fcc p20 text-muted-foreground">
        <p>{t("errorLoadingStoreItems")}</p>
      </div>
    );
  }

  if (!storeItems.length) {
    return (
      <div className="fcc p20 text-muted-foreground">
        <p>{isOwner ? t("noStoreItemsYet") : t("noStoreItemsFromThisUser")}</p>
      </div>
    );
  }

  return (
    <div className="fc g15">
      {storeItems.map((item) => (
        <StoreItemCard
          key={item._id}
          item={item}
          mongoUser={mongoUser}
          isOwner={isOwner}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
