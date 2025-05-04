"use client";

import TipTap from "../../../ui/shared/TipTap/TipTap";

export default function TipTapInput({
  settingsPosition,
  name,
  isSettingsVisible,
  defaultValue = "",
  placeholder,
  required = false,
  label,
  className,
  editorClassName,
  tipTapInputContent,
  setTipTapInputContent,
}) {
  // Helper function to check if content is empty (handles HTML tags)
  const isTipTapInputContentEmpty = (html) => {
    // Remove HTML tags and trim whitespace
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text === "";
  };

  const handleTipTapInputContentChange = (newTipTapInputContent) => {
    setTipTapInputContent(newTipTapInputContent);

    // Manually trigger validation on the hidden input
    const inputElement = document.querySelector(`input[name="${name}"]`);
    if (inputElement) {
      inputElement.setCustomValidity(
        required && isTipTapInputContentEmpty(newTipTapInputContent)
          ? "This field is required"
          : ""
      );
      // Trigger validation
      inputElement.reportValidity();
    }
  };

  return (
    <div className={`oxh !pr30 maw600 wf relative ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="bg_white zi2 absolute -top-2 left-3 px-1 fz11 text-muted-foreground"
        >
          {label}
        </label>
      )}
      <input
        className="sr-only c"
        name={name}
        value={tipTapInputContent}
        onChange={(e) => handleTipTapInputContentChange(e.target.value)}
        required={required}
        // Add custom validation
        onInvalid={(e) => {
          if (required && isTipTapInputContentEmpty(tipTapInputContent)) {
            e.target.setCustomValidity("This field is required");
          }
        }}
      />
      <TipTap
        settingsPosition={settingsPosition}
        isSettingsVisible={isSettingsVisible}
        content={tipTapInputContent}
        onChange={handleTipTapInputContentChange}
        placeholder={placeholder}
        editorClassName={`wf ${editorClassName}`}
      />
    </div>
  );
}
