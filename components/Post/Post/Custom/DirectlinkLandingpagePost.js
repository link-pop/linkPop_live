import Post from "../Post";
import Link from "next/link";
import {
  Link as LinkIcon,
  BarChart2,
  Pencil,
  Trash2,
  Globe,
} from "lucide-react";
import { useContext } from "@/components/Context/Context";
import PostAdminIcons from "../Icons/PostAdminIcons";
import FormActiveCheckbox from "../../AddPostCustom/LinkPop/FormActiveCheckbox";
import { update } from "@/lib/actions/crud";
import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function DirectlinkLandingpagePost(props) {
  const {
    post,
    col,
    useCard = false,
    className = "maw700 wf fui !p0 !m0",
  } = props;
  const { name, username } = post;
  const [isActive, setIsActive] = useState(post.active);
  const { toastSet } = useContext();
  const { t } = useTranslation();

  // Create the URL from the environment variable and name
  const pageUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${name}`;
  // Create the analytics URL
  const analyticsUrl = `/${name}/analytics`;

  // Get geo filter information from the post
  const hasGeoFilter =
    post.geoFilterActive &&
    Array.isArray(post.geoFilterLocations) &&
    post.geoFilterLocations.length > 0;
  const geoFilterMode = post.geoFilterMode || "block";
  const locationCount = post.geoFilterLocations?.length || 0;

  // Get locations to display (limit to first 3 for display)
  const locationsToShow = post.geoFilterLocations?.slice(0, 3) || [];

  const handleActiveChange = async (e) => {
    try {
      const newActiveState = e.target.checked;
      setIsActive(newActiveState); // Update local state immediately for UI feedback

      const result = await update({
        col: col.name,
        data: { _id: post._id },
        update: { active: newActiveState },
      });

      if (result) {
        // Update was successful
        toastSet({
          title: newActiveState
            ? "Activated successfully"
            : "Deactivated successfully",
          showIcon: true,
        });
      }
    } catch (error) {
      // Revert local state if there was an error
      setIsActive(!e.target.checked);
      console.error("Error updating active status:", error);
      toastSet({
        title: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <Post
      {...props}
      noOtherIcons={true}
      showTags={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      useCard={useCard}
      showAutoGenMongoFields={false}
      showCreatedBy={false}
      className={className}
      top={
        <>
          <div className="bg-accent/20 wf bw1 p10 br10">
            {/* Name */}
            <div className="flex items-center">
              <h3 className="text-lg font-medium">
                {/* {props.namePrefix || ""} */}
                {username || name}
              </h3>
            </div>

            {/* Description if available */}
            {post.desc && (
              <p className="text-sm text-muted-foreground">{post.desc}</p>
            )}

            {/* Custom content slot */}
            {props.customContent}

            {/* GeoFilter information */}
            {hasGeoFilter && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {locationsToShow.map((location, idx) => (
                    <div
                      key={idx}
                      className={`!white island px-2 py-1 rounded text-xs flex items-center gap-1 ${
                        geoFilterMode === "block"
                          ? "!bg-red-400 text-red-800 dark:!bg-red-400 dark:text-red-300"
                          : "!bg-green-400 text-green-800 dark:!bg-green-400 dark:text-green-300"
                      }`}
                    >
                      <Globe size={12} />
                      <span>
                        {location.country}
                        {location.state ? ` - ${location.state}` : ""}
                      </span>
                    </div>
                  ))}

                  {locationCount > 3 && (
                    <div className="island f aic px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-700 text-foreground/80">
                      +{locationCount - 3} {t("more")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* URL display */}
            <div className="f g10 aic mt10">
              <Link
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  props.urlClassName || ""
                } f aic island text-sm text-foreground hover:text-primary hover:bg-accent/30 transition-colors`}
              >
                <LinkIcon size={16} className="mr-1" />
                {pageUrl.length > 50
                  ? `${pageUrl.substring(0, 50)}...`
                  : pageUrl}
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pageUrl);
                  toastSet({
                    title: t("linkCopied"),
                    showIcon: true,
                  });
                }}
                className="text-xs bw1 island !bg-transparent hover:!bg-accent/30 transition-colors"
              >
                {t("copy")}
              </button>

              {/* Analytics*/}
              <div className="f">
                <Link
                  href={analyticsUrl}
                  className="f aic text-xs island hover:text-primary hover:bg-accent/30 transition-colors"
                >
                  <BarChart2 size={14} className="mr-1" />
                  {t("analytics")}
                </Link>
              </div>

              {/* Admin Icons on the right */}
              <div
                className={`poa t15 r15 f aic g25 ${
                  col.name === "landingpages" ? "mb40" : ""
                }`}
              >
                <FormActiveCheckbox
                  isActive={isActive}
                  onChange={handleActiveChange}
                  hideLabel={true}
                  className=""
                />
                <PostAdminIcons
                  postsPaginationType="infinite"
                  post={post}
                  col={col}
                  customUpdateIcon={
                    <Pencil
                      size={18}
                      className="text-foreground/80 hover:text-foreground transition-colors"
                    />
                  }
                  customDeleteIcon={
                    <Trash2
                      size={20}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    />
                  }
                />
              </div>

              {/* Additional links slot */}
              {props.additionalLinks}
            </div>
          </div>
        </>
      }
    />
  );
}
