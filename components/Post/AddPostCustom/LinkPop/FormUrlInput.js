"use client";

import Input from "@/components/ui/shared/Input/Input";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start FormUrlInput
const FormUrlInput = ({
  name,
  value,
  onChange,
  error,
  required = false,
  label = "URL",
  helperText = "Enter URL (e.g., google.com)",
  hideHelperText = false,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <Input
        label={t(label) || label}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 mb20 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        error={error}
        placeholder="example.com"
        helperText={!hideHelperText ? t(helperText) || helperText : undefined}
      />
    </div>
  );
};
// ? code end FormUrlInput

export default FormUrlInput;
