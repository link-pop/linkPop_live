"use client";

import { MAIN_ROUTE } from "@/lib/utils/constants";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/shared/ThemeToggle/ThemeToggle";
import LanguageSelector from "@/components/ui/shared/LanguageSelector/LanguageSelector";

export default function Header2() {
  const pathname = usePathname();

  return pathname === MAIN_ROUTE ? (
    <div className="por l8 f p15 max-w-[1080px] wf mxa justify-between">
      <Logo height="40px" />
      <div className="max-[1024px]:hidden flex items-center gap-4">
        <LanguageSelector className="text-sm" />
        <ThemeToggle className="text-sm" />
      </div>
    </div>
  ) : null;
}
