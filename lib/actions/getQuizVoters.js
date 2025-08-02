"use server";

import { getOne } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function getQuizVoters(quizId, optionIndex) {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    // Get the quiz with populated voters
    const quiz = await getOne({
      col: "quizzes",
      data: { _id: quizId },
    });

    if (!quiz || quiz.error) {
      throw new Error("Quiz not found");
    }

    const option = quiz.options[optionIndex];
    if (!option) {
      throw new Error("Quiz option not found");
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
    console.error("❌ Error getting quiz voters:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
