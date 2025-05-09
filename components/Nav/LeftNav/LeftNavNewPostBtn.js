import { ADD_DIRECTLINK_ROUTE, ADD_FEED_ROUTE } from "@/lib/utils/constants";
import { Plus, SquarePlus } from "lucide-react";
import Button2 from "@/components/ui/shared/Button/Button2";
import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";
import { SITE1, SITE2 } from "@/config/env";

export default function LeftNavNewPostBtn({
  isMobile,
  isExpanded,
  showLabels,
  className = "",
}) {
  const href = SITE1 ? ADD_FEED_ROUTE : ADD_DIRECTLINK_ROUTE;
  const { t } = useTranslation();

  const buttonText = SITE1 ? t("newPost") : t("newDirectlink");
  // Only show text on mobile if it's SITE2
  const showMobileText = SITE2 || !isMobile;

  return !isMobile ? (
    <div
      className={`relative ${
        isExpanded ? "wf" : "w-10"
      } transition-all duration-300 ease-in-out`}
    >
      <Button2
        href={href}
        leftIcon={Plus}
        text=""
        className={`wsn ttu ${
          isExpanded ? "wf" : "ml5 w40 !h37 !p-0 flex justify-center"
        } ${className}`}
      >
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
      </Button2>
    </div>
  ) : (
    <Link href={href} className="flex flex-col items-center">
      <SquarePlus />
      {showMobileText && <span className="text-xs mt-1">{buttonText}</span>}
    </Link>
  );
}
