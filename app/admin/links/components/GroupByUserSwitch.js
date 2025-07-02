"use client";

import React from "react";
import Switch2 from "@/components/ui/shared/Switch/Switch2";

export default function GroupByUserSwitch({ checked, onCheckedChange }) {
  return (
    <div
      className="flex items-center space-x-2 cursor-pointer"
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="text-sm select-none">Group by user</span>
      <Switch2 checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
