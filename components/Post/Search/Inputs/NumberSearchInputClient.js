"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/shared/Slider/Slider";
import { useRouter } from "next/navigation";
import ClearPostsSearchInputIcon from "../ClearPostsSearchInputIcon";

export default function NumberSearchInputClient({
  col,
  nameInSearchParams,
  searchParams,
  min = 0,
  max = 100,
}) {
  const router = useRouter();
  const initialRange = searchParams[nameInSearchParams]
    ?.split("-")
    .map(Number) || [min, max];
  const [range, setRange] = useState(initialRange);
  const [debouncedRange, setDebouncedRange] = useState(initialRange);

  const handleSliderChange = (newValue) => {
    setRange(newValue);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRange(range);
    }, 500);

    return () => clearTimeout(timer);
  }, [range]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (debouncedRange[0] === min && debouncedRange[1] === max) {
      // Delete the search parameter if the range is the default
      newSearchParams.delete(nameInSearchParams);
    } else {
      const rangeString = `${debouncedRange[0]}-${debouncedRange[1]}`;
      newSearchParams.set(nameInSearchParams, rangeString);
    }

    router.push(`${col.name.toLowerCase()}?${newSearchParams.toString()}`);
  }, [debouncedRange, searchParams, col, nameInSearchParams, router, min, max]);

  function handleClearState() {
    setRange([min, max]);
  }

  return (
    <>
      <label className="fz11 gray">{`${nameInSearchParams}`}</label>
      <div className="f fwn">
        <Slider
          className=""
          value={range}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
        />
        <ClearPostsSearchInputIcon
          {...{
            searchParams,
            nameInSearchParams,
            handleClearState,
            col,
            className: "r b8",
          }}
        />
      </div>
    </>
  );
}
