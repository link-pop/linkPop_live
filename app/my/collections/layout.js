"use client";

import { Suspense } from "react";
import { CollectionsProvider } from "@/components/Context/CollectionsContext";
import CollectionsTitle from "./components/CollectionsTitle";
import CollectionsToggle from "./components/CollectionsToggle";

export default function CollectionsLayout({ children }) {
  return (
    <CollectionsProvider>
      <div className="collections-layout">
        <Suspense
          fallback={
            <div className="h-15 bg-background border-b border-border" />
          }
        >
          <CollectionsTitle />
        </Suspense>
        <CollectionsToggle />
        {children}
      </div>
    </CollectionsProvider>
  );
}
