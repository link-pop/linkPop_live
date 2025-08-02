"use server";

import { add } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function createQuiz(quizData, postId) {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    if (
      !quizData ||
      !quizData.question ||
      !quizData.options ||
      quizData.options.length < 2
    ) {
      throw new Error("Invalid quiz data");
    }

    // Validate that exactly one option is marked as correct
    const correctOptions = quizData.options.filter(option => option.isCorrect);
    if (correctOptions.length !== 1) {
      throw new Error("Quiz must have exactly one correct answer");
    }

    // Create quiz with postId reference
    const quiz = await add({
      col: "quizzes",
      data: {
        postId,
        question: quizData.question,
        options: quizData.options,
        duration: quizData.duration,
        expiresAt: quizData.expiresAt,
        isActive: true,
        totalVotes: 0,
      },
      revalidate: "/feeds",
    });

    if (quiz.error) {
      throw new Error(quiz.error);
    }

    return quiz;
  } catch (error) {
    console.error("❌ Error creating quiz:", error);
    throw error;
  }
} 