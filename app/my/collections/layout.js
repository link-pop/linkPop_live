"use client";

import { CollectionsProvider } from "@/components/Context/CollectionsContext";
import CollectionsTitle from "./components/CollectionsTitle";
import CollectionsToggle from "./components/CollectionsToggle";

export default function CollectionsLayout({ children }) {
  return (
    <CollectionsProvider>
      <div className="collections-layout">
        <CollectionsTitle />
        <div className="px-4">
          <CollectionsToggle />
        </div>
        {children}
      </div>
    </CollectionsProvider>
  );
}
