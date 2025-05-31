"use server";

import { getAll } from "./crud";

export async function getVideosForFeed({ skip = 0, limit = 10 } = {}) {
  try {
    console.log("🎥 getVideosForFeed called with:", { skip, limit });

    // First try to get ALL videos regardless of uploadedFrom
    const allVideos = await getAll({
      col: "attachments",
      data: {
        fileType: "video",
      },
      populate: {
        path: "createdBy",
        select: "name profileImage avatar _id",
      },
      skip,
      limit,
      sort: { createdAt: -1 },
    });

    console.log("🎥 All videos result:", allVideos);
    console.log("🎥 All videos length:", allVideos?.length);

    if (allVideos && !allVideos.error && allVideos.length > 0) {
      console.log("🎥 Found videos, checking each one...");

      allVideos.forEach((video, index) => {
        console.log(`🎥 Video ${index}:`, {
          _id: video._id,
          fileUrl: video.fileUrl ? "HAS URL" : "NO URL",
          fileType: video.fileType,
          uploadedFrom: video.uploadedFrom,
          createdBy: video.createdBy ? "HAS CREATOR" : "NO CREATOR",
          createdByName: video.createdBy?.name || "NO NAME",
          createdById: video.createdBy?._id || "NO ID",
        });
      });

      // For now, return ALL videos to see if any show up
      // Later we can filter by uploadedFrom: "feeds"
      const validVideos = allVideos.filter(
        (video) => video.fileUrl && video.createdBy
      );

      console.log("🎥 Valid videos count:", validVideos.length);

      return validVideos;
    }

    // If no videos found, try the original query with feeds filter
    console.log("🎥 No videos found, trying feeds-only query...");

    const feedVideos = await getAll({
      col: "attachments",
      data: {
        fileType: "video",
        uploadedFrom: "feeds",
      },
      populate: {
        path: "createdBy",
        select: "name profileImage avatar _id",
      },
      skip,
      limit,
      sort: { createdAt: -1 },
    });

    console.log("🎥 Feed videos result:", feedVideos);
    console.log("🎥 Feed videos length:", feedVideos?.length);

    if (feedVideos && !feedVideos.error) {
      const validFeedVideos = feedVideos.filter(
        (video) => video.fileUrl && video.createdBy && video.createdBy._id
      );

      console.log("🎥 Valid feed videos count:", validFeedVideos.length);
      return validFeedVideos;
    }

    console.log("🎥 No videos found at all");
    return [];
  } catch (error) {
    console.error("🎥 Error fetching videos for feed:", error);
    return [];
  }
}
