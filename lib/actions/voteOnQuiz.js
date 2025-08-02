"use server";

import { getOne, update } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function voteOnQuiz(quizId, optionIndex) {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    // Get the current quiz to check if user has already voted
    const currentQuiz = await getOne({
      col: "quizzes",
      data: { _id: quizId },
    });

    if (!currentQuiz || currentQuiz.error) {
      throw new Error("Quiz not found");
    }

    // Check if quiz is expired
    if (currentQuiz.expiresAt && new Date() > new Date(currentQuiz.expiresAt)) {
      throw new Error("Quiz has expired");
    }

    // Check if user has already voted
    const hasVoted = currentQuiz.options.some((option) =>
      option.voters.includes(mongoUser._id)
    );

    if (hasVoted) {
      throw new Error("You have already voted on this quiz");
    }

    // Update the quiz with the vote
    const updatedOptions = currentQuiz.options.map((option, index) => {
      if (index === optionIndex) {
        return {
          ...option,
          votes: option.votes + 1,
          voters: [...option.voters, mongoUser._id],
        };
      }
      return option;
    });

    const updatedQuiz = await update({
      col: "quizzes",
      data: { _id: quizId },
      update: {
        options: updatedOptions,
        totalVotes: currentQuiz.totalVotes + 1,
      },
      skipOwnershipCheck: true, // Quizzes should be votable by any authenticated user
    });

    if (updatedQuiz.error) {
      throw new Error(updatedQuiz.error);
    }

    return updatedQuiz;
  } catch (error) {
    console.error("❌ Error voting on quiz:", error);
    throw error;
  }
} 