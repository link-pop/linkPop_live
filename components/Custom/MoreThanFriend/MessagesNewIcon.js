import { Plus } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function MessagesNewIcon() {
  const { t } = useTranslation();
  return (
    <div title={t("newMessage")}>
      <Plus className="w24 h24 cp hs" />
    </div>
  );
}
