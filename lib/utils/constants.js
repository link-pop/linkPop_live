import { SITE1, SITE2 } from "@/config/env";

// ROUTES
export const MAIN_ROUTE = "/";
export const LOGIN_ROUTE = "/sign-in";
export const TERMS_ROUTE = "/terms";
export const PRIVACY_ROUTE = "/privacy";
// classNames
export const MENU_CLASS =
  "!h44 f fwn g10 aic px-4 py-2 text-sm text-foreground hover:bg-accent cp";
export const BRAND_INVERT_CLASS = `brand ${
  typeof window !== "undefined" &&
  window.localStorage &&
  window.localStorage.getItem("appTextColor")
    ? "custom-text-color"
    : SITE1
    ? "invert"
    : "white"
} hover:brightness-[0.5]`;
export const ICONBUTTON_CLASS =
  "text-foreground mx5 hs cp hover:opacity-70 transition-opacity";

// SITE 1
// my
export const MY_ROUTE = "/my";
export const SETTINGS_ROUTE = "/my/settings";
export const SOCIAL_MEDIA_ROUTE = "/my/settings/social-media";
// cols
export const NOTIFICATIONS_ROUTE = "/notifications";
export const CHATS_ROUTE = "/chatrooms";
export const ADD_FEED_ROUTE = "/add/feeds";
export const UPDATE_FEED_ROUTE = "/update/feeds";
export const FEEDS_ROUTE = "/feeds";
export const ADD_CONTACT_ROUTE = "/add/contacts";
export const ARTICLES_ROUTE = "/articles";
export const PRODUCTS_ROUTE = "/products";
export const ORDERS_ROUTE = "/orders";
export const ANALYTICS_ROUTE = "/analytics";
export const ANALYTICS_DEEP_ROUTE = "/analytics/deep";
export const REVIEWS_ROUTE = "/reviews";
// APP
export const APP_NAME = "More Than A Friend";
export const APP_SLOGAN = "Best place to find your love!";
export const APP_DESCRIPTION = "Best place to find your love!";
export const APP_NAME2 = "LinkPop";
export const APP_SLOGAN2 = "Best place to build your audience!";
export const APP_DESCRIPTION2 = "Best links tool!";
export const APP_PRICE = 2.99;
export const MOBILE = 1300;
export const MOBILE_SM = 768;

// SITE 2
export const ADD_DIRECTLINK_ROUTE = "/add/directlinks";
export const DIRECTLINKS_ROUTE = "/directlinks";
export const ADD_LANDINGPAGE_ROUTE = "/add/landingpages";
export const LANDINGPAGES_ROUTE = "/landingpages";
export const DASHBOARD_ROUTE = "/dashboard";
export const AFFILIATE_ROUTE = "/affiliate";
export const PRICING_ROUTE = "/pricing";

// ADMIN
export const ADMIN_CLICKS_ROUTE = "/admin/clicks";
export const ADMIN_LINKS_ROUTE = "/admin/links";

// CONTENT MODERATION
export const EROTICA_THRESHOLD = 0.9; // Exposure of breasts, nude buttocks, etc.
export const WEAPONS_THRESHOLD = 0.9; // Threshold for weapons detection
export const ALCOHOL_THRESHOLD = 0.9; // Threshold for alcohol detection
export const DRUGS_THRESHOLD = 0.9; // Threshold for drugs detection
export const OFFENSIVE_THRESHOLD = 0.9; // Threshold for offensive content
