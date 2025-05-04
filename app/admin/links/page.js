"use client";

import { Suspense } from "react";
import Toggle from "@/components/ui/shared/Toggle/Toggle";
import AdminPageHeader from "@/components/ui/admin/AdminPageHeader";
import AdminLinksPage from "./components/AdminLinksPage";
import AdminLandingPagesPage from "./components/AdminLandingPagesPage";
import AdminSocialMediaLinksPage from "./components/AdminSocialMediaLinksPage";
import AdminExternalLinksPage from "./components/AdminExternalLinksPage";

export default function AdminLinks() {
  const tabs = [
    { text: "Direct Links", className: "cursor-pointer" },
    { text: "Landing Pages", className: "cursor-pointer" },
    { text: "Social Links", className: "cursor-pointer" },
    { text: "Other Links", className: "cursor-pointer" },
  ];

  const contents = [
    <Suspense
      key="directlinks"
      fallback={<div className="p-8">Loading directlinks...</div>}
    >
      <AdminLinksPage />
    </Suspense>,
    <Suspense
      key="landingpages"
      fallback={<div className="p-8">Loading landing pages...</div>}
    >
      <AdminLandingPagesPage />
    </Suspense>,
    <Suspense
      key="socialmedialinks"
      fallback={<div className="p-8">Loading social media links...</div>}
    >
      <AdminSocialMediaLinksPage />
    </Suspense>,
    <Suspense
      key="externallinks"
      fallback={<div className="p-8">Loading external links...</div>}
    >
      <AdminExternalLinksPage />
    </Suspense>,
  ];

  return (
    <div className="p-6">
      <AdminPageHeader />
      <div className="oxh bg-background rounded-lg shadow p15">
        <Toggle
          labels={tabs}
          contents={contents}
          className="mb-8"
          labelsClassName="text-lg font-medium"
        />
      </div>
    </div>
  );
}
