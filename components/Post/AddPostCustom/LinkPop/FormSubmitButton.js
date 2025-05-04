"use client";

import Button from "@/components/ui/shared/Button/Button2";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start FormSubmitButton
const FormSubmitButton = ({
  loading,
  isUpdateMode,
  isLoadingData = false,
  hasReachedLimits = false,
  isAdmin = false,
  className = "mxa",
  additionalText = "",
}) => {
  const { t } = useTranslation();

  const getButtonText = () => {
    if (loading) {
      return isUpdateMode
        ? t("updating") || "Updating..."
        : t("creating") || "Creating...";
    }

    if (isUpdateMode) {
      return additionalText
        ? `${t("update")} ${additionalText}`
        : t("update") || "Update";
    }

    return additionalText
      ? `${t("create")} ${additionalText}`
      : t("create") || "Create";
  };

  return (
    <Button
      type="submit"
      disabled={loading || isLoadingData || (hasReachedLimits && !isAdmin)}
      className={className}
    >
      {getButtonText()}
    </Button>
  );
};
// ? code end FormSubmitButton

export default FormSubmitButton;
