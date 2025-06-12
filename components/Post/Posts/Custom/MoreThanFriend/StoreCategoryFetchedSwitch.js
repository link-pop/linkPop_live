"use client";

import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/lib/actions/crud";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll";

export default function StoreCategoryFetchedSwitch({
  mongoUser,
  visitedUserId,
  collection = "storeitems",
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch user's store items to get actual categories
  const { data: storeItems = [] } = useQuery({
    queryKey: ["storeItems", "categories", visitedUserId],
    queryFn: async () => {
      if (!visitedUserId) return [];

      try {
        const items = await getAll({
          col: collection,
          data: { createdBy: visitedUserId },
          sort: { createdAt: -1 },
        });

        return items || [];
      } catch (error) {
        console.error("Error fetching store items for categories:", error);
        return [];
      }
    },
    enabled: Boolean(visitedUserId),
  });

  // Extract unique categories from store items and create category types
  const categoryTypes = useMemo(() => {
    // Get unique categories from store items
    const uniqueCategories = [
      ...new Set(
        storeItems
          .map((item) => item.category)
          .filter((category) => category && category.trim()) // Filter out empty/null categories
      ),
    ];

    // Create category types array starting with "all"
    const types = [
      {
        value: "all",
        label: "allCategories",
        query: { createdBy: visitedUserId },
      },
    ];

    // Add dynamic categories from user's store items
    uniqueCategories.forEach((category) => {
      types.push({
        value: category,
        label: category, // Use actual category name as label
        query: { createdBy: visitedUserId, category: category },
      });
    });

    return types;
  }, [storeItems, visitedUserId]);

  // Get counts for each category
  const categoryCounts = useMemo(() => {
    return categoryTypes.reduce((acc, type) => {
      if (type.value === "all") {
        acc[type.value] = storeItems.length;
      } else {
        acc[type.value] = storeItems.filter(
          (item) => item.category === type.value
        ).length;
      }
      return acc;
    }, {});
  }, [categoryTypes, storeItems]);

  function handleCategoryChange(value) {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }

    router.push(`?${params.toString()}`);
  }

  const categoryParam = searchParams.get("category");
  const currentValue = categoryParam || "all";

  // Don't render if no categories exist
  if (categoryTypes.length <= 1) {
    return null;
  }

  return (
    <div className={`maw600 wf oxa f g5`}>
      <HorizontalScroll className={`px10 pb8 g15`}>
        {categoryTypes.map((type) => (
          <div
            key={type.value}
            onClick={() => handleCategoryChange(type.value)}
            className={`wsn py5 px15 br20 cp flex-shrink-0 ${
              currentValue === type.value
                ? "bg_brand"
                : "bg-accent text-foreground"
            }`}
          >
            <span className={`${BRAND_INVERT_CLASS}`}>
              {type.value === "all" ? t(type.label) : type.label}{" "}
              {categoryCounts[type.value] || 0}
            </span>
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
}
