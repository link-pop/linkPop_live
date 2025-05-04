"use client";

import Input from "@/components/ui/shared/Input/Input";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start FormPixelIdInput
const FormPixelIdInput = ({ value, onChange, error }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4">
      <Input
        label={t("facebookPixelID") || "Facebook Pixel ID"}
        type="text"
        name="facebookPixelId"
        value={value}
        onChange={onChange}
        className="mt-1 block w-full"
        placeholder="123456789012345"
        helperText={
          t("addYourFacebookPixel") ||
          "Add your Facebook Pixel to build an audience."
        }
        error={error}
      />
    </div>
  );
};
// ? code end FormPixelIdInput

export default FormPixelIdInput;
