"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import Toggle from "@/components/ui/shared/Toggle/Toggle";
import {
  COLLECTIONS_USER_LISTS_HUB,
  COLLECTIONS_BOOKMARKS_HUB,
  COLLECTIONS_POST_LABELS_HUB,
} from "@/lib/utils/constants";

export default function CollectionsToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Determine current active tab based on pathname
  const getCurrentTab = () => {
    if (pathname.startsWith(COLLECTIONS_BOOKMARKS_HUB)) return 1;
    if (pathname.startsWith(COLLECTIONS_POST_LABELS_HUB)) return 2;
    if (pathname.startsWith(COLLECTIONS_USER_LISTS_HUB)) return 0;
    return 0; // Default to user-lists
  };

  const handleTabChange = (index) => {
    switch (index) {
      case 0:
        router.push(COLLECTIONS_USER_LISTS_HUB);
        break;
      case 1:
        router.push(COLLECTIONS_BOOKMARKS_HUB);
        break;
      case 2:
        router.push(COLLECTIONS_POST_LABELS_HUB);
        break;
      default:
        router.push(COLLECTIONS_USER_LISTS_HUB);
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
