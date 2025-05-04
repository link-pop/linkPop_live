import Button from "@/components/ui/shared/Button/Button2";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function AddFeedFormSubmitButton({
  formRef,
  onSubmit,
  buttonText,
  className = "z51 poa r15 -t55",
}) {
  const { t } = useTranslation();

  const handleClick = (e) => {
    e.preventDefault();
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  return (
    <Button onClick={handleClick} className={`${className}`}>
      {buttonText || t("post")}
    </Button>
  );
}
