"use client";

import { getAll } from "@/lib/actions/crud";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll";

export default function FetchedTypeSwitch({ 
  mongoUser, 
  types = [], 
  collection = "feeds",
  queryKey = ["posts", "userStats"],
  queryFn = null,
  paramName = "type",
  defaultType = "all"
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // Use react-query to fetch and cache the counts
  const {
    data: counts = types.reduce((acc, type) => {
      acc[type.value] = 0;
      return acc;
    }, {}),
  } = useQuery({
    queryKey: [...queryKey, mongoUser?._id],
    queryFn: queryFn || (async () => {
      if (!mongoUser?._id)
        return types.reduce((acc, type) => {
          acc[type.value] = 0;
          return acc;
        }, {});

      try {
        const typeCounts = await Promise.all(
          types.map(type => 
            getAll({
              col: collection,
              data: {
                ...(type.query || {}),
                ...(type.value !== "all" ? {} : { createdBy: mongoUser._id }),
              },
            })
          )
        );

        return types.reduce((acc, type, index) => {
          acc[type.value] = typeCounts[index]?.length || 0;
          return acc;
        }, {});
      } catch (error) {
        console.error(`Error fetching ${collection}:`, error);
        return types.reduce((acc, type) => {
          acc[type.value] = 0;
          return acc;
        }, {});
      }
    }),
    enabled: Boolean(mongoUser?._id),
  });

  function handleTypeChange(value) {
    const params = new URLSearchParams(searchParams);

    if (value === defaultType) {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }

    router.push(`?${params.toString()}`);
  }

  const typeParam = searchParams.get(paramName);
  const currentValue = typeParam || defaultType;

  return (
    <div className={`maw600 wf oxa mt10 f g5`}>
      <HorizontalScroll className={`px10 pb8 g15`}>
        {types.map((type) => (
          <div
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
            className={`wsn py5 px15 br20 cp flex-shrink-0 ${
              currentValue === type.value ? "bg_brand" : "bg-accent text-foreground"
            }`}
          >
            <span className={`${BRAND_INVERT_CLASS}`}>
              {t(type.label)} {counts[type.value]}
            </span>
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
}
