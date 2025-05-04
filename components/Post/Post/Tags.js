"use client";

import { useRouter } from "next/navigation";
import { useUrlParams } from "@/hooks/useUrlParams";

export default function Tags(props) {
  let { tags = [], col, className = "" } = props;

  if (!tags?.length || !tags?.[0]) return null;

  // Filter out invalid tags and ensure proper string format
  const validTags = tags.filter(
    (tag) => tag?.label && typeof tag.label === "string"
  );
  if (!validTags.length) return null;

  const router = useRouter();
  const urlParams = useUrlParams();
  const currentSearchTag = urlParams.get("tags");

  // ! drop all other search params and only search for tag
  const searchTag = (tag) => {
    router.push(`/${col.name}?tags=${tag}`);
  };

  const activeTag =
    col.name === "products" ? "br8 bg_brand white opacity-[.4]" : "";
  const activeTagHover =
    // col.name === "products" ? "hover:br8 hover:bg_brand hover:white" : "";
    col.name === "products" ? "hover:animate-pulse" : "";

  return (
    <div {...props} className={`br8 f g8 ${className}`}>
      {validTags.map((tag, index) => {
        const isHighlighted = currentSearchTag === tag.label;

        return (
          <span
            key={index}
            className={`
              px-2 py-1 text-sm cursor-pointer ${activeTagHover} 
              ${
                isHighlighted
                  ? // ? "bg_brand white"
                    // : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    activeTag
                  : "brand hover:text-blue-800"
              } 
              transition-colors
            `}
            onClick={() => searchTag(tag.label)}
          >
            {tag.label.charAt(0).toUpperCase() + tag.label.slice(1)}
          </span>
        );
      })}
    </div>
  );
}
