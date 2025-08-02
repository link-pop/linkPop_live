"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import Button2 from "@/components/ui/shared/Button/Button2";
import UserActionMenu from "@/components/ui/shared/UserActionMenu/UserActionMenu";
import { getPollVoters } from "@/lib/actions/getPollVoters";

export default function PollVotersDialog({ poll, optionIndex, onClose }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [voters, setVoters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optionText, setOptionText] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    loadVoters();
  }, [poll?._id, optionIndex]);

  const loadVoters = async () => {
    if (!poll?._id || optionIndex === undefined) return;

    setIsLoading(true);
    try {
      const result = await getPollVoters(poll._id, optionIndex);

      if (result.success) {
        setVoters(result.voters || []);
        setOptionText(result.optionText || "");
        setTotalVotes(result.totalVotes || 0);
      } else {
        throw new Error(result.error || "Failed to load voters");
      }
    } catch (error) {
      console.error("❌ Error loading poll voters:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || t("errorLoadingVoters"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-1 w-full max-w-md">
      {/* Header with poll option info */}
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-base">{optionText}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalVotes} {t("votes")} • {voters.length} {t("voters")}
        </div>
      </div>

      {/* Voters list */}
      <div className="mb-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand)]"></div>
          </div>
        ) : voters.length > 0 ? (
          <div className={`mb60`}>
            {voters.map((voter, index) => (
              <div
                key={voter._id || index}
                className={`px-2 py10 ${
                  index % 2 === 0 ? "bg-accent/50" : ""
                } hover:bg-accent`}
              >
                <div className="flex items-center justify-between">
                  <CreatedBy
                    createdBy={voter}
                    showName={true}
                    className="!gap-3"
                    imageClassName="!w-10 !h-10"
                    nameClassName="font-medium text-sm"
                    wrapClassName="cursor-default"
                  />
                  <UserActionMenu user={voter} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t("noVotersYet")}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-2">
        <Button2
          text={t("close")}
          variant="outline"
          onClick={onClose}
          className="flex-1"
        />
      </div>
    </div>
  );
}
