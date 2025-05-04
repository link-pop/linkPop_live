import ClerkSignInButton from "@/components/Clerk/ClerkSignInButton";
import CollapsibleNavigation from "../../ui/shared/NavigationMenu/CollapsibleNavigation";
import NormalNavigation from "../../ui/shared/NavigationMenu/NormalNavigation";
import {
  ARTICLES_ROUTE,
  ADD_CONTACT_ROUTE,
  MAIN_ROUTE,
  PRODUCTS_ROUTE,
} from "@/lib/utils/constants";

export default function HeaderNavigationMenu({ type, isAdmin }) {
  // * userNavLinks
  const desktopNavLinks = [
    { href: MAIN_ROUTE, label: "Home" },
    { href: PRODUCTS_ROUTE, label: "Shop" },
    { href: ARTICLES_ROUTE, label: "Blog" },
    { href: ADD_CONTACT_ROUTE, label: "Contact" },
  ];

  const mobileNavLinks = [
    { href: "/reviews?reviewed_collection=products", label: "Product Reviews" },
    { href: "/reviews?reviewed_collection=articles", label: "Article Reviews" },
    { href: "/products?viewed=false", label: "New Products" },
    { href: "/articles?viewed=false", label: "New Articles" },
    { href: "/products?viewed=true", label: "Viewed Products" },
    { href: "/articles?viewed=true", label: "Viewed Articles" },
    { href: "/products?liked=true", label: "Liked Products" },
    { href: "/articles?liked=true", label: "Liked Articles" },
    { href: "/reviews?liked=true", label: "Liked Reviews" },
    { href: "/orders", label: "Orders" },
    // ! ANALYTICS_DISABLED 1/2 COOLKEYS
    // { href: "/analytics/deep", label: "Analytics" },
    // { href: "/analytics", label: "History" },
    { href: "/faqs", label: "FAQ" },
    { href: "#howItWorks", label: "How It Works" },
    { href: "#whyUs", label: "Why Us" },
    { href: "#categories", label: "Categories" },
  ];

  const userNavLinks =
    type === "desktop"
      ? desktopNavLinks
      : [...desktopNavLinks, ...mobileNavLinks];

  // ! reverse userNavLinks
  if (type === "mobile") userNavLinks?.reverse();

  // * adminNavLinks
  // don't add links like "add/products" these kind of link are already generated like + icon next to col name eg: + Products in AddCollectionAdminButton
  const adminNavLinks = [];

  return (
    <>
      {/* <ClerkSignInButton className="w114 mxa my15" /> */}
      {/* <CollapsibleNavigation type={type} navLinks={[]} triggerTitle="" /> */}
      <NormalNavigation {...{ type, isAdmin, userNavLinks, adminNavLinks }} />
    </>
  );
}
