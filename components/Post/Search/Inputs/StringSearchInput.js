"use client";

import Input from "@/components/ui/shared/Input/InputQookeys";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClearPostsSearchInputIcon from "../ClearPostsSearchInputIcon";

export default function StringSearchInput({
  col,
  nameInSearchParams,
  searchParams,
}) {
  // ! stop generating input for subtype state
  if (col?.settings?.fields?.[nameInSearchParams]?.subtype === "state")
    return null;

  const router = useRouter();
  const [searchValue, setSearchValue] = useState(
    searchParams?.[nameInSearchParams] || ""
  );
  const [debouncedValue, setDebouncedValue] = useState(
    searchParams?.[nameInSearchParams] || ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (debouncedValue) {
      newSearchParams.set(nameInSearchParams, debouncedValue);
    } else {
      newSearchParams.delete(nameInSearchParams);
    }

    router.push(`${col.name.toLowerCase()}?${newSearchParams.toString()}`);
  }, [debouncedValue, searchParams, nameInSearchParams, col, router]);

  const handleClearState = () => {
    setSearchValue("");
  };

  return (
    <div className="fcc fwn">
      <Input
        type="text"
        name={`search_${nameInSearchParams}`}
        label={`${nameInSearchParams}`}
        placeholder={`search ${nameInSearchParams}`}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className=""
      />
      <ClearPostsSearchInputIcon
        {...{
          searchParams,
          nameInSearchParams,
          col,
          handleClearState,
          className: "mt20",
        }}
      />
    </div>
  );
}
