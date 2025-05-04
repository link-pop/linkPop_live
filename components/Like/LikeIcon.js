import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import { Heart } from "lucide-react";

export default function LikeIcon({ isLiked, className = "" }) {
  return (
    <Heart
      className={`${className} ${
        isLiked ? "fill-[--color-brand] invert" : BRAND_INVERT_CLASS
      }`}
    />
  );
}
