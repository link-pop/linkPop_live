import Logo from "../Header/Logo";
import FooterNavLinks from "./FooterNavLinks";
import LinkGroup from "./LinkGroup";
import NoFooterPages from "./NoFooterPages";
import {
  ADD_CONTACT_ROUTE,
  ANALYTICS_DEEP_ROUTE,
  ANALYTICS_ROUTE,
  ARTICLES_ROUTE,
  LOGIN_ROUTE,
  MAIN_ROUTE,
  ORDERS_ROUTE,
  PRODUCTS_ROUTE,
  REVIEWS_ROUTE,
} from "@/lib/utils/constants";

export default function Footer() {
  const responsive = "fcc max-[1919px]:fc max-[1919px]:g50";

  const helpfulLinks = [
    {
      href: "/faqs",
      text: "FAQ",
    },
    {
      href: "https://www.youtube.com/@qookeys2817",
      text: "Youtube",
    },
    {
      href: ADD_CONTACT_ROUTE,
      text: "Sales Support",
    },
    {
      href: "/products?viewed=false",
      text: "New Products",
    },
    {
      href: "/articles?viewed=false",
      text: "New Articles",
    },
  ];

  const navigationLinks = [
    {
      href: MAIN_ROUTE,
      text: "Home",
    },
    {
      href: PRODUCTS_ROUTE,
      text: "Products",
    },
    {
      href: ARTICLES_ROUTE,
      text: "Articles",
    },
    {
      href: ADD_CONTACT_ROUTE,
      text: "Contact us",
    },
    {
      href: LOGIN_ROUTE,
      text: "Login",
    },
  ];

  const otherFooterLinks = [
    // ! ANALYTICS_DISABLED 1/2 COOLKEYS
    // {
    //   href: ANALYTICS_ROUTE,
    //   text: "History",
    // },
    // {
    //   href: ANALYTICS_DEEP_ROUTE,
    //   text: "Analytics",
    // },
    {
      href: REVIEWS_ROUTE,
      text: "Reviews",
    },
    {
      href: ORDERS_ROUTE,
      text: "Orders",
    },
  ];

  const footerLinkClassName =
    "fc aic text-foreground/60 fz14 mb5 hover:underline hover:text-primary";

  return (
    <NoFooterPages>
      <footer className="mah350 max-w-[1620px] wf mxa border-t border-border p40 bg-background mta">
        <div className={`${responsive} wf px15 py30`}>
          {/* <div className="fc g25 maw300 wf fz15">
            <Logo />
            <div>
              ♡ Coolkeys offers easy way to activate your apps in just 1-2
              minutes.
            </div>
            <div>
              <b className="text-red-300">Disclaimer</b> – Products in the
              directory on Coolkeys are developed by third party developers. We
              are not affiliated or related to any of these third-party
              developers or trademark owners.
            </div>
            <div className="fw500">
              Copyright {new Date().getFullYear()} • All Rights Reserved
            </div>
          </div> */}

          {/* // ! links */}
          <div className="mxa asfs fc aic maw300 wf">
            <div className="text-foreground mb10 fz18 fw600 wf tac">
              Legal Pages
            </div>
            <FooterNavLinks linkClassName={footerLinkClassName} />
          </div>
          {/* <LinkGroup
            linkClassName={footerLinkClassName}
            title="Helpful Links"
            links={helpfulLinks}
          />
          <LinkGroup
            linkClassName={footerLinkClassName}
            title="Navigation Links"
            links={navigationLinks}
          />
          <LinkGroup
            linkClassName={footerLinkClassName}
            title="Other Footer Links"
            links={otherFooterLinks}
          /> */}
        </div>
      </footer>
    </NoFooterPages>
  );
}
