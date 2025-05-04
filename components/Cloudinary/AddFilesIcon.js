"use client";

import { Image } from "lucide-react";
import { useTranslation } from "../Context/TranslationContext";
import { ICONBUTTON_CLASS } from "@/lib/utils/constants";

export default function AddFilesIcon({ onClick, className = "" }) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className={`AddFilesIcon ${ICONBUTTON_CLASS} ${className}`}
      title={t("addFiles")}
    >
      <Image size={25} />
    </div>
  );
}
