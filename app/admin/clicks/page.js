"use client";

import Toggle from "@/components/ui/shared/Toggle/Toggle";
import AdminPageHeader from "@/components/ui/admin/AdminPageHeader";
import AdminSocialLinksClicksPage from "../links/components/AdminSocialLinksClicksPage";
import AdminOtherLinksPage from "../links/components/AdminOtherLinksPage";
import { Suspense } from "react";

export default function ClicksPage() {
  const tabs = [
    { text: "Social Links", className: "cursor-pointer" },
    { text: "Other Links", className: "cursor-pointer" },
  ];

  const contents = [
    <Suspense
      key="sociallinks"
      fallback={<div className="p-8">Loading social links analytics...</div>}
    >
      <AdminSocialLinksClicksPage />
    </Suspense>,
    <Suspense
      key="otherlinks"
      fallback={<div className="p-8">Loading other links data...</div>}
    >
      <AdminOtherLinksPage />
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
