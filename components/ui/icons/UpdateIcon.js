import { Pencil } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function UpdateIcon({ className }) {
  const { t } = useTranslation();
  return <div className={`px15 py5 wsn cp ${className}`}>{t("edit")}</div>;
  return <Pencil className="w16 h16 cp" />;
}
