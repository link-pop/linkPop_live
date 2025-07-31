"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { BarChart3 } from "lucide-react";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

export default function PollButton({
  onPollChange,
  currentPoll,
  onTogglePollForm,
}) {
  const { t } = useTranslation();

  const handleTogglePoll = () => {
    if (currentPoll) {
      // If poll exists, clear it
      onPollChange(null);
    } else {
      // Toggle poll form visibility
      onTogglePollForm();
    }
  };

  return (
    <div className="relative">
      <IconButton
        icon={BarChart3}
        onClick={handleTogglePoll}
        title="addPoll"
        className={currentPoll ? "text-blue-500" : ""}
      />
    </div>
  );
}
