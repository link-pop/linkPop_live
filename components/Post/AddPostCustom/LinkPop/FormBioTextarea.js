"use client";

import Textarea from "@/components/ui/shared/Textarea/Textarea";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start FormBioTextarea
const FormBioTextarea = ({
  value,
  onChange,
  error,
  name = "bio",
  maxLength = 500,
  rows = "3",
}) => {
  const { t } = useTranslation();

  // Choose label based on name prop
  const label =
    name === "bio" ? t("bio") || "Bio" : t("description") || "Description";

  return (
    <div>
      <Textarea
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        rows={rows}
        error={error}
        maxLength={maxLength}
      />
    </div>
  );
};
// ? code end FormBioTextarea

export default FormBioTextarea;
