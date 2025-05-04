"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { skipUrlSearchParams } from "@/lib/utils/mongo/_settingsSkipUrlSearchParams";

export default function SearchParamsReset({
  col,
  searchParams = {},
  isButton = false,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleReset = () => {
    router.push(`${pathname}`);
  };

  // Count applied filters (excluding page)
  const appliedFiltersCount = Object.entries(searchParams).filter(
    ([key, value]) => value && !skipUrlSearchParams(col).includes(key)
  ).length;

  if (appliedFiltersCount === 0) {
    return null;
  }

  const filterText = `Clear ${appliedFiltersCount} Filter${
    appliedFiltersCount > 1 ? "s" : ""
  }`;

  if (isButton) {
    return (
      <Button className="wfc" onClick={handleReset} variant="outline">
        {filterText}
      </Button>
    );
  }

  return (
    <div
      onClick={handleReset}
      className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-200"
    >
      <span>{filterText}</span>
    </div>
  );
}
