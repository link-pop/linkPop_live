"use server";

import { add } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function createPoll(pollData, postId) {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    if (
      !pollData ||
      !pollData.question ||
      !pollData.options ||
      pollData.options.length < 2
    ) {
      throw new Error("Invalid poll data");
    }

    // Create poll with postId reference
    const poll = await add({
      col: "polls",
      data: {
        postId,
        question: pollData.question,
        options: pollData.options,
        duration: pollData.duration,
        expiresAt: pollData.expiresAt,
        isActive: true,
        totalVotes: 0,
      },
      revalidate: "/feeds",
    });

    if (poll.error) {
      throw new Error(poll.error);
    }

    return poll;
  } catch (error) {
    console.error("❌ Error creating poll:", error);
    throw error;
  }
}
