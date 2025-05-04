"use client";

import Switch from "@/components/ui/shared/Switch/Switch";
import { useRouter } from "next/navigation";
import { useUrlParams } from "@/hooks/useUrlParams";

export default function BooleanSearchInput({
  col,
  nameInSearchParams,
  searchParams,
}) {
  const router = useRouter();
  const urlParams = useUrlParams();
  
  const isChecked = urlParams.get(nameInSearchParams) === "true";

  const handleChange = (checked) => {
    const newParams = new URLSearchParams(urlParams.toString());
    
    if (checked) {
      newParams.set(nameInSearchParams, "true");
    } else {
      newParams.delete(nameInSearchParams);
    }

    const basePath = `/${col.name.toLowerCase()}`;
    router.replace(`${basePath}?${newParams.toString()}`);
  };

  return (
    <Switch
      name={nameInSearchParams}
      label={nameInSearchParams}
      isChecked={isChecked}
      onCheckedChange={handleChange}
    />
  );
}
