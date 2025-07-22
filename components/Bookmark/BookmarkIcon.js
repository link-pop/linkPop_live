import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import { Bookmark } from "lucide-react";

export default function BookmarkIcon({ isBookmarked, className = "" }) {
  return (
    <Bookmark
      className={`${className} ${
        isBookmarked ? "fill-[--color-brand] invert" : BRAND_INVERT_CLASS
      }`}
    />
  );
} 