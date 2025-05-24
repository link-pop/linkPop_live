"use client";

import { FloatingLabelInput } from "@/components/ui/shared/Input/FloatingLabelInput";
import useInputTypeNumberPreventScroll from "./useInputTypeNumberPreventScroll";
import useCharCount from "@/hooks/useCharCount";
import { useTranslation } from "@/components/Context/TranslationContext";

import { useRef, useEffect, useState } from "react";

export default function Input(props) {
  const { inputTypeNumberPreventScroll } = useInputTypeNumberPreventScroll();
  const { t } = useTranslation();
  const id = props.id || props.name;

  // Ref for scrolling
  const rootRef = useRef(null);
  // Track last error state to only scroll once per error occurrence
  const [hasScrolled, setHasScrolled] = useState(false);

  // Character count
  const charCount = useCharCount(props.value || "", props.maxLength);

  // Check if current value meets minLength requirement
  // Only show error if field has content but is less than minLength
  const isMinLengthError =
    props.minLength &&
    props.value &&
    props.value.length > 0 &&
    props.value.length < props.minLength;

  const hasError = !!props.error || !!isMinLengthError;

  useEffect(() => {
    if (hasError && !hasScrolled) {
      // Scroll only once per error occurrence
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHasScrolled(true);
    } else if (!hasError && hasScrolled) {
      // Reset scroll state when error disappears
      setHasScrolled(false);
    }
  }, [hasError, hasScrolled]);

  const handleChange = (e) => {
    const value = e.target.value;
    const type = props.type || "text";

    // For text inputs with maxLength
    if (type === "text") {
      // For maxLength validation
      if (props.maxLength !== undefined && value.length > props.maxLength) {
        e.target.value = value.slice(0, props.maxLength);
      }

      // We don't block typing for minLength - we just show an error message
      // This allows users to type freely but still see validation errors
    }

    // Allow any input for number fields - validation will happen on form submit
    // This prevents the frustrating experience of not being able to type values

    props.onChange?.(e);
  };

  // Generate minLength error message
  const minLengthErrorMessage = props.minLength
    ? t("minLengthError").replace("{count}", props.minLength)
    : "";

  return (
    <div ref={rootRef} className={`por wf ${props.className || ""}`}>
      {props?.prefix && <span className={`poa t5 l12`}>{props?.prefix}</span>}
      <FloatingLabelInput
        floating={true}
        id={id}
        onWheel={inputTypeNumberPreventScroll}
        {...props}
        className={props?.prefix ? "pl30" : ""}
        onChange={handleChange}
        label={props.label}
      />
      <div className={`px15 fr jcsb mt5`}>
        <div className={`fc`}>
          {(props.error || isMinLengthError) && (
            <span className={`text-red-500 fz12`}>
              {isMinLengthError ? minLengthErrorMessage : props.error}
            </span>
          )}
          {props.helperText && (
            <span className={`wbba gray fz12`}>{props.helperText}</span>
          )}
        </div>
        {props.maxLength && <span className={`gray fz12`}>{charCount}</span>}
      </div>
    </div>
  );
}
