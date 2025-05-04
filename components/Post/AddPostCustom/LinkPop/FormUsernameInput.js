"use client";

import Input from "@/components/ui/shared/Input/Input";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start FormUsernameInput
const FormUsernameInput = ({ value, onChange, error, required = true }) => {
  const { t } = useTranslation();

  return (
    <div>
      <Input
        label={t("name") || "Username"}
        type="text"
        name="username"
        prefix="@"
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        error={error}
        maxLength={100}
        required={required}
      />
    </div>
  );
};
// ? code end FormUsernameInput

export default FormUsernameInput;
