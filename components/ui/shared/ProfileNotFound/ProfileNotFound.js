"use client";

import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useEffect, useState } from "react";

/**
 * Component to display when a profile, landing page, or directlink is not found
 * @param {Object} props - Component props
 * @param {string} [props.customMessage] - Optional custom message to display
 * @param {string} [props.customTitle] - Optional custom title to display
 * @returns {JSX.Element} The ProfileNotFound component
 */
export default function ProfileNotFound({ customTitle, customMessage }) {
  const { t } = useTranslation();
  const defaultTitle = t("pageNotFound") || "Page not found";
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "light");
  }, []);

  const themeImg =
    theme === "light" ? "/img/noPosts.svg" : "/img/noPostsDark.svg";

  const defaultMessage = (
    <>
      <p className="fz18 tac mb10 fw500">{t("reasons") || "Reasons:"}</p>
      <ul className="list-disc pl-5">
        <li>{t("pageDoesntExist") || "page doesn't exist"}</li>
        <li>{t("pageIsNotActive") || "page is not active"}</li>
        <li>{t("pageHasBeenRemoved") || "page has been removed"}</li>
        <li>
          {t("pageSubscriptionExpired") || "page subscription has expired"}
        </li>
        <li>{t("youUseVPN") || "you use VPN"}</li>
      </ul>
    </>
  );

  return (
    <div className="fc jcc aic p15">
      <h1 className="tac fz24 my20">{customTitle || defaultTitle}</h1>
      <div className="w-full flex justify-center mb20">
        <img className="maw500 wf ha" src={themeImg} alt="No content found" />
      </div>
      <div className="mb20">{customMessage || defaultMessage}</div>
      <p className="tac">
        {t("goBackTo") || "Go back to"}{" "}
        <Link
          className="cp brand hover:underline"
          href={process.env.NEXT_PUBLIC_CLIENT_URL}
        >
          {process.env.NEXT_PUBLIC_CLIENT_URL.replace("https://", "")}
        </Link>
      </p>
    </div>
  );
}
