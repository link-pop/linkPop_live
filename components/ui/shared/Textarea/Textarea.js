"use client";

import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import {
  FloatingLabel,
  RegularLabel,
} from "@/components/ui/shared/Input/FloatingLabelInput";
import useInputMemo from "../Input/useInputMemo";
import useCharCount from "@/hooks/useCharCount";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function Textarea({
  label,
  id,
  required,
  name,
  onChange,
  defaultValue,
  value,
  maxLength,
  minLength,
  error,
  title,
  className,
  floating = true,
  ...props
}) {
  const { t } = useTranslation();
  const { onChange: onMemoChange, defaultValue: memoDefaultValue } =
    useInputMemo({
      name: name || id,
      onChange,
      defaultValue,
    });

  // Character count
  const charCount = useCharCount(value || memoDefaultValue() || "", maxLength);

  // Check if current value meets minLength requirement
  // Only show error if field has content but is less than minLength
  const isMinLengthError =
    minLength && value && value.length > 0 && value.length < minLength;

  // Generate minLength error message
  const minLengthErrorMessage = minLength
    ? t("minLengthError").replace("{count}", minLength)
    : "";

  const handleChange = (e) => {
    const value = e.target.value;

    // For maxLength validation
    if (maxLength !== undefined && value.length > maxLength) {
      e.target.value = value.slice(0, maxLength);
    }

    // We don't block typing for minLength - we just show an error message
    // This allows users to type freely but still see validation errors

    onMemoChange(e);
  };

  return (
    <div className={`por wf ${className || ""}`}>
      {title && <span className={`gray fz14`}>{title}</span>}

      {floating ? (
        <div className={`relative`}>
          <AutosizeTextarea
            id={id}
            name={name || id}
            required={required}
            onChange={handleChange}
            defaultValue={memoDefaultValue()}
            value={value}
            maxLength={maxLength}
            placeholder=" "
            className="peer bg-transparent"
            {...props}
          />
          <FloatingLabel
            // ! wfc - to NOT cover underlying placeholder
            className={`!wfc`}
            htmlFor={id}
            required={required}
          >
            {label}
          </FloatingLabel>
        </div>
      ) : (
        <div className="space-y-1.5 wf">
          {label && (
            <RegularLabel htmlFor={id} required={required}>
              {label}
            </RegularLabel>
          )}
          <AutosizeTextarea
            id={id}
            name={name || id}
            required={required}
            onChange={handleChange}
            defaultValue={memoDefaultValue()}
            value={value}
            maxLength={maxLength}
            {...props}
            className="bg-transparent"
          />
        </div>
      )}

      <div className={`px15 fr jcsb mt5`}>
        {(error || isMinLengthError) && (
          <span className={`text-red-500 fz12`}>
            {isMinLengthError ? minLengthErrorMessage : error}
          </span>
        )}
        {maxLength && <span className={`mla gray fz12`}>{charCount}</span>}
      </div>
    </div>
  );
}
