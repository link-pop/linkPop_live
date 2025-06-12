"use client";

import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/lib/actions/crud";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import StoreItemCard from "./StoreItemCard";

export default function UserStoreItems({
  mongoUser,
  visitedMongoUser,
  isOwner,
  isAdmin,
}) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  // Build query object based on search params
  const queryObject = useMemo(() => {
    const category = searchParams.get("category");

    const baseQuery = {
      createdBy: visitedMongoUser?._id,
    };

    // Add category filter if specified and not "all"
    if (category && category !== "all") {
      baseQuery.category = category;
    }

    return baseQuery;
  }, [searchParams, visitedMongoUser?._id]);

  const {
    data: storeItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storeItems", visitedMongoUser?._id, queryObject],
    queryFn: async () => {
      if (!visitedMongoUser?._id) return [];

      try {
        const items = await getAll({
          col: "storeitems",
          data: queryObject,
          sort: { createdAt: -1 },
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
    const category = searchParams.get("category");
    const isFiltered = category && category !== "all";

    return (
      <div className="fcc p20 text-muted-foreground">
        <p>
          {isFiltered
            ? t("noStoreItemsInCategory")
            : isOwner
            ? t("noStoreItemsYet")
            : t("noStoreItemsFromThisUser")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
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
