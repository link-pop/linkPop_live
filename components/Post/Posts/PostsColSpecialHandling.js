import { getAll } from "@/lib/actions/crud";

export const postsColSpecialHandling = async (
  col,
  searchParams,
  data,
  mongoUser
) => {
  // * GET ONLY THIS USER CHATROOMS
  if (["chatrooms"].includes(col.name)) {
    data = {
      chatRoomUsers: mongoUser._id,
    };
  }

  // * GET ALL NOTIFICATIONS BUT MESSAGES
  if (["notifications"].includes(col.name)) {
    data = {
      userId: mongoUser._id,
      ...(searchParams.notificationType &&
      searchParams.notificationType !== "all"
        ? { type: searchParams.notificationType }
        : { type: { $ne: "message" } }),
    };
  }

  // * HANDLE FEED FILTERING
  if (["feeds"].includes(col.name) && searchParams.feedType) {
    if (searchParams.feedType === "liked") {
      // Get all likes for this user with postType "feeds"
      const getLikedPosts = async () => {
        try {
          const likes = await getAll({
            col: "likes",
            data: {
              userId: mongoUser._id,
              postType: "feeds",
            },
          });

          // Extract postIds from likes
          const likedPostIds = likes.map((like) => like.postId);

          if (likedPostIds.length > 0) {
            // Add filter to only show posts that have been liked by the user
            data = {
              ...data,
              _id: { $in: likedPostIds },
            };
          } else {
            // If no likes, show no posts
            data = {
              ...data,
              _id: "no-posts", // This ensures no posts will match
            };
          }
        } catch (error) {
          console.error("Error fetching liked posts:", error);
        }
      };

      // Execute the function
      await getLikedPosts();
    } else if (searchParams.feedType === "subscribed") {
      // We'll handle this by getting all subscribed users first
      const getSubscribedPosts = async () => {
        try {
          // Get all subscriptions for this user
          const subscriptions = await getAll({
            col: "subscriptions",
            data: {
              createdBy: mongoUser._id,
              active: true,
            },
          });

          // Extract subscribedTo user IDs as strings
          const subscribedUserIds = subscriptions.map((sub) =>
            String(sub.subscribedTo._id)
          );

          // Add filter to only show posts from subscribed users
          if (subscribedUserIds.length > 0) {
            data = {
              ...data,
              createdBy: { $in: subscribedUserIds },
            };
          } else {
            // If no subscriptions, show no posts
            data = {
              ...data,
              _id: "no-posts", // This ensures no posts will match
            };
          }
        } catch (error) {
          console.error("Error fetching subscriptions:", error);
        }
      };

      // Execute the function
      await getSubscribedPosts();
    } else if (searchParams.feedType === "purchased") {
      // Handle purchased posts filtering
      const getPurchasedPosts = async () => {
        try {
          // Get all purchases for this user with postType "feeds" and completed status
          const purchases = await getAll({
            col: "purchases",
            data: {
              userId: mongoUser._id,
              postType: "feeds",
              status: "completed",
            },
          });

          // Extract postIds from purchases
          const purchasedPostIds = purchases.map((purchase) => purchase.postId);

          if (purchasedPostIds.length > 0) {
            // Add filter to only show posts that have been purchased by the user
            data = {
              ...data,
              _id: { $in: purchasedPostIds },
            };
          } else {
            // If no purchases, show no posts
            data = {
              ...data,
              _id: "no-posts", // This ensures no posts will match
            };
          }
        } catch (error) {
          console.error("Error fetching purchased posts:", error);
        }
      };

      // Execute the function
      await getPurchasedPosts();
    } else if (searchParams.feedType === "paid") {
      // Handle paid posts filtering (posts with price > 0)
      data = {
        ...data,
        price: { $gt: 0 },
      };
    } else if (searchParams.feedType === "free") {
      // Handle free posts filtering (posts with no price or price = 0)
      data = {
        ...data,
        $or: [
          { price: { $exists: false } },
          { price: null },
          { price: 0 },
          { price: { $lte: 0 } },
        ],
      };
    }
  }

  return data;
};
