"use client";

import { useState, useEffect } from "react";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";
import { useTranslation } from "@/components/Context/TranslationContext";
import SocialMediaLinksDisplay from "@/components/ui/shared/SocialMediaLinks/SocialMediaLinksDisplay";

export default function UserFullPostOtherLinks({ visitedMongoUser }) {
  const [otherLinks, setOtherLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    const fetchOtherLinks = async () => {
      if (!visitedMongoUser?._id) return;

      try {
        const allLinks = await getSocialMediaLinks(visitedMongoUser._id);

        if (isMounted) {
          setOtherLinks(allLinks || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch other links:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOtherLinks();

    return () => {
      isMounted = false;
    };
  }, [visitedMongoUser?._id]);

  if (loading) return null;

  // Only render if there are "other" links to display
  const hasOtherLinks = otherLinks.some((link) => link.platform === "other");

  if (!hasOtherLinks) return null;

  return (
    <div className="fc g5">
      <SocialMediaLinksDisplay
        links={otherLinks}
        mode="other"
        className=""
        buttonClassName="bg-background text-foreground border border-border hover:border-border/80 hover:bg-accent/10"
        iconSize={18}
      />
    </div>
  );
}
