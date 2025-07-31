"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { X, GripVertical, BarChart3 } from "lucide-react";
import Select from "@/components/ui/shared/Select/Select";

export default function PollForm({
  poll = null,
  onPollChange,
  onClose,
  disabled = false,
}) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(poll?.question || "");
  const [options, setOptions] = useState(
    poll?.options?.length > 0 ? poll.options.map((opt) => opt.text) : ["", ""]
  );
  const [duration, setDuration] = useState(poll?.duration || null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragRefs = useRef([]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
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

  // Use useEffect to update poll data when state changes
  useEffect(() => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    const isValidPoll = question.trim() && validOptions.length >= 2;

    if (isValidPoll) {
      const expiresAt = duration
        ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        : null;

      const pollData = {
        question: question.trim(),
        options: validOptions.map((text) => ({
          text: text.trim(),
          votes: 0,
          voters: [],
        })),
        duration,
        expiresAt,
        isActive: true,
      };

      onPollChange(pollData);
    } else {
      onPollChange(null);
    }
  }, [question, options, duration, onPollChange]);

  const handleQuestionChange = (value) => {
    setQuestion(value);
  };

  const handleDurationChange = (value) => {
    const newDuration = value === "no-limit" ? null : parseInt(value);
    setDuration(newDuration);
  };

  const isValid =
    question.trim() && options.filter((opt) => opt.trim() !== "").length >= 2;

  return (
    <div
      className={`wf bg-background border border-border rounded-lg p-4 mb-4 ${
        disabled ? "opacity-75" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--color-brand)]" />
          <span className="font-medium">{t("poll")}</span>
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
          placeholder={t("enterPollQuestion")}
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
              <input
                type="text"
                value={option}
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
          label={t("pollDuration")}
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
          {!question.trim() && t("enterPollQuestion")}
          {question.trim() &&
            options.filter((opt) => opt.trim() !== "").length < 2 &&
            t("atLeast2OptionsRequired")}
        </div>
      )}
    </div>
  );
}
