import { cn } from "@/lib/utils";

export default function TextShortener({ text, className, length = 100 }) {
  return (
    <div className={cn("line-clamp-3", className)}>
      {text?.replace(/<[^>]*>/g, "").slice(0, length)}
      {text?.length > length ? "..." : ""}
    </div>
  );
}
