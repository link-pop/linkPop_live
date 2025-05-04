"use client";

import { useState, useEffect, memo } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { addOrUpdateSocialMediaLink } from "@/lib/actions/addOrUpdateSocialMediaLink";
import { AlertTriangle, Globe } from "lucide-react";
import Input from "@/components/ui/shared/Input/Input";
import Button from "@/components/ui/shared/Button/Button2";
import Select from "@/components/ui/shared/Select/Select";
import { useRouter } from "next/navigation";
import { allPlatforms, platformIcons } from "@/lib/data/platformData";
import { formatUrl, validateUrl } from "@/lib/utils/formatUrl";

// v 1.0.0
const SocialMediaLinkDialog = ({
  editLink = null,
  existingLinks = [],
  onSuccess = null,
  outerFormData = null,
  mode = null,
}) => {
  const { t } = useTranslation();
  const { dialogSet } = useContext();
  const router = useRouter();

  // Filter out platforms that are already added (except the one being edited)
  const [availablePlatforms, setAvailablePlatforms] = useState([]);

  // Ensure existingLinks is an array
  const links = Array.isArray(existingLinks) ? existingLinks : [];

  const [platform, setPlatform] = useState(editLink?.platform || "");
  const [username, setUsername] = useState(editLink?.username || "");
  const [websiteUrl, setWebsiteUrl] = useState(editLink?.websiteUrl || "");
  const [label, setLabel] = useState(editLink?.label || "");
  const [labelError, setLabelError] = useState("");
  const [websiteUrlError, setWebsiteUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize available platforms and default platform
  useEffect(() => {
    // If mode is "other", only show the "other" platform option
    if (mode === "other") {
      const otherPlatform = allPlatforms.find((p) => p.value === "other");
      if (otherPlatform) {
        setAvailablePlatforms([otherPlatform]);
        setPlatform("other");

        // IMPORTANT: Only set the default label if we're not editing
        // and the label hasn't been set yet
        if (!editLink && !label) {
          setLabel(otherPlatform.label);
        }
      }
      return; // Exit early since we've set the platform to "other" only
    }

    // If not in "other" mode, exclude the "other" platform from options
    const platformsToShow = allPlatforms.filter((p) => p.value !== "other");

    // Get existing platform values (excluding the one being edited)
    const existingPlatformValues = links
      .filter((link) => {
        if (!editLink) return true;
        return link._id !== editLink._id && link.id !== editLink.id;
      })
      .map((link) => link.platform);

    // Filter out platforms that are already added
    const filtered = platformsToShow.filter(
      (p) =>
        !existingPlatformValues.includes(p.value) ||
        (editLink && p.value === editLink.platform)
    );

    setAvailablePlatforms(filtered);

    // Set initial platform (for edit or first available for new)
    if (editLink) {
      setPlatform(editLink.platform);
      // Keep the existing label from editLink
    } else if (filtered.length > 0 && !platform) {
      setPlatform(filtered[0].value);
      // Set initial label to match the platform only if not already set
      if (!label) {
        setLabel(filtered[0].label);
      }
    }
  }, [links, editLink, mode, label, platform]);

  // Update label when platform changes (only if not editing and label hasn't been manually changed)
  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);

    // Only auto-update label if not in edit mode
    if (!editLink) {
      const selectedPlatform = allPlatforms.find(
        (p) => p.value === newPlatform
      );
      setLabel(selectedPlatform?.label || "");
    }
  };

  // Handle website URL input
  const handleWebsiteUrlChange = (e) => {
    // Remove protocol if user types it
    const value = e.target.value.replace(/^https?:\/\//i, "");
    setWebsiteUrl(value);

    // Validate URL
    if (value && !validateUrl(value)) {
      setWebsiteUrlError(
        t("enterValidDomain") || "Please enter a valid domain"
      );
    } else {
      setWebsiteUrlError("");
    }
  };

  // Validate label is unique
  const validateLabel = (e) => {
    setLabel(e.target.value);
    setLabelError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!platform) {
      setError("Please select a platform");
      return;
    }

    // Validation based on mode
    if (mode === "other") {
      if (!websiteUrl) {
        setError("Please enter a website URL");
        return;
      }

      // Validate the website URL
      if (!validateUrl(websiteUrl)) {
        setWebsiteUrlError(
          t("enterValidDomain") || "Please enter a valid domain"
        );
        setError("Please enter a valid website URL");
        return;
      }
    } else {
      if (!username) {
        setError("Please enter a username");
        return;
      }
    }

    if (!label) {
      setError("Please enter a label");
      return;
    }

    if (editLink && !editLink._id) {
      console.warn("Invalid edit link provided - missing _id:", editLink);
      setError("Invalid link data. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("platform", platform);

      // Add either username or websiteUrl based on mode
      if (mode === "other") {
        // Format the URL before submitting
        formData.append("websiteUrl", formatUrl(websiteUrl));
      } else {
        formData.append("username", username);
      }

      formData.append("label", label);

      // Only append landingPageId if it actually has a valid value
      if (
        outerFormData?.landingPageId &&
        outerFormData.landingPageId !== "undefined" &&
        outerFormData.landingPageId !== "null"
      ) {
        formData.append("landingPageId", outerFormData.landingPageId);
      }

      if (editLink && editLink._id) {
        formData.append("linkId", editLink._id);
      }

      console.log("Submitting form data:", {
        platform,
        username: mode === "other" ? null : username,
        websiteUrl: mode === "other" ? formatUrl(websiteUrl) : null,
        label,
        linkId: editLink?._id || "new link",
      });

      const result = await addOrUpdateSocialMediaLink(formData);

      console.log("Form submission result:", result);

      if (result.success) {
        // Call the success callback
        if (typeof onSuccess === "function") {
          onSuccess(result.links);
        }

        // Close the dialog
        dialogSet({ isOpen: false });
      } else {
        setError(result.error || "Failed to save link");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get platform icon
  const getPlatformIcon = (platformValue) => {
    const platform = allPlatforms.find((p) => p.value === platformValue);
    return platform?.icon || Globe;
  };

  // If no platforms are available and not editing, show message
  if (availablePlatforms.length === 0 && !editLink) {
    return (
      <div className={`p15 tac`}>
        <p>{t("allPlatformsAdded")}</p>
      </div>
    );
  }

  return (
    <div className={`p15 ${isSubmitting ? "pen" : ""}`}>
      <form onSubmit={handleSubmit} className={`fc g15`}>
        {error && <div className="text-red-500">{error}</div>}

        {/* Platform Selection */}
        <div className={`fc g5`}>
          <Select
            key={`platform-select-${availablePlatforms
              .map((p) => p.value)
              .join("-")}`}
            label={t("platformLabel")}
            value={platform}
            onValueChange={handlePlatformChange}
            options={availablePlatforms}
            className={`wf`}
            disabled={!!editLink || isLoading || mode === "other"}
            renderOption={(option) => {
              const Icon = getPlatformIcon(option?.value);
              return (
                <div className={`f aic g5`}>
                  <Icon size={16} />
                  <span>{option?.label}</span>
                </div>
              );
            }}
            version="new"
          />
        </div>

        {/* Username or Website URL Input based on mode */}
        {mode === "other" ? (
          <Input
            type="text"
            label={t("websiteUrl")}
            value={websiteUrl}
            onChange={handleWebsiteUrlChange}
            placeholder="google.com"
            className={`gray br5 ${websiteUrlError ? "border-red-500" : ""}`}
            error={websiteUrlError}
            required
          />
        ) : (
          <Input
            label={t("linkUsername")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
            required
          />
        )}

        {/* Label Input */}
        <div className={`fc g5`}>
          <Input
            label={t("linkLabel")}
            value={label}
            onChange={validateLabel}
            error={labelError}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {t("save")}
        </Button>
      </form>
    </div>
  );
};

export default memo(SocialMediaLinkDialog);
