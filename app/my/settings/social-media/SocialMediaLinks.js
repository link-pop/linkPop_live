"use client";

import { useState, useEffect, useRef, memo } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import Button2 from "@/components/ui/shared/Button/Button2";
import { removeSocialMediaLink } from "@/lib/actions/removeSocialMediaLink";
import { updateSocialMediaLinksOrder } from "@/lib/actions/updateSocialMediaLinksOrder";
import {
  PlusCircle,
  Trash2,
  GripVertical,
  Globe,
  Pencil,
  Loader2,
} from "lucide-react";
import SocialMediaLinkDialog from "./SocialMediaLinkDialog";
import SocialMediaLinksDisplay from "@/components/ui/shared/SocialMediaLinks/SocialMediaLinksDisplay";
import { platformIcons, platformUrls } from "@/lib/data/platformData";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Add a debounce function at the top of the file, before the component declaration
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Improve the refresh mechanism to ensure it properly triggers a refresh
const triggerRefresh = (callback) => {
  if (!callback) return;

  // Call the callback directly - the callback now handles the object formatting
  console.log("Social links calling refreshPreviewCallback");
  callback((prev) => {
    // Let the callback function handle the formatting
    return typeof prev === "object"
      ? { count: prev.count + 1, refreshSocialLinks: true }
      : { count: prev + 1, refreshSocialLinks: true };
  });
};

// Memoize the component to prevent unnecessary re-renders
const SocialMediaLinks = memo(function SocialMediaLinks({
  mongoUser,
  formData,
  mode = null,
  showSocialMediaLinksDisplay = true,
  setCreatedLinksCount = null,
  refreshPreviewCallback = null,
  className = "",
}) {
  const { t } = useTranslation();
  const { dialogSet } = useContext();
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Create a debounced version of the refresh callback to prevent too many refreshes
  const debouncedRefresh = useRef(
    refreshPreviewCallback
      ? debounce((fn) => fn((prev) => prev + 1), 300)
      : null
  ).current;

  // Extract landingPageId from formData if present
  const landingPageId = formData?.landingPageId || null;

  // Use React Query to fetch and cache social links
  const {
    data: socialLinks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["socialLinks", mongoUser?._id, landingPageId],
    queryFn: async () => {
      if (!mongoUser?._id) return [];
      const links = await getSocialMediaLinks(mongoUser._id, landingPageId);
      return links || [];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    enabled: !!mongoUser?._id, // Only run if mongoUser._id exists
  });

  // Filter links based on mode
  const filteredLinks =
    mode === "other"
      ? socialLinks.filter((link) => link.platform === "other")
      : mode === null
      ? socialLinks.filter((link) => link.platform !== "other")
      : socialLinks;

  // Check if the filtered list is empty
  const isEmptyList = filteredLinks.length === 0;

  // Update the parent component's count when socialLinks change
  useEffect(() => {
    // Only update if the setter is provided
    if (setCreatedLinksCount && Array.isArray(socialLinks)) {
      // If we're rendering the "normal" links view (mode=null), update the total
      if (mode === null) {
        setCreatedLinksCount(socialLinks.length);
      }
    }
  }, [socialLinks, setCreatedLinksCount, mode]);

  const handleAddLink = () => {
    // Pass an empty array if socialLinks is undefined or null
    const linksToPass = Array.isArray(socialLinks) ? socialLinks : [];

    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      title: t(mode === "other" ? "addOtherLink" : "addSocialMediaLink"),
      comp: (
        <SocialMediaLinkDialog
          mode={mode}
          existingLinks={linksToPass}
          outerFormData={formData} // This should contain landingPageId
          onSuccess={(newLinks) => {
            // Update React Query cache with new links
            if (Array.isArray(newLinks)) {
              queryClient.setQueryData(
                ["socialLinks", mongoUser?._id, landingPageId],
                newLinks
              );

              // Explicitly trigger a refresh of the preview
              triggerRefresh(refreshPreviewCallback);
            }
          }}
        />
      ),
      showBtns: false,
      confirmBtnText: t("save"),
    });
  };

  const handleEditLink = (link) => {
    // Make sure we have a valid link object before proceeding
    if (!link || (!link._id && !link.id)) {
      console.error("Invalid link object for editing:", link);
      return;
    }

    // Pass an empty array if socialLinks is undefined or null
    const linksToPass = Array.isArray(socialLinks) ? socialLinks : [];

    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      title: t("editSocialMediaLink"),
      comp: (
        <SocialMediaLinkDialog
          mode={mode}
          editLink={link}
          existingLinks={linksToPass}
          outerFormData={formData} // This should contain landingPageId
          onSuccess={(newLinks) => {
            // Update React Query cache with new links
            if (Array.isArray(newLinks)) {
              queryClient.setQueryData(
                ["socialLinks", mongoUser?._id, landingPageId],
                newLinks
              );

              // Explicitly trigger a refresh of the preview
              triggerRefresh(refreshPreviewCallback);
            }
          }}
        />
      ),
      showBtns: false,
      confirmBtnText: t("save"),
    });
  };

  const handleDeleteLink = async (linkId) => {
    setIsDeleting(true);

    const formData = new FormData();
    formData.append("linkId", linkId);

    // Add landingPageId to the deletion request if available
    if (landingPageId) {
      formData.append("landingPageId", landingPageId);
    }

    const result = await removeSocialMediaLink(formData);

    if (result.success) {
      // Update React Query cache
      queryClient.setQueryData(
        ["socialLinks", mongoUser?._id, landingPageId],
        result.links
      );

      // Explicitly trigger a refresh of the preview
      triggerRefresh(refreshPreviewCallback);
    } else {
      console.error("Error removing social media link:", result.error);
    }

    setIsDeleting(false);
  };

  const confirmDeleteLink = (link) => {
    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      title: t("delete"),
      text: `${t("delete")} "${link.label}" (${link.platform})?`,
      isDanger: true,
      action: () => handleDeleteLink(link._id),
    });
  };

  // Get platform icon component
  const getPlatformIcon = (platform) => {
    const IconComponent = platformIcons[platform] || Globe;
    return IconComponent;
  };

  // Get platform URL
  const getPlatformUrl = (platform, username) => {
    const baseUrl = platformUrls[platform] || "";
    if (!baseUrl) return "#";

    // Clean username (remove @ if present)
    const cleanUsername = username.startsWith("@")
      ? username.substring(1)
      : username;
    return baseUrl + cleanUsername;
  };

  // ! Drag and drop
  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    // Add a ghost image effect
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverItem(index);
    e.currentTarget.classList.add("bg-accent");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("bg-accent");
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setDragOverItem(null);

    if (draggedItem === null) return;

    // Get the dragged link and the links array (filter out the dragged link)
    const draggedLink = filteredLinks[draggedItem];
    const updatedLinks = socialLinks.filter(
      (link) => link._id !== draggedLink._id
    );

    // Calculate the drop index based on platform mode
    let dropIndex = 0;

    if (mode === "other") {
      // For "other" links, the drop index is relative to other filtered links
      // Find position in the overall array
      const otherLinks = socialLinks.filter(
        (link) => link.platform === "other"
      );
      const otherIndex = otherLinks.findIndex(
        (link) => link._id === draggedLink._id
      );
      const nonOtherCount = socialLinks.filter(
        (link) => link.platform !== "other"
      ).length;

      // Insert at the adjusted index
      dropIndex = nonOtherCount + index;
    } else {
      // For regular links, drop index is based on position among non-other links
      const otherIndices = socialLinks
        .map((link, i) => (link.platform === "other" ? i : -1))
        .filter((i) => i !== -1);

      // If dropping at the end
      if (index >= filteredLinks.length - 1) {
        // Find the first "other" link index or end of array
        dropIndex = otherIndices.length ? otherIndices[0] : socialLinks.length;
      } else {
        dropIndex = index;
      }
    }

    // Insert the dragged link at the calculated index
    updatedLinks.splice(dropIndex, 0, draggedLink);

    // Format data for the update
    const formData = new FormData();
    formData.append("links", JSON.stringify(updatedLinks));

    // Add landingPageId to the form data if available
    if (landingPageId) {
      formData.append("landingPageId", landingPageId);
    }

    // Update the server with the new order
    updateSocialMediaLinksOrder(formData).then((result) => {
      if (result.success) {
        // Update the client-side cache with the sorted links
        queryClient.setQueryData(
          ["socialLinks", mongoUser?._id, landingPageId],
          result.links
        );

        // Trigger a preview refresh after reordering
        triggerRefresh(refreshPreviewCallback);
      }
    });

    // Reset drag state
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Save links order to the database
  const saveLinksOrder = async (links) => {
    setIsSaving(true);

    const formData = new FormData();
    formData.append("links", JSON.stringify(links));

    const result = await updateSocialMediaLinksOrder(formData);

    if (!result.success) {
      console.error("Error updating social media links order:", result.error);
    }

    setIsSaving(false);
  };
  // ? Drag and drop

  if (isLoading)
    return (
      <div className="fcc p20">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );

  if (error) {
    console.error("Error loading social links:", error);
    return <div className="fcc p20 text-red-500">Error loading links</div>;
  }

  return (
    <div className={`fc ${isDeleting || isSaving ? "pen" : ""} ${className}`}>
      <p className="tac ml3 mb5 px15">
        {mode === "other"
          ? t("otherMediaLinksDescription")
          : t("socialMediaLinksDescription")}
      </p>

      {/* Platform Labels - pass mode to SocialMediaLinksDisplay for consistent filtering */}
      {showSocialMediaLinksDisplay && socialLinks.length > 0 && (
        <SocialMediaLinksDisplay
          mode={mode}
          links={socialLinks}
          className="p15"
        />
      )}

      {/* Social Media Links List */}
      <div className={`fc`}>
        {
          !isEmptyList ? (
            <>
              {filteredLinks.map((link, index) => {
                const IconComponent = getPlatformIcon(link.platform);
                return (
                  <div
                    key={link._id}
                    className={`wbba f fwn jcsb aic p15 bw1 br5 ${
                      draggedItem === index ? "opacity-50" : ""
                    } ${dragOverItem === index ? "bg-accent" : ""}`}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div
                      className={`f fwn aic g10 cp`}
                      onClick={() => handleEditLink(link)}
                    >
                      {IconComponent && (
                        <div className={`fcc mih44 miw44 bg-accent br10`}>
                          <IconComponent size={20} />
                        </div>
                      )}
                      <div className={`fc`}>
                        <span className={`fw600`}>{link.label}</span>
                        {link.platform === "other" ? (
                          <span className={`fz14 gray`}>{link.websiteUrl}</span>
                        ) : (
                          <span className={`fz14 gray`}>@{link.username}</span>
                        )}
                        <span className={`fz12 gray mt2`}>
                          {t("linkClicks")}: {link.clickCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className={`min-[768px]:!miw110 ml10 f jce aic g25`}>
                      <div
                        className={`cp`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLink(link);
                        }}
                      >
                        <Pencil
                          className={`text-foreground/80 hover:text-foreground`}
                          size={18}
                        />
                      </div>
                      <div
                        className={`cp`}
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteLink(link);
                        }}
                      >
                        <Trash2
                          className={`text-red-500 hover:text-red-600`}
                          size={20}
                        />
                      </div>
                      <div className={`cp`} style={{ cursor: "grab" }}>
                        <GripVertical size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null
          // ! don't uncomment
          // <div className={`fz12 tac p20 gray`}>{t("noSocialMediaLinks")}</div>
        }
      </div>

      {/* Add Button */}
      <div className={`f mxa`}>
        <Button2
          variant="outline"
          text={mode === "other" ? t("addOtherLink") : t("addSocialMediaLink")}
          leftIcon={null}
          onClick={handleAddLink}
          className={`mla mt10`}
        />
      </div>
    </div>
  );
});

export default SocialMediaLinks;
