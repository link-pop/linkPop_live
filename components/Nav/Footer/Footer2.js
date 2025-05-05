"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import ClickForSupport from "@/components/ui/shared/ClickForSupport/ClickForSupport";
import { ThemeToggle } from "@/components/ui/shared/ThemeToggle/ThemeToggle";
import LanguageSelector from "@/components/ui/shared/LanguageSelector/LanguageSelector";
import {
  ADD_DIRECTLINK_ROUTE,
  DIRECTLINKS_ROUTE,
  ADD_LANDINGPAGE_ROUTE,
  LANDINGPAGES_ROUTE,
  AFFILIATE_ROUTE,
  PRICING_ROUTE,
  MAIN_ROUTE,
  LOGIN_ROUTE,
} from "@/lib/utils/constants";

// ! code start Footer2
export default function Footer2() {
  const { t, currentLang } = useTranslation();
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const pathname = usePathname();

  // don't show footer on sign-in page
  const isSignInPage = pathname === LOGIN_ROUTE;
  if (isSignInPage) return null;

  const handleScrollWithNavigation = (e, sectionId) => {
    e.preventDefault();
    router.push(MAIN_ROUTE);

    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 700);
  };

  const handleFaqScroll = (e) => {
    handleScrollWithNavigation(e, "faq-section");
  };

  const handleDirectLinkDemoScroll = (e) => {
    handleScrollWithNavigation(e, "direct-link-demo-section");
  };

  const handleLandingPageDemoScroll = (e) => {
    handleScrollWithNavigation(e, "landing-page-demo-section");
  };

  return (
    <footer className="!mt150 maw1000 mxa wf p25 border-t border-border bg-background text-foreground">
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company & About */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("company")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href={PRICING_ROUTE}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href={AFFILIATE_ROUTE}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("affiliate")}
                </Link>
              </li>
              <li>
                <a
                  href="#faq-section"
                  onClick={handleFaqScroll}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm cursor-pointer"
                >
                  {t("faqs")}
                </a>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("products")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={DIRECTLINKS_ROUTE}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("directLinks")}
                </Link>
              </li>
              <li>
                <Link
                  href={LANDINGPAGES_ROUTE}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("landingPages")}
                </Link>
              </li>
              <li>
                <a
                  href="#direct-link-demo-section"
                  onClick={handleDirectLinkDemoScroll}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm cursor-pointer"
                >
                  {t("directLinkInfo")}
                </a>
              </li>
              <li>
                <a
                  href="#landing-page-demo-section"
                  onClick={handleLandingPageDemoScroll}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm cursor-pointer"
                >
                  {t("landingPageInfo")}
                </a>
              </li>
            </ul>
          </div>

          {/* Create */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("create")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={ADD_DIRECTLINK_ROUTE}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("createDirectLink")}
                </Link>
              </li>
              <li>
                <Link
                  href={ADD_LANDINGPAGE_ROUTE}
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("createLandingPage")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("legal")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("termsAndConditions")}
                </Link>
              </li>

              {/* // ! don't uncomment this ! */}
              {/* <li>
                <Link
                  href="/privacy"
                  className="text-foreground/80 hover:text-primary hover:underline text-sm"
                >
                  {t("privacyNotice")}
                </Link>
              </li> */}
              <li>
                <ClickForSupport
                  textOnly={true}
                  buttonText={t("support")}
                  className="text-foreground/80 hover:text-primary text-sm"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section with copyright and settings */}
      <div className="container mx-auto px-4 pt-6 border-t border-border/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-foreground/70">
            <p>
              &copy; {currentYear} LinkPop. {t("allRightsReserved")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector className="text-sm" />
            <ThemeToggle className="text-sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}
// ? code end Footer2
