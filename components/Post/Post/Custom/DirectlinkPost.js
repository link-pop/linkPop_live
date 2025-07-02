import DirectlinkLandingpagePost from "./DirectlinkLandingpagePost";
import Link from "next/link";
import { BadgeMinus, BadgeDollarSign, Shield, Facebook } from "lucide-react";
import { useTranslation } from "../../../Context/TranslationContext";

export default function DirectlinkPost(props) {
  const {
    name,
    destinationUrl,
    freeUrl,
    safePageUrl,
    shieldProtection,
    facebookPixelId,
  } = props.post;
  const { t } = useTranslation();

  return (
    <DirectlinkLandingpagePost
      {...props}
      namePrefix="@"
      urlClassName={``}
      additionalLinks={
        <>
          {/* Destination URL */}
          <div className="f aic island">
            <Link
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brand flex items-center text-sm text-primary hover:!bg-accent/30 transition-colors"
            >
              <BadgeDollarSign size={20} className="mr-1" />
              {t("redirectsTo")}:{" "}
              {destinationUrl.length > 45
                ? `${destinationUrl.substring(0, 45)}...`
                : destinationUrl}
            </Link>
          </div>

          {/* Free URL (if available) */}
          {freeUrl && (
            <div className="f aic island">
              <Link
                href={freeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-green-600 hover:!bg-accent/30 transition-colors"
              >
                <BadgeMinus size={20} className="mr-1" />
                {t("freeOffer")}:{" "}
                {freeUrl.length > 40
                  ? `${freeUrl.substring(0, 40)}...`
                  : freeUrl}
              </Link>
            </div>
          )}

          {/* Safe Page URL (if available) */}
          {safePageUrl && shieldProtection && (
            <div className="f aic island">
              <Link
                href={safePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-indigo-600 hover:!bg-accent/30 transition-colors"
              >
                <Shield size={20} className="mr-1" />
                {t("safePage")}:{" "}
                {safePageUrl.length > 40
                  ? `${safePageUrl.substring(0, 40)}...`
                  : safePageUrl}
              </Link>
            </div>
          )}

          {facebookPixelId && (
            <div className="f aic island">
              <Link
                href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&view_all_page_id=100000000000000&search_type=keyword_unordered`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:!bg-accent/30 transition-colors"
              >
                <Facebook size={20} className="mr-1" />
                {facebookPixelId}
              </Link>
            </div>
          )}
        </>
      }
    />
  );
}
