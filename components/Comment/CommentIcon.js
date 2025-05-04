import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import { MessageSquare } from "lucide-react";

export default function CommentIcon({ className = "" }) {
  return (
    <MessageSquare className={`w20 h20 ${BRAND_INVERT_CLASS} ${className}`} />
  );
}
