"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import useLayoutWidth from "@/hooks/useLayoutWidth";
import { MENU_CLASS, SETTINGS_ROUTE } from "@/lib/utils/constants";
import capitalize from "@/lib/utils/capitalize";
import useSettingsNavVisibility from "@/hooks/useSettingsNavVisibility";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! Keep labels, maybe I will use them later
const defaultSettingsLinks = [
  { href: `${SETTINGS_ROUTE}/profile`, label: "profile" },
  { href: `${SETTINGS_ROUTE}/account`, label: "account" },
  { href: `${SETTINGS_ROUTE}/security`, label: "security" },
  { href: `${SETTINGS_ROUTE}/subscription`, label: "subscription" },
  { href: `${SETTINGS_ROUTE}/fans`, label: "fans" },
  { href: `${SETTINGS_ROUTE}/notifications`, label: "notifications" },
  { href: `${SETTINGS_ROUTE}/messaging`, label: "messaging" },
  { href: `${SETTINGS_ROUTE}/story`, label: "story" },
  { href: `${SETTINGS_ROUTE}/streaming`, label: "streaming" },
  null, // separator for General section
  { href: `${SETTINGS_ROUTE}/display`, label: "display" },
  { href: `${SETTINGS_ROUTE}/qrcode`, label: "qrcode" },
];

export default function SettingsNav({
  className = "",
  mongoUser,
  customLinks,
  showUsername = false,
  forceShowNav = false, // * forces nav to show on all devices (show on mobile)
}) {
  const pathname = usePathname();
  const showNav = useSettingsNavVisibility();
  const { t } = useTranslation();
  useLayoutWidth("1000");

  // Use customLinks if provided, otherwise use defaultSettingsLinks
  const settingsLinks = customLinks || defaultSettingsLinks;

  if (!showNav && !forceShowNav) return null;

  return (
    <div
      className={`wf max-[600px]:wf min-[601px]:maw400 min-[601px]:flex-1 ${className}`}
    >
      {/* USERNAME */}
      {showUsername && (
        <div className={`p15 bw1 gray`}>
          <span className={`gray fz14`}>@{mongoUser?.name}</span>
        </div>
      )}

      {/* NAV */}
      <div className={`fc wf`}>
        {settingsLinks.map((link, index) =>
          link ? (
            <Link
              key={link.href}
              href={link.href}
              className={`${MENU_CLASS} jcsb p15 cp wf bw1 ${
                pathname === link.href ? "bg-accent" : ""
              }`}
            >
              <span>{t(link.label)}</span>
              <ChevronRight size={20} className={`gray`} />
            </Link>
          ) : (
            <div key={index} className={`p15 bw1 gray`}>
              <span className={`fw600 ttu gray fz14`}>{t("general")}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Export the default settings links for reuse
export { defaultSettingsLinks };
