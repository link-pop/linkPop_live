"use client";

import Input from "@/components/ui/shared/Input/Input";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start FormUniqueNameInput
const FormUniqueNameInput = ({ value, onChange, error, required = true }) => {
  const { t } = useTranslation();

  return (
    <div>
      <Input
        label={t("username")}
        type="text"
        name="name"
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        error={error}
        helperText={`${process.env.NEXT_PUBLIC_CLIENT_URL.replace(
          /http(s)?:\/\//,
          ""
        )}/${value.replace("@", "")}`}
        maxLength={100}
      />
    </div>
  );
};
// ? code end FormUniqueNameInput

export default FormUniqueNameInput;
