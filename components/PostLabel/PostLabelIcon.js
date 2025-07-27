import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import { Tag } from "lucide-react";

export default function PostLabelIcon({ isLabeled, className = "" }) {
  return (
    <Tag
      className={`${className} ${
        isLabeled ? "fill-[--color-brand] invert" : BRAND_INVERT_CLASS
      } transition-colors`}
    />
  );
}
