"use client";

import { Calendar } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesScheduledIcon = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <>
      <div title={t("scheduled")}>
        <Calendar
          className="w24 h24 cp hs"
          onClick={() => router.push("/my/queue?contentType=messages")}
        />
      </div>
    </>
  );
};

export default MessagesScheduledIcon;
