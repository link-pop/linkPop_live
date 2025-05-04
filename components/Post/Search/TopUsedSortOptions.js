import { ArrowUpDown } from "lucide-react";

export function TopUsedSortOptions({ col, currentSort, handleSort, hasSort }) {
  if (hasSort) return null;

  const sortOptions = [
    col?.settings?.hasLikes ? { key: "likes", label: "likes" } : null,
    col?.settings?.hasViews ? { key: "views", label: "views" } : null,
  ];

  return sortOptions.map((option) => {
    if (!option) return null;

    return (
      <div
        key={option.key}
        className="opacity-40 cp fcc g5 px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
        onClick={() =>
          handleSort(
            currentSort === `${option.key}:-1`
              ? `${option.key}:1`
              : `${option.key}:-1`
          )
        }
      >
        <ArrowUpDown className="w15" />
        <span>{option.label}</span>
      </div>
    );
  });
}
