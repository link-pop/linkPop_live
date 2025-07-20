"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import Toggle from "@/components/ui/shared/Toggle/Toggle";
import {
  COLLECTIONS_ROUTE,
  COLLECTIONS_BOOKMARKS_ROUTE,
  COLLECTIONS_POST_LABELS_ROUTE,
} from "@/lib/utils/constants";

export default function CollectionsToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Determine current active tab based on pathname
  const getCurrentTab = () => {
    if (pathname.startsWith(COLLECTIONS_ROUTE)) return 0;
    if (pathname.startsWith(COLLECTIONS_BOOKMARKS_ROUTE)) return 1;
    if (pathname.startsWith(COLLECTIONS_POST_LABELS_ROUTE)) return 2;
    return 0; // Default to user-lists
  };

  const handleTabChange = (index) => {
    switch (index) {
      case 0:
        router.push(COLLECTIONS_ROUTE);
        break;
      case 1:
        router.push(COLLECTIONS_BOOKMARKS_ROUTE);
        break;
      case 2:
        router.push(COLLECTIONS_POST_LABELS_ROUTE);
        break;
      default:
        router.push(COLLECTIONS_ROUTE);
    }
  };

  const labels = [
    { text: "userLists", className: "" },
    { text: "bookmarks", className: "" },
    { text: "postLabels", className: "" },
  ];

  const contents = [null, null, null]; // No content needed for navigation toggle

  return (
    <div className="w-full">
      <Toggle
        labels={labels}
        contents={contents}
        initialTab={getCurrentTab()}
        onTabChange={handleTabChange}
        className="w-full"
      />
    </div>
  );
}
