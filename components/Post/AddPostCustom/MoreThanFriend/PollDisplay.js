"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { BarChart3, Check } from "lucide-react";
import { voteOnPoll } from "@/lib/actions/voteOnPoll";

export default function PollDisplay({
  poll,
  postId,
  currentUser,
  onPollUpdate,
}) {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (optionIndex) => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      await voteOnPoll(poll._id, optionIndex);
      setSelectedOption(optionIndex);
      setHasVoted(true);
      // Trigger poll data refetch after successful vote
      if (onPollUpdate) {
        onPollUpdate();
      }
    } catch (error) {
      console.error("❌ Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-[var(--color-brand)]" />
        <span className="font-medium">{poll.question}</span>
        {poll.duration && (
          <span className="text-sm text-muted-foreground">
            {poll.duration} {t("days")}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {poll.options.map((option, index) => {
          const percentage = calculatePercentage(option.votes, totalVotes);
          const isSelected = selectedOption === index;
          const hasUserVoted = option.voters?.includes(currentUser?._id);

          return (
            <div
              key={index}
              className={`relative p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected || hasUserVoted
                  ? "border-[var(--color-brand)] bg-accent"
                  : "border-border hover:border-[var(--color-brand)]"
              }`}
              onClick={() => handleVote(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--color-brand)]" />
                  )}
                  <span className="text-sm">{option.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {option.votes} {t("votes")}
                  </span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[var(--color-brand)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t("totalVotes")}: {totalVotes}
        </span>
        {isExpired && <span className="text-red-500">{t("pollExpired")}</span>}
        {!isExpired && poll.expiresAt && (
          <span>{new Date(poll.expiresAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
