import Link from "next/link";
import { navItems } from "@/components/Nav/LeftNav/leftNavItems";
import { getLinkHref } from "@/components/Nav/LeftNav/navUtils";
import { usePathname } from "next/navigation";
import { MENU_CLASS } from "@/lib/utils/constants";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function MobileUserMenuNavItems({ mongoUser, onNavItemClick }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  // Order and IDs to match screenshot
  const mobileNavOrder = [
    "discover",
    "collections",
    "vault",
    "queue",
  ];
  const items = navItems().filter((item) => mobileNavOrder.includes(item.id));
  // Sort to match screenshot order
  const orderedItems = mobileNavOrder
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <div className="">
      {orderedItems.map((item) => (
        <Link
          key={item.id}
          href={getLinkHref(item, mongoUser)}
          className={`${MENU_CLASS} flex-row`}
          onClick={onNavItemClick}
        >
          <span>{item.icon}</span>
          {item.name || t(item.id)}
        </Link>
      ))}
    </div>
  );
}
