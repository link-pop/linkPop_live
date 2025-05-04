import { ADD_LANDINGPAGE_ROUTE } from "@/lib/utils/constants";
import { Plus } from "lucide-react";
import Button2 from "@/components/ui/shared/Button/Button2";
import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";

// TODO !!!!!!! reuse LeftNavNewPostBtn, delete this
export default function LeftNavNewLandingPageBtn({
  isMobile,
  isExpanded,
  showLabels,
  className = "",
}) {
  const href = ADD_LANDINGPAGE_ROUTE;
  const { t } = useTranslation();

  const buttonText = t("newLandingPage");

  return !isMobile ? (
    <div
      className={`relative ${
        isExpanded ? "wf" : "w-10"
      } transition-all duration-300 ease-in-out ${className}`}
    >
      <Button2
        href={href}
        leftIcon={Plus}
        text=""
        className={`wsn ttu ${
          isExpanded ? "wf" : "ml5 w40 !h37 !p-0 flex justify-center"
        }`}
      >
        {isExpanded && (
          <span
            className={`transition-all duration-300 ease-in-out left-10 top-1/2 -translate-y-1/2 whitespace-nowrap ${
              showLabels
                ? "opacity-100 transform-none"
                : "opacity-0 -translate-x-4"
            }`}
          >
            {buttonText}
          </span>
        )}
      </Button2>
    </div>
  ) : (
    <Link href={href}>
      <Plus />
    </Link>
  );
}
