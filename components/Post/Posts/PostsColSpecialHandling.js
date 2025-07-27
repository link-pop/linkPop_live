import { getAll } from "@/lib/actions/crud";
import { checkAuctionNotificationPaymentStatus } from "@/lib/utils/mongo/checkAuctionNotificationPaymentStatus";

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

    // Handle chatroom type filtering (all/unread)
    if (searchParams.chatroomType === "unread") {
      // Get all chatrooms for this user
      const getAllChatroomsAndFilter = async () => {
        try {
          const allChatrooms = await getAll({
            col: "chatrooms",
            data: {
              chatRoomUsers: mongoUser._id,
            },
          });

          // Filter chatrooms that have unread messages for this user
          const chatroomsWithUnread = allChatrooms.filter((chatroom) => {
            // Handle both Map (from MongoDB) and Object (from JSON serialization)
            let userUnreadCount = 0;

            if (chatroom.unreadCounts) {
              if (typeof chatroom.unreadCounts.get === "function") {
                // It's a Map instance
                userUnreadCount =
                  chatroom.unreadCounts.get(mongoUser._id.toString()) || 0;
              } else if (typeof chatroom.unreadCounts === "object") {
                // It's a plain object (serialized Map)
                userUnreadCount =
                  chatroom.unreadCounts[mongoUser._id.toString()] || 0;
              }
            }

            return userUnreadCount > 0;
          });

          // Extract the IDs of chatrooms with unread messages
          const unreadChatroomIds = chatroomsWithUnread.map(
            (chatroom) => chatroom._id
          );

          if (unreadChatroomIds.length > 0) {
            // Add filter to only show chatrooms with unread messages
            data = {
              ...data,
              _id: { $in: unreadChatroomIds },
            };
          } else {
            // If no unread chatrooms, show no chatrooms
            data = {
              ...data,
              _id: "no-chatrooms", // This ensures no chatrooms will match
            };
          }
        } catch (error) {
          console.error("❌ Error fetching unread chatrooms:", error);
        }
      };

      // Execute the function
      await getAllChatroomsAndFilter();
    }
  }

  // * GET ALL NOTIFICATIONS BUT MESSAGES
  if (["notifications"].includes(col.name)) {
    const notificationFilter =
      searchParams.notificationType && searchParams.notificationType !== "all"
        ? searchParams.notificationType === "auction"
          ? {
              type: {
                $in: [
                  "auction_won",
                  "auction_sold",
                  "auction_ended",
                  "auction_outbid",
                ],
              },
            }
          : { type: searchParams.notificationType }
        : { type: { $ne: "message" } };

    data = {
      userId: mongoUser._id,
      ...notificationFilter,
    };
  }

  // * HANDLE STOREITEMS FILTERING
  if (["storeitems"].includes(col.name) && searchParams.storeitemType) {
    console.log("🔍 Storeitems filtering:", {
      colName: col.name,
      storeitemType: searchParams.storeitemType,
      searchParams: searchParams,
    });

    if (searchParams.storeitemType === "regular") {
      // Filter for regular store items (not auction type)
      data = {
        ...data,
        $or: [
          { type: { $exists: false } }, // Items without type field
          { type: null }, // Items with null type
          { type: { $ne: "auction" } }, // Items with type not equal to "auction"
        ],
      };
    } else if (searchParams.storeitemType === "auction") {
      // Filter for auction store items
      data = {
        ...data,
        type: "auction",
      };
    }
    // If storeitemType is "all", no additional filtering is needed
  }

  // * HANDLE DIRECTLINKS AND LANDINGPAGES FILTERING
  if (["directlinks", "landingpages"].includes(col.name) && searchParams.type) {
    if (searchParams.type === "active") {
      // Filter for active directlinks/landingpages
      data = {
        ...data,
        active: true,
      };
    } else if (searchParams.type === "inactive") {
      // Filter for inactive directlinks/landingpages
      data = {
        ...data,
        active: false,
      };
    }
    // If type is "all", no additional filtering is needed
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

  // Handle post label filtering
  if (["feeds"].includes(col.name) && searchParams.postLabel) {
    const getPostLabelPosts = async () => {
      try {
        // Get the post label list
        const postLabelList = await getAll({
          col: "userlists",
          data: {
            _id: searchParams.postLabel,
            targetCollection: "postlabels",
            active: true,
          },
        });

        if (postLabelList && postLabelList.length > 0) {
          const list = postLabelList[0];

          if (list.postLabelIds && list.postLabelIds.length > 0) {
            // postLabelIds contains feed post IDs directly (not post label IDs)
            // Add filter to only show posts that are in this post label list
            data = {
              ...data,
              _id: { $in: list.postLabelIds },
            };
            console.log("🔍 PostsColSpecialHandling - Filtering by post label list:", searchParams.postLabel, "with", list.postLabelIds.length, "posts");
          } else {
            // If no post label IDs in the list, show no posts
            data = {
              ...data,
              _id: "no-posts", // This ensures no posts will match
            };
          }
        } else {
          // If post label list not found, show no posts
          data = {
            ...data,
            _id: "no-posts", // This ensures no posts will match
          };
        }
      } catch (error) {
        console.error("❌ Error fetching post label posts:", error);
        // If error, show no posts
        data = {
          ...data,
          _id: "no-posts", // This ensures no posts will match
        };
      }
    };

    // Execute the function
    await getPostLabelPosts();
  }

  return data;
};

// * POST-PROCESSING FUNCTION FOR NOTIFICATIONS WITH AUCTION PAYMENT STATUS
export const postsColPostProcessing = async (posts, col, mongoUser) => {
  // * CHECK AUCTION PAYMENT STATUS FOR NOTIFICATIONS
  if (["notifications"].includes(col.name) && mongoUser?._id) {
    try {
      const processedNotifications =
        await checkAuctionNotificationPaymentStatus(posts, mongoUser._id);
      return processedNotifications;
    } catch (error) {
      console.error("❌ Error processing auction payment status:", error);
      return posts; // Return original posts if processing fails
    }
  }

  return posts;
};
