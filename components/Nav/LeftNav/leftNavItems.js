import {
  CHATS_ROUTE,
  LANDINGPAGES_ROUTE,
  ADMIN_CLICKS_ROUTE,
  AFFILIATE_ROUTE,
  PRICING_ROUTE,
  DIRECTLINKS_ROUTE,
  MAIN_ROUTE,
  DASHBOARD_ROUTE,
  MY_ROUTE,
} from "@/lib/utils/constants";
import { useTranslation } from "@/components/Context/TranslationContext";
import {
  Home,
  Bell,
  MessageSquare,
  Bookmark,
  UserCircle2,
  CreditCard,
  MoreHorizontal,
  User,
  Images,
  Link,
  Layout,
  BarChart2,
  Receipt,
  PieChart,
  CalendarCheck,
} from "lucide-react";
import { SITE2 } from "@/config/env";
import useWindowWidth from "@/hooks/useWindowWidth";

export const navItems = () => {
  const { t } = useTranslation();
  const { isMobile } = useWindowWidth();

  // Check if we should show titles (hide on mobile for SITE1)
  const showTitles = SITE2 || !isMobile;

  const items = [
    {
      id: "home",
      name: showTitles ? t("home") : "",
      icon: <Home className="w-6 h-6" />,
      href: MAIN_ROUTE,
    },
    {
      id: "notifications",
      name: showTitles ? t("notifications") : "",
      icon: <Bell className="w-6 h-6" />,
      href: "/notifications",
    },
    {
      id: "messages",
      name: showTitles ? t("messages") : "",
      icon: <MessageSquare className="w-6 h-6" />,
      href: CHATS_ROUTE,
    },
    // { id: "collections", name: t("collections"), icon: <Bookmark className="w-6 h-6" />, href: "/collections" },
    // {
    //   id: "subscriptions",
    //   name: t("subscriptions"),
    //   icon: <UserCircle2 className="w-6 h-6" />,
    //   href: "/subscriptions",
    // },
    // { id: "addCard", name: t("addCard"), icon: <CreditCard className="w-6 h-6" />, href: "/add-card" },
    {
      id: "vault",
      name: showTitles ? t("vault") : "",
      icon: <Images className="w-6 h-6" />,
      href: `${MY_ROUTE}/content-depot`,
    },
    {
      id: "queue",
      name: showTitles ? t("queue") : "",
      icon: <CalendarCheck className="w-6 h-6" />,
      href: `${MY_ROUTE}/queue`,
    },
  ];

  // Add directlinks and landing pages only for SITE2
  if (SITE2) {
    items.push(
      {
        id: "dashboard",
        name: t("dashboard"),
        icon: <PieChart className="w-6 h-6" />,
        href: DASHBOARD_ROUTE,
      },
      {
        id: "pricing",
        name: t("pricing"),
        icon: <CreditCard className="w-6 h-6" />,
        href: PRICING_ROUTE,
      },
      {
        id: "directlinks",
        name: t("directlinks"),
        icon: <Link className="w-6 h-6" />,
        href: DIRECTLINKS_ROUTE,
      },
      {
        id: "landingpages",
        name: t("landingPages"),
        icon: <Layout className="w-6 h-6" />,
        href: LANDINGPAGES_ROUTE,
      },
      {
        id: "affiliate",
        name: t("affiliateProgram"),
        icon: <Receipt className="w-6 h-6" />,
        href: AFFILIATE_ROUTE,
      }
    );
  }

  items.push(
    {
      id: "myProfile",
      name: showTitles ? t("myProfile") : "",
      icon: <User className="w-6 h-6" />,
      href: "/profile",
    },
    {
      id: "more",
      name: showTitles ? t("more") : "",
      icon: <MoreHorizontal className="w-6 h-6" />,
      href: "/more",
    }
  );

  return items;
};
