"use client";

import { TextSearch } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesInChatFindIcon = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <div title={t("searchMessages")} className="" onClick={onClick}>
      <TextSearch className="w24 h24 cursor-pointer hs" />
    </div>
  );
};

export default MessagesInChatFindIcon;
