"use client";

import { useState, useEffect, useCallback } from "react";
import { getOne } from "@/lib/actions/crud";

export default function useQuizDataWithRefetch(quizId) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setQuiz(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const quizData = await getOne({
        col: "quizzes",
        data: { _id: quizId },
      });

      if (quizData.error) {
        setError(quizData.error);
      } else {
        setQuiz(quizData);
      }
    } catch (err) {
      console.error("❌ Error fetching quiz:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return { quiz, loading, error, refetch: fetchQuiz };
} 