"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function FeedTypeSwitch({ mongoUser }) {
  // Define feed types for the switch
  const feedTypes = [
    {
      value: "all",
      label: "all",
      query: {},
    },
    {
      value: "liked",
      label: "liked",
      query: {
        liked: true,
        userId: mongoUser?._id,
      },
    },
    {
      value: "subscribed",
      label: "subscribed",
      query: {
        // This will be handled differently in the query function
        subscribedOnly: true,
        userId: mongoUser?._id,
      },
    },
    {
      value: "purchased",
      label: "purchased",
      query: {
        // This will be handled differently in the query function
        purchasedOnly: true,
        userId: mongoUser?._id,
      },
    },
    {
      value: "paid",
      label: "paid",
      query: {
        // This will be handled differently in the query function
        paidOnly: true,
      },
    },
    {
      value: "free",
      label: "free",
      query: {
        // This will be handled differently in the query function
        freeOnly: true,
      },
    },
  ];

  // Custom query function for feed types
  const feedQueryFn = async () => {
    if (!mongoUser?._id) {
      return feedTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      // Get all posts
      const allPosts = await getAll({
        col: "feeds",
        data: {},
      });

      // Get liked posts
      const likedPostsIds = await getAll({
        col: "likes",
        data: {
          userId: mongoUser._id,
          postType: "feeds",
        },
      });

      const likedPostsCount = likedPostsIds?.length || 0;

      // Get subscribed users
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

      // Count posts from subscribed users
      const subscribedPostsCount =
        subscribedUserIds.length > 0
          ? allPosts.filter((post) => {
              // Get the post creator ID as string
              const postCreatorId = String(
                post.createdBy?._id || post.createdBy
              );
              // Check if this post creator is in our subscribed users list
              return subscribedUserIds.includes(postCreatorId);
            }).length
          : 0;

      // Get purchased posts
      const purchases = await getAll({
        col: "purchases",
        data: {
          userId: mongoUser._id,
          status: "completed",
          postType: "feeds",
        },
      });

      // Extract purchased post IDs as strings
      const purchasedPostIds = purchases.map((purchase) =>
        String(purchase.postId)
      );

      // Count purchased posts
      const purchasedPostsCount =
        purchasedPostIds.length > 0
          ? allPosts.filter((post) => {
              // Get the post ID as string
              const postId = String(post._id);
              // Check if this post is in our purchased posts list
              return purchasedPostIds.includes(postId);
            }).length
          : 0;

      // Count paid posts (posts with price > 0)
      const paidPostsCount = allPosts.filter(
        (post) => post.price && post.price > 0
      ).length;

      // Count free posts (posts with no price or price = 0)
      const freePostsCount = allPosts.filter(
        (post) => !post.price || post.price <= 0
      ).length;

      return {
        all: allPosts?.length || 0,
        liked: likedPostsCount,
        subscribed: subscribedPostsCount,
        purchased: purchasedPostsCount,
        paid: paidPostsCount,
        free: freePostsCount,
      };
    } catch (error) {
      console.error("Error fetching feed counts:", error);
      return feedTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      mongoUser={mongoUser}
      types={feedTypes}
      collection="feeds"
      queryKey={["feeds", "feedStats"]}
      queryFn={feedQueryFn}
      paramName="feedType"
      defaultType="all"
    />
  );
}
