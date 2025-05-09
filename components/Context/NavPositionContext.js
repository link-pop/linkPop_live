"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ! code start NavPositionContext
const NavPositionContext = createContext();

export function NavPositionProvider({ children }) {
  const [isAttachedToContent, setIsAttachedToContent] = useState(false);
  const [isExpandable, setIsExpandable] = useState(true);

  // Load preferences from localStorage on client side
  useEffect(() => {
    const storedAttachPref = localStorage.getItem("navAttachedToContent");
    if (storedAttachPref !== null) {
      setIsAttachedToContent(JSON.parse(storedAttachPref));
    }

    const storedExpandPref = localStorage.getItem("navExpandable");
    if (storedExpandPref !== null) {
      setIsExpandable(JSON.parse(storedExpandPref));
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "navAttachedToContent",
      JSON.stringify(isAttachedToContent)
    );
  }, [isAttachedToContent]);

  useEffect(() => {
    localStorage.setItem("navExpandable", JSON.stringify(isExpandable));
  }, [isExpandable]);

  const toggleNavPosition = () => {
    setIsAttachedToContent((prev) => !prev);
  };

  const toggleNavExpandable = () => {
    setIsExpandable((prev) => !prev);
  };

  return (
    <NavPositionContext.Provider
      value={{
        isAttachedToContent,
        toggleNavPosition,
        isExpandable,
        toggleNavExpandable,
      }}
    >
      {children}
    </NavPositionContext.Provider>
  );
}

export function useNavPosition() {
  const context = useContext(NavPositionContext);
  if (context === undefined) {
    throw new Error("useNavPosition must be used within a NavPositionProvider");
  }
  return context;
}
// ? code end NavPositionContext
