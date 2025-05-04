"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import Button from "@/components/ui/shared/Button/Button2";
import SocialMediaLinksDisplay from "@/components/ui/shared/SocialMediaLinks/SocialMediaLinksDisplay";
import { SOCIAL_MEDIA_ROUTE } from "@/lib/utils/constants";
import { useEffect, useState } from "react";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";

export default function UserFullPostSocials({ visitedMongoUser }) {
  const { t } = useTranslation();
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO !!!!!!!: make new sep hook to fetchSocialLinks
  useEffect(() => {
    let isMounted = true;

    const fetchSocialLinks = async () => {
      if (!visitedMongoUser?._id) return;

      try {
        const links = await getSocialMediaLinks(visitedMongoUser._id);

        if (isMounted) {
          setSocialLinks(links || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch social links:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSocialLinks();

    return () => {
      isMounted = false;
    };
  }, [visitedMongoUser?._id]);

  const noSocialLinks = !socialLinks.length;

  if (loading) return null;

  return noSocialLinks ? (
    visitedMongoUser?.isOwner && (
      <Button
        href={SOCIAL_MEDIA_ROUTE}
        variant="ghost"
        className="mxa wfc fz12"
        text={t("addSocialMedia")}
      />
    )
  ) : (
    <SocialMediaLinksDisplay
      showUpdateLink={true}
      links={socialLinks}
      className="mt10 ml3"
      showTitle={true}
    />
  );
}
