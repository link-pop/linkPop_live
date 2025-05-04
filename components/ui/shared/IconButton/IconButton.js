"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { ICONBUTTON_CLASS } from "@/lib/utils/constants";

export default function IconButton({
  icon: Icon,
  onClick,
  title,
  size = 25,
  className = "",
  iconClassName = ICONBUTTON_CLASS,
  disabled = false,
}) {
  const { t } = useTranslation();

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`wfc ${
        disabled ? "pen opacity-30" : ""
      } ${className}`}
      title={t(title)}
    >
      <Icon size={size} className={iconClassName} />
    </div>
  );
}
