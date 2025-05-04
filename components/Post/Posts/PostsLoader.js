import { Loader2 } from "lucide-react";

export default function PostsLoader({ isLoading, className = "", ...props }) {
  if (!isLoading) return null;
  return <Loader2 className={`mxa my15 animate-spin brand ${className}`} />;
}
