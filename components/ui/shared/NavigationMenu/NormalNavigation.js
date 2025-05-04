"use client";

import ClerkSignInButton from "@/components/Clerk/ClerkSignInButton";
import { useContext } from "@/components/Context/Context";
import HeaderNavLink from "@/components/Nav/Header/HeaderNavLink";
import NormalNavigationSeparators from "./NormalNavigationSeparators";
import React from "react";

export default function NormalNavigation({
  type,
  isAdmin,
  userNavLinks,
  adminNavLinks,
}) {
  const { isBurgerClickedSet } = useContext();

  const handleItemClick = () => {
    isBurgerClickedSet(false);
  };

  return (
    <div
      className={`${
        type === "desktop" ? "fcc g50" : "fcr g5 p30 mr3 border-r"
      }`}
    >
      {/* ADMIN */}
      {isAdmin &&
        adminNavLinks.map(({ href, label }) => (
          <HeaderNavLink
            className={`${type === "desktop" ? "" : "mla"}`}
            key={href}
            href={href}
            onClick={handleItemClick}
          >
            {label}
          </HeaderNavLink>
        ))}

      {/* USER */}
      {userNavLinks.map(({ href, label }) => (
        <React.Fragment key={`${href}-fragment`}>
          <NormalNavigationSeparators
            key={`${href}-separator`}
            type={type}
            label={label}
          />
          <HeaderNavLink
            className={`${type === "desktop" ? "" : "mla"}`}
            key={href}
            href={href}
            onClick={handleItemClick}
          >
            {label}
          </HeaderNavLink>
        </React.Fragment>
      ))}

      <div className={`${type === "desktop" ? "" : "min-[1200px]:hidden"}`}>
        <ClerkSignInButton className="my15" />
      </div>
    </div>
  );
}
