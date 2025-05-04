import { Eye, Heart } from "lucide-react";

export function TopUsedFilterOptions({
  col,
  currentFilters,
  handleFilter,
  hasFilter,
}) {
  if (hasFilter) return null;

  const filterOptions = [
    col?.settings?.hasLikes
      ? { key: "liked", label: "liked", icon: Heart }
      : null,
    col?.settings?.hasViews
      ? { key: "viewed", label: "viewed", icon: Eye }
      : null,
  ];

  return filterOptions.map((option) => {
    if (!option) return null;

    const currentValue = currentFilters[option.key];
    const Icon = option.icon;

    return (
      <div
        key={option.key}
        className="opacity-40 cp fcc g5 px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
        onClick={() =>
          handleFilter(option.key, currentValue === "true" ? "false" : "true")
        }
      >
        <Icon className="w15" />
        <span>{option.label}</span>
      </div>
    );
  });
}
