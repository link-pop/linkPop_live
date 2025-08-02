"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { X, GripVertical, HelpCircle, Check } from "lucide-react";
import Select from "@/components/ui/shared/Select/Select";

export default function QuizForm({
  quiz = null,
  onQuizChange,
  onClose,
  disabled = false,
}) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(quiz?.question || "");
  const [options, setOptions] = useState(
    quiz?.options?.length > 0 
      ? quiz.options.map((opt) => ({ text: opt.text, isCorrect: opt.isCorrect }))
      : [{ text: "", isCorrect: true }, { text: "", isCorrect: false }]
  );
  const [duration, setDuration] = useState(quiz?.duration || null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragRefs = useRef([]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text: value };
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { text: "", isCorrect: false }]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // If we removed the correct answer, make the first option correct
      if (newOptions.length > 0 && !newOptions.some(opt => opt.isCorrect)) {
        newOptions[0].isCorrect = true;
      }
      setOptions(newOptions);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  };

  const handleDragOver = (e, index) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragEnter = (e, index) => {
    if (disabled) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    if (disabled) return;
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    if (disabled || draggedIndex === null) return;
    e.preventDefault();

    if (draggedIndex !== dropIndex) {
      const newOptions = [...options];
      const draggedOption = newOptions[draggedIndex];
      newOptions.splice(draggedIndex, 1);
      newOptions.splice(dropIndex, 0, draggedOption);
      setOptions(newOptions);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Use useEffect to update quiz data when state changes
  useEffect(() => {
    const validOptions = options.filter((opt) => opt.text.trim() !== "");
    const correctOptions = validOptions.filter((opt) => opt.isCorrect);
    const isValidQuiz = question.trim() && validOptions.length >= 2 && correctOptions.length === 1;

    if (isValidQuiz) {
      const expiresAt = duration
        ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        : null;

      const quizData = {
        question: question.trim(),
        options: validOptions.map((option) => ({
          text: option.text.trim(),
          isCorrect: option.isCorrect,
          votes: 0,
          voters: [],
        })),
        duration,
        expiresAt,
        isActive: true,
      };

      onQuizChange(quizData);
    } else {
      onQuizChange(null);
    }
  }, [question, options, duration, onQuizChange]);

  const handleQuestionChange = (value) => {
    setQuestion(value);
  };

  const handleDurationChange = (value) => {
    const newDuration = value === "no-limit" ? null : parseInt(value);
    setDuration(newDuration);
  };

  const validOptions = options.filter((opt) => opt.text.trim() !== "");
  const correctOptions = validOptions.filter((opt) => opt.isCorrect);
  const isValid = question.trim() && validOptions.length >= 2 && correctOptions.length === 1;

  return (
    <div
      className={`wf bg-background border border-border rounded-lg p-4 mb-4 ${
        disabled ? "opacity-75" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[var(--color-brand)]" />
          <span className="font-medium">{t("quiz")}</span>
          {disabled && (
            <span className="text-sm text-muted-foreground">(Read-only)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {duration && (
            <span className="text-sm text-muted-foreground">
              {duration} {t("days")}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className={`w-6 h-6 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center transition-colors ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[var(--color-brand)]"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Input */}
      <div className="mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder={t("enterQuizQuestion")}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {options.map((option, index) => (
          <div
            key={index}
            ref={(el) => (dragRefs.current[index] = el)}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 ${
              draggedIndex === index
                ? "opacity-50 bg-muted"
                : dragOverIndex === index
                ? "bg-accent border-2 border-dashed border-[var(--color-brand)]"
                : "hover:bg-muted/50"
            } ${disabled ? "cursor-not-allowed" : "cursor-move"}`}
          >
            <div className="flex items-center gap-2 flex-1">
              <GripVertical
                className={`w-4 h-4 ${
                  disabled
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-muted-foreground cursor-grab active:cursor-grabbing"
                }`}
              />
              <button
                type="button"
                onClick={() => handleCorrectAnswerChange(index)}
                disabled={disabled}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  option.isCorrect
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-green-500"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {option.isCorrect && <Check className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={
                  index === 0
                    ? t("enterFirstOption")
                    : index === 1
                    ? t("enterSecondOption")
                    : t("enterAnotherOption")
                }
                disabled={disabled}
                className={`flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </div>
            <button
              type="button"
              onClick={() => removeOption(index)}
              className={`w-6 h-6 rounded-full border border-[var(--color-brand)] flex items-center justify-center transition-colors ${
                disabled || options.length <= 2
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[var(--color-brand)] hover:text-white"
              }`}
              disabled={disabled || options.length <= 2}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Option Button */}
      {options.length < 10 && (
        <button
          type="button"
          onClick={addOption}
          disabled={disabled}
          className={`text-sm font-medium mb-4 ${
            disabled
              ? "text-muted-foreground cursor-not-allowed"
              : "text-[var(--color-brand)] hover:text-[var(--color-brand)]"
          }`}
        >
          {t("addAnotherOption")}
        </button>
      )}

      {/* Duration Select */}
      <div className="mb-4">
        <Select
          label={t("quizDuration")}
          value={duration === null ? "no-limit" : duration.toString()}
          onValueChange={(value) => handleDurationChange(value)}
          disabled={disabled}
          version="new"
          options={[
            { label: t("noLimit"), value: "no-limit" },
            ...Array.from({ length: 30 }, (_, i) => i + 1).map((day) => ({
              label: `${day} ${t("days")}`,
              value: day.toString(),
            })),
          ]}
        />
      </div>

      {/* Validation Message */}
      {!isValid && (
        <div className="text-sm text-red-500">
          {!question.trim() && t("enterQuizQuestion")}
          {question.trim() && validOptions.length < 2 && t("atLeast2OptionsRequired")}
          {question.trim() && validOptions.length >= 2 && correctOptions.length !== 1 && t("exactlyOneCorrectAnswerRequired")}
        </div>
      )}
    </div>
  );
} 