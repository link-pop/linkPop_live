import { useTranslation } from "@/components/Context/TranslationContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function DeleteIcon({ className, onClick }) {
  const { t } = useTranslation();
  const handleClick = (e) => {
    // ! don't use stopPropagation
    onClick && onClick(e);
  };

  return (
    <div
      onClick={handleClick}
      className={`px15 py5 wsn cp ${className} hover:!bad`}
    >
      {t("delete")}
    </div>
  );
  return <X className={cn("w20 cp", className)} onClick={handleClick} />;
}
