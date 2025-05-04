"use client";

import FetchedTypeSwitch from "./FetchedTypeSwitch";
import { getAll } from "@/lib/actions/crud";

export default function PostsFetchedTypeSwitch({ mongoUser }) {
  // Define post types for the switch
  const postTypes = [
    {
      value: "all",
      label: "all",
      query: {
        createdBy: mongoUser?._id,
      },
    },
    {
      value: "visible",
      label: "visible",
      query: {
        createdBy: mongoUser?._id,
        active: true,
        $and: [
          // Not scheduled or schedule date passed
          {
            $or: [
              { scheduleAt: { $exists: false } },
              { scheduleAt: null },
              { scheduleAt: { $lte: new Date() } },
            ],
          },
          // Not expired
          {
            $or: [
              { expirationPeriod: { $exists: false } },
              { expirationPeriod: null },
              {
                $expr: {
                  $gt: [
                    {
                      $add: [
                        {
                          $cond: {
                            if: {
                              $and: [
                                { $ne: ["$scheduleAt", null] },
                                {
                                  $ne: [
                                    { $type: "$scheduleAt" },
                                    "missing",
                                  ],
                                },
                              ],
                            },
                            then: "$scheduleAt",
                            else: "$createdAt",
                          },
                        },
                        {
                          $multiply: [
                            "$expirationPeriod",
                            24 * 60 * 60 * 1000,
                          ],
                        },
                      ],
                    },
                    new Date(),
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    {
      value: "scheduled",
      label: "scheduled",
      query: {
        createdBy: mongoUser?._id,
        $or: [
          // Scheduled posts
          {
            scheduleAt: { $exists: true, $ne: null, $gt: new Date() },
          },
          // Expiring posts that also have schedule
          {
            $and: [
              { expirationPeriod: { $exists: true, $ne: null } },
              { scheduleAt: { $exists: true, $ne: null, $gt: new Date() } },
            ],
          },
        ],
      },
    },
    {
      value: "expiring",
      label: "expiring",
      query: {
        createdBy: mongoUser?._id,
        $or: [
          // Posts with expiration
          {
            expirationPeriod: { $exists: true, $ne: null },
          },
          // Scheduled posts that also have expiration
          {
            $and: [
              { scheduleAt: { $exists: true, $ne: null, $gt: new Date() } },
              { expirationPeriod: { $exists: true, $ne: null } },
            ],
          },
        ],
      },
    },
    {
      value: "archived",
      label: "archived",
      query: {
        createdBy: mongoUser?._id,
        active: false,
      },
    },
  ];

  // Custom query function for posts
  const postsQueryFn = async () => {
    if (!mongoUser?._id) {
      return postTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    const now = new Date();

    try {
      const typeCounts = await Promise.all(
        postTypes.map(type => 
          getAll({
            col: "feeds",
            data: type.query,
          })
        )
      );

      return postTypes.reduce((acc, type, index) => {
        acc[type.value] = typeCounts[index]?.length || 0;
        return acc;
      }, {});
    } catch (error) {
      console.error("Error fetching posts:", error);
      return postTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      mongoUser={mongoUser}
      types={postTypes}
      collection="feeds"
      queryKey={["posts", "userStats"]}
      queryFn={postsQueryFn}
      paramName="type"
      defaultType="all"
    />
  );
}
