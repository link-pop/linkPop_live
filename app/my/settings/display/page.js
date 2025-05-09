"use client";

import LanguageSelector from "@/components/ui/shared/LanguageSelector/LanguageSelector";
import ThemeSettings from "@/components/ui/shared/ThemeSettings/ThemeSettings";
import { ThemeToggle } from "@/components/ui/shared/ThemeToggle/ThemeToggle";
import NavPositionToggle from "@/components/ui/shared/NavPositionToggle";

export default function displaypage() {
  const className = "fr aic p15 cp wf bw1 gray";

  return (
    <>
      <ThemeToggle className={className} />
      <ThemeSettings {...{ className: `${className} !py13` }} />
      <LanguageSelector {...{ className }} />
      <NavPositionToggle className={className} />
    </>
  );
}
