"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const dynamic = "force-dynamic";

// Get store owner order count (orders where user is the store owner with pending/processing status)
export const getStoreOwnerOrderCount = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return 0;
    }

    const orders = await getAll({
      col: "storeitemsorders",
      data: {
        storeOwner: mongoUser._id,
        orderStatus: { $in: ["pending", "processing"] },
        paymentStatus: "paid",
      },
    });

    return orders?.length || 0;
  } catch (error) {
    console.error("Error getting store owner order count:", error);
    return 0;
  }
};
