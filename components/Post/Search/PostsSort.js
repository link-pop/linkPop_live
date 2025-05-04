"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Select from "@/components/ui/shared/Select/Select";
import ClearPostsSearchInputIcon from "./ClearPostsSearchInputIcon";
import { useGenerateSortableFields } from "@/hooks/useGenerateSortableFields";

// TODO sort must go first; try: http://localhost:3000/products?active=true&userId=677106570f75689ed2a1d800&title=cc&subtitle=gg&liked=true&sort=likes%3A-1
export default function PostsSort({
  col,
  searchParams,
  allFieldNamesAndTypesInCol,
}) {
  const router = useRouter();

  // Get the sort settings from collection, or use default createdAt:-1
  const defaultSort = col.settings?.sort
    ? `${Object.keys(col.settings.sort)[0]}:${
        Object.values(col.settings.sort)[0]
      }`
    : "createdAt:-1";

  const sortableFields = useGenerateSortableFields(
    col,
    allFieldNamesAndTypesInCol
  );
  // ???
  const [sort, setSort] = useState(searchParams?.sort || "");

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (sort) {
      newSearchParams.set("sort", sort);
    } else {
      newSearchParams.delete("sort");
    }

    router.push(`${col.name.toLowerCase()}?${newSearchParams.toString()}`);
  }, [sort]);

  // Transform sortableFields into the format needed for Select
  const selectOptions = sortableFields.flatMap((field) => [
    { value: `${field.value}:-1`, label: field.labelDesc },
    { value: `${field.value}:1`, label: field.labelAsc },
  ]);

  const handleClearState = () => {
    setSort("");
  };

  return (
    <div className="flex items-center">
      <Select
        value={sort}
        onValueChange={setSort}
        options={selectOptions}
        className="wf"
        label="Sort"
        placeholder="sort"
      />
      <ClearPostsSearchInputIcon
        searchParams={searchParams}
        nameInSearchParams="sort"
        handleClearState={handleClearState}
        col={col}
        className="mt20"
      />
    </div>
  );
}
