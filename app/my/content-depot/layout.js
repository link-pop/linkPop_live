"use client";

import { ContentDepotProvider } from "@/components/Context/ContentDepotContext";
import ContentDepotTitle from "./components/ContentDepotTitle";

export default function ContentDepotLayout({ children }) {
  return (
    <ContentDepotProvider>
      <div className="content-depot-layout">
        <ContentDepotTitle />
        {children}
      </div>
    </ContentDepotProvider>
  );
}
