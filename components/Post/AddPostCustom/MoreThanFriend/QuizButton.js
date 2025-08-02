"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { HelpCircle } from "lucide-react";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

export default function QuizButton({
  onQuizChange,
  currentQuiz,
  onToggleQuizForm,
}) {
  const { t } = useTranslation();

  const handleToggleQuiz = () => {
    if (currentQuiz) {
      // If quiz exists, clear it
      onQuizChange(null);
    } else {
      // Toggle quiz form visibility
      onToggleQuizForm();
    }
  };

  return (
    <div className="relative">
      <IconButton
        icon={HelpCircle}
        onClick={handleToggleQuiz}
        title="addQuiz"
        className={currentQuiz ? "text-blue-500" : ""}
      />
    </div>
  );
} 