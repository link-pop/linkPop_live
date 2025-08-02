"use server";

import { getOne } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function getPollVoters(pollId, optionIndex) {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    // Get the poll with populated voters
    const poll = await getOne({
      col: "polls",
      data: { _id: pollId },
    });

    if (!poll || poll.error) {
      throw new Error("Poll not found");
    }

    const option = poll.options[optionIndex];
    if (!option) {
      throw new Error("Poll option not found");
    }

    // Get voter details if there are voters
    let voters = [];
    if (option.voters && option.voters.length > 0) {
      const { getAll } = await import("./crud");
      const voterUsers = await getAll({
        col: "users",
        data: { _id: { $in: option.voters } },
      });

      voters = voterUsers.map((user) => ({
        _id: user._id,
        name: user.name || user.displayName || "Anonymous User",
        profileImage: user.profileImage || user.avatar || "",
        username: user.username || "",
      }));
    }

    return {
      success: true,
      voters,
      optionText: option.text,
      totalVotes: option.votes,
    };
  } catch (error) {
    console.error("❌ Error getting poll voters:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
