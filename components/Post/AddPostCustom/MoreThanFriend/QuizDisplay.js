"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { HelpCircle, Check, X } from "lucide-react";
import { voteOnQuiz } from "@/lib/actions/voteOnQuiz";
import { useContext } from "@/components/Context/Context";
import QuizVotersDialog from "@/components/ui/shared/QuizVotersDialog/QuizVotersDialog";

export default function QuizDisplay({
  quiz,
  postId,
  currentUser,
  isCreator = false,
  onQuizUpdate,
}) {
  const { t } = useTranslation();
  const { toastSet, dialogSet } = useContext();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Check if current user has already voted
  const checkUserVote = () => {
    if (!currentUser || !quiz) return null;

    for (let i = 0; i < quiz.options.length; i++) {
      if (quiz.options[i].voters?.includes(currentUser._id)) {
        return i;
      }
    }
    return null;
  };

  // Initialize vote status on component mount
  useEffect(() => {
    const userVoteIndex = checkUserVote();
    if (userVoteIndex !== null) {
      setSelectedOption(userVoteIndex);
      setHasVoted(true);
    }
  }, [quiz, currentUser]);

  const handleVote = async (optionIndex) => {
    if (isVoting || hasVoted) return;

    setIsVoting(true);
    try {
      await voteOnQuiz(quiz._id, optionIndex);
      setSelectedOption(optionIndex);
      setHasVoted(true);
      // Trigger quiz data refetch after successful vote
      if (onQuizUpdate) {
        onQuizUpdate();
      }
      toastSet({
        isOpen: true,
        title: t("voteSubmitted"),
      });
    } catch (error) {
      console.error("❌ Error voting on quiz:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message,
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleOptionClick = (optionIndex) => {
    if (isCreator) {
      // For creator, show voters dialog instead of voting
      dialogSet({
        isOpen: true,
        hasCloseIcon: true,
        showBtns: false,
        contentClassName: "max-w-md p-0",
        comp: (
          <QuizVotersDialog
            quiz={quiz}
            optionIndex={optionIndex}
            onClose={() => dialogSet({ isOpen: false })}
          />
        ),
      });
    } else {
      // For non-creators, vote normally
      handleVote(optionIndex);
    }
  };

  const totalVotes = quiz.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );
  const correctOption = quiz.options.findIndex((option) => option.isCorrect);

  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-[var(--color-brand)]" />
        <span className="font-medium">{t("quiz")}</span>
        {quiz.duration && (
          <span className="text-sm text-muted-foreground">
            {quiz.duration} {t("days")}
          </span>
        )}
      </div>

      {/* Question */}
      <h3 className="text-lg font-medium mb-4">{quiz.question}</h3>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {quiz.options.map((option, index) => {
          const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOption === index;
          const isCorrect = option.isCorrect;
          const showResults = hasVoted || isCreator;

          return (
            <div
              key={index}
              className={`relative p-3 rounded-md border-2 transition-all duration-200 ${
                isSelected
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10"
                  : "border-border hover:border-[var(--color-brand)]/50"
              } ${
                showResults && isCorrect
                  ? "border-green-500 bg-green-500/10"
                  : ""
              }`}
            >
              <button
                onClick={() => handleOptionClick(index)}
                disabled={isVoting || hasVoted}
                className={`w-full text-left flex items-center gap-3 ${
                  isVoting || hasVoted ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {/* Correct Answer Indicator */}
                {showResults && (
                  <div className="flex items-center justify-center w-6 h-6">
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}

                {/* Option Text */}
                <span className="flex-1">{option.text}</span>

                {/* Vote Count and Percentage */}
                {showResults && (
                  <div className="text-sm text-muted-foreground">
                    {option.votes} {t("votes")} ({percentage.toFixed(1)}%)
                  </div>
                )}
              </button>

              {/* Progress Bar */}
              {showResults && (
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCorrect ? "bg-green-500" : "bg-[var(--color-brand)]"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        {totalVotes} {t("totalVotes")}
        {hasVoted && (
          <span
            className={`ml-2 ${
              selectedOption === correctOption
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {selectedOption === correctOption ? t("correct") : t("incorrect")}
          </span>
        )}
      </div>
    </div>
  );
}
