"use client";

import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";

export default function LandingPageBio({ bio, className = "" }) {
  if (!bio) return null;
  return (
    <div className={`px15 Bio landing-page-text ${className}`}>
      <RichTextContent
        content={bio}
        className="landing-page-text italic fz14"
      />
    </div>
  );
}
