"use client";

import { NotebookPen } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesNotesIcon = () => {
  const { t } = useTranslation();
  return (
    <div title={t("notes")}>
      <NotebookPen className="w24 h24 cursor-pointer hs" />
    </div>
  );
};

export default MessagesNotesIcon;
