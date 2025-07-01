"use client";

import Script from "next/script";
import { useSearchParams } from "next/navigation";

export default function InAppRedirectScript() {
  if (process.env.NODE_ENV !== "production") return null;

  const searchParams = useSearchParams();
  const hasIARS = searchParams.get("IARS"); // only run if has IARS=1 in the URL

  if (!hasIARS) return null;

  console.log("✅ InAppRedirectScript ENABLED");
  return (
    <Script
      id="iar"
      src="https://auditzy-rum.s3.ap-south-1.amazonaws.com/ixAOuGGu-www.linkpop.net-iar.js"
      strategy="afterInteractive"
    />
  );
}
