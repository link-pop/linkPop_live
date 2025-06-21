"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function StoreitemsTypeSwitch({ mongoUser }) {
  // Define store item types for the switch
  const storeitemTypes = [
    {
      value: "all",
      label: "all",
      query: {},
    },
    {
      value: "regular",
      label: "regular",
      query: {
        type: { $ne: "auction" }, // Not auction type
      },
    },
    {
      value: "auction",
      label: "auctions",
      query: {
        type: "auction",
      },
    },
  ];

  // Custom query function for store item types
  const storeitemsQueryFn = async () => {
    if (!mongoUser?._id) {
      return storeitemTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      // Get all store items
      const allStoreItems = await getAll({
        col: "storeitems",
        data: {},
      });

      // Count regular store items (not auction type)
      const regularStoreItemsCount = allStoreItems.filter(
        (item) => !item.type || item.type !== "auction"
      ).length;

      // Count auction store items
      const auctionStoreItemsCount = allStoreItems.filter(
        (item) => item.type === "auction"
      ).length;

      return {
        all: allStoreItems?.length || 0,
        regular: regularStoreItemsCount,
        auction: auctionStoreItemsCount,
      };
    } catch (error) {
      console.error("Error fetching store items counts:", error);
      return storeitemTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      mongoUser={mongoUser}
      types={storeitemTypes}
      collection="storeitems"
      queryKey={["storeitems", "storeitemStats"]}
      queryFn={storeitemsQueryFn}
      paramName="storeitemType"
      defaultType="all"
    />
  );
}
