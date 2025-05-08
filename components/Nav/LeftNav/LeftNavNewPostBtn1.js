import { ADD_DIRECTLINK_ROUTE, ADD_FEED_ROUTE } from "@/lib/utils/constants";
import { Plus, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";
import { SITE1, SITE2 } from "@/config/env";

export default function LeftNavNewPostBtn1({
  isMobile,
  isExpanded,
  showLabels,
  className = "",
}) {
  const href = SITE1 ? ADD_FEED_ROUTE : ADD_DIRECTLINK_ROUTE;
  const { t } = useTranslation();

  const buttonText = SITE1 ? t("newPost") : t("newDirectlink");

  return !isMobile ? (
    <Link
      href={href}
      className={`f fwn g8 p10 wf rounded-md transition-all duration-300 ease-in-out hover:bg-muted ${
        isExpanded ? "" : "fсс"
      } overflow-hidden ${className}`}
    >
      <div className="text-xl flex-shrink-0">
        <Plus className="w-6 h-6" />
      </div>
      <span
        className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
          isExpanded
            ? showLabels
              ? "opacity-100 translate-x-0 max-w-[200px]"
              : "opacity-0 -translate-x-4 max-w-0"
            : "opacity-0 max-w-0"
        }`}
      >
        {buttonText}
      </span>
    </Link>
  ) : (
    <Link href={href} className="flex flex-col items-center">
      <SquarePlus />
      <span className="text-xs mt-1">{buttonText}</span>
    </Link>
  );
}
