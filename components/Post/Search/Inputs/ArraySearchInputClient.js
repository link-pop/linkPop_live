"use client";

import SelectWithSearch from "@/components/ui/shared/Select/SelectWithSearch";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClearPostsSearchInputIcon from "../ClearPostsSearchInputIcon";

export default function ArraySearchInputClient({
  col,
  nameInSearchParams,
  searchParams,
  defaultValue,
  defaultSelectedValue,
}) {
  const router = useRouter();
  const [searchValue, searchValueSet] = useState(
    searchParams?.[nameInSearchParams] || ""
  );

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (searchValue) {
      newSearchParams.set(nameInSearchParams, searchValue);
    } else {
      newSearchParams.delete(nameInSearchParams);
    }

    router.push(`${col.name.toLowerCase()}?${newSearchParams.toString()}`);
  }, [searchValue]);

  const handleClearState = () => {
    searchValueSet("");
  };

  return (
    <div className="fcc fwn">
      <SelectWithSearch
        name={nameInSearchParams}
        defaultValue={defaultValue}
        defaultSelectedValue={searchValue}
        onChange={(newValue) => searchValueSet(newValue)}
        className="w-full"
        popoverContentClassName="!w310"
        label={nameInSearchParams}
      />
      <ClearPostsSearchInputIcon
        searchParams={searchParams}
        nameInSearchParams={nameInSearchParams}
        handleClearState={handleClearState}
        col={col}
        className="r t10"
      />
    </div>
  );
}
