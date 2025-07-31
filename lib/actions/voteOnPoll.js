"use server";

import { update } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function voteOnPoll(pollId, optionIndex) {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    // Get the current poll to check if user has already voted
    const { getOne } = await import("./crud");
    const currentPoll = await getOne({
      col: "polls",
      data: { _id: pollId },
    });

    if (!currentPoll || currentPoll.error) {
      throw new Error("Poll not found");
    }

    // Check if poll is expired
    if (currentPoll.expiresAt && new Date() > new Date(currentPoll.expiresAt)) {
      throw new Error("Poll has expired");
    }

    // Check if user has already voted
    const hasVoted = currentPoll.options.some((option) =>
      option.voters?.includes(mongoUser._id)
    );

    if (hasVoted) {
      throw new Error("You have already voted on this poll");
    }

    // Update the poll with the vote
    const updatedOptions = currentPoll.options.map((option, index) => {
      if (index === optionIndex) {
        return {
          ...option,
          votes: option.votes + 1,
          voters: [...(option.voters || []), mongoUser._id],
        };
      }
      return option;
    });

    const updatedPoll = await update({
      col: "polls",
      data: { _id: pollId },
      update: {
        options: updatedOptions,
        totalVotes: currentPoll.totalVotes + 1,
      },
      revalidate: "/feeds",
      skipOwnershipCheck: true, // Polls should be votable by any authenticated user
    });

    if (updatedPoll.error) {
      throw new Error(updatedPoll.error);
    }

    return updatedPoll;
  } catch (error) {
    console.error("❌ Error voting on poll:", error);
    throw error;
  }
}
