import Button from "@/components/ui/shared/Button/Button2";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function AddFeedFormSubmitButton({
  formRef,
  onSubmit,
  buttonText,
  className = "",
  isLoading = false,
}) {
  const { t } = useTranslation();

  const handleClick = (e) => {
    e.preventDefault();
    // Don't submit if loading
    if (isLoading) {
      console.log("Submit button blocked - form is loading");
      return;
    }

    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={`!fixed z99 cx l100 wfc ml195 !t10 ${className}`}
    >
      {buttonText || t("post")}
    </Button>
  );
}
