"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useContext } from "../Context/Context";
import { LOGIN_ROUTE, MENU_CLASS } from "@/lib/utils/constants";
import { Button } from "../ui/button";
import "./clerk.css";
import UserPlanLabel from "./UserPlanLabel";
import CustomUserMenu from "./CustomUserMenu";
import AnimatedNavItem from "@/components/ui/shared/AnimatedNavItem/AnimatedNavItem";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { LogIn, BarChart2 } from "lucide-react";

export default function ClerkSignInButton({
  className = "",
  openMenuClassName = "",
  isMobile = false,
  mongoUser,
}) {
  const { isBurgerClickedSet } = useContext();
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div
      className={`${
        isMobile
          ? "flex flex-col items-center justify-center p-2 text-gray-500 hover:bg-accent hover:text-[var(--color-brand)] rounded-lg transition-colors"
          : "aleft105 " + className
      }`}
    >
      <SignedOut>
        <Link
          className={`${
            isMobile
              ? "flex flex-col items-center justify-center"
              : "db wfc px15 -mx16 pb2"
          }`}
          onClick={() => isBurgerClickedSet(false)}
          href={LOGIN_ROUTE}
        >
          <div className={isMobile ? "flex flex-col items-center" : MENU_CLASS}>
            <div className="por r5">
              <LogIn size={24} />
            </div>
            {isMobile && <span className="wsn !fz9 mt-1">{t("signIn")}</span>}
          </div>
        </Link>
      </SignedOut>
      <SignedIn>
        <div
          className={
            isMobile
              ? "flex flex-col items-center justify-center"
              : "por f jcfe"
          }
        >
          <UserPlanLabel {...{ mongoUser }} />
          <div className={isMobile ? "fcc" : "mla"}>
            <CustomUserMenu
              {...{
                isBurgerClickedSet,
                mongoUser,
                openMenuClassName,
                isMobile,
              }}
            />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
