"use client";

import { useState, useRef, useEffect } from "react";
import { add, update, getOne } from "@/lib/actions/crud";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "@/components/Context/Context";
import { checkNameUniqueness } from "@/lib/actions/checkNameUniqueness";
import Input from "@/components/ui/shared/Input/Input";
import Textarea from "@/components/ui/shared/Textarea/Textarea";
import Button from "@/components/ui/shared/Button/Button2";
// import ProfileImagesUploader from "./ProfileImagesUploader";
import LandingPageSocialLinksEditor from "./LandingPageSocialLinksEditor";
import ProfileImagesUploader from "./ProfileImagesUploader";
import StepNavigation from "./StepNavigation";
import useFormErrors from "@/hooks/useFormErrors";
import {
  fetchUserDirectlinkLandingpageData,
  checkSubscription2Limit,
} from "@/lib/actions/subscription2Limit";
import {
  getSubscription2DisplayInfo,
  getSubscription2UpgradeSuggestion,
} from "./subscription2UIUtils";
import FormErrorDisplay from "./FormErrorDisplay";
import Subscription2LimitInfo from "./Subscription2LimitInfo";
import FormActiveCheckbox from "./FormActiveCheckbox";
import AddLandingPageFormPreview from "./AddLandingPageFormPreview";
import LandingPageCustomizationForm from "./CustomizationForm/LandingPageCustomizationForm";
import { addLandingPage } from "@/lib/actions/addLandingPage";
import { updateLandingPage } from "@/lib/actions/updateLandingPage";
import GeoFilterForm from "./GeoFilterForm";
import { useTranslation } from "@/components/Context/TranslationContext";
import Switch2 from "@/components/ui/shared/Switch/Switch2";
import Select from "@/components/ui/shared/Select/Select";
import { MapPin } from "lucide-react";
import { SmartDatetimeInput } from "@/components/ui/shared/SmartDatetimeInput/SmartDatetimeInput";
import FormPixelIdInput from "./FormPixelIdInput";
import FormUniqueNameInput from "./FormUniqueNameInput";
import FormSection from "./FormSection";
import FormUsernameInput from "./FormUsernameInput";
import FormBioTextarea from "./FormBioTextarea";
import FormSubmitButton from "./FormSubmitButton";

function AddLandingPageForm({
  col = "landingpages",
  mongoUser,
  updatingPost,
  onCustomSuccess,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef(null);
  const { toastSet } = useContext();
  const { t } = useTranslation();

  // Get step and landingPageId from URL params if they exist
  const stepFromUrl = searchParams.get("step");
  const landingPageIdFromUrl = searchParams.get("landingPageId");

  const [step, setStep] = useState(stepFromUrl ? parseInt(stepFromUrl) : 1);
  const [isLoading, setIsLoading] = useState(false);
  // State to track number of links created
  const [createdLinksCount, setCreatedLinksCount] = useState(0);
  // For subscription limit checking
  const [userSubscription, setUserSubscription] = useState(null);
  const [userDirectlinks, setUserDirectlinks] = useState([]);
  const [userLandingpages, setUserLandingpages] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  // Add a flag to prevent multiple fetches
  const [hasFetchedData, setHasFetchedData] = useState(false);
  // Declare createdLandingPage state here
  const [createdLandingPage, setCreatedLandingPage] = useState(null);

  // Get errors handling functions before using them
  const { errors, setError, clearAllErrors, createChangeHandler } =
    useFormErrors();

  // Define when we're in update mode - either:
  // 1. When we have an updatingPost prop (true edit mode)
  // 2. When we have a landingPageId in the URL (returning to step 1 during creation)
  // This fixes name uniqueness check issues when returning to step 1
  const isUpdateMode = !!updatingPost || !!landingPageIdFromUrl;

  // Initial form data with defaults
  const defaultFormData = {
    landingPageId: updatingPost?._id || landingPageIdFromUrl || "",
    name: updatingPost?.name || "",
    username: updatingPost?.username || "",
    bio: updatingPost?.bio || "",
    active: updatingPost?.active !== undefined ? updatingPost.active : true,
    textColor: updatingPost?.textColor || "#ffffff",
    bgColor: updatingPost?.bgColor || "",
    buttonTextColor: updatingPost?.buttonTextColor || "#ffffff",
    buttonBgColor: updatingPost?.buttonBgColor || "#ffb6c1",
    buttonRoundness: updatingPost?.buttonRoundness || "medium",
    buttonAnimation: updatingPost?.buttonAnimation || "none",
    buttonShadow: updatingPost?.buttonShadow || "none",
    shadowColor: updatingPost?.shadowColor || "#000000",
    fontFamily: updatingPost?.fontFamily || "default",
    textFontSize: updatingPost?.textFontSize || "medium",
    buttonFontSize: updatingPost?.buttonFontSize || "medium",
    socialIconsType: updatingPost?.socialIconsType || "type2",
    textShadow: updatingPost?.textShadow || "none",
    textShadowColor: updatingPost?.textShadowColor || "#000000",
    // New fields from the form image
    showOnline:
      updatingPost?.showOnline !== undefined ? updatingPost.showOnline : true,
    showCity:
      updatingPost?.showCity !== undefined ? updatingPost.showCity : true,
    responseTime: updatingPost?.responseTime || "none",
    promotion: updatingPost?.promotion || "",
    promotionTextColor: updatingPost?.promotionTextColor || "#FF0000",
    promotionEndsIn: updatingPost?.promotionEndsIn || "",
    distanceFromVisitor: updatingPost?.distanceFromVisitor || "",
    disableLinkLogos:
      updatingPost?.disableLinkLogos !== undefined
        ? updatingPost.disableLinkLogos
        : false,
    facebookPixelId: updatingPost?.facebookPixelId || "",
    // Add fields for original images
    originalProfileImage: updatingPost?.originalProfileImage || "",
    originalCoverImage: updatingPost?.originalCoverImage || "",
  };

  // Remove React Query setup that's causing issues
  // Instead, use state and standard fetch
  const [landingPage, setLandingPage] = useState(null);
  const [isLoadingLandingPage, setIsLoadingLandingPage] = useState(false);

  // State for form data based on fetched data
  const [formData, setFormData] = useState(defaultFormData);

  // Important: Having a landingPageId always means we're updating,
  // even in the /add route (when returning to edit it before completing setup)
  const isExistingLandingPage = isUpdateMode || !!formData.landingPageId;

  const [profileImage, setProfileImage] = useState(
    updatingPost?.profileImage || ""
  );
  const [coverImage, setCoverImage] = useState(updatingPost?.coverImage || "");
  const [loading, setLoading] = useState(false);

  const [refreshPreviewTrigger, setRefreshPreviewTrigger] = useState(0);

  // Load landing page data when needed
  useEffect(() => {
    const fetchLandingPage = async () => {
      if (!landingPageIdFromUrl || updatingPost || hasFetchedData) return;

      try {
        setIsLoadingLandingPage(true);
        console.log("Fetching landing page with id:", landingPageIdFromUrl);
        const result = await getOne({
          col,
          data: { _id: landingPageIdFromUrl },
        });

        console.log("Landing page data fetched:", result);
        if (result) {
          setLandingPage(result);
          setCreatedLandingPage(result);
          setHasFetchedData(true);
        } else {
          setError(
            "general",
            t("landingPageNotFound") || "Landing page not found"
          );
        }
      } catch (error) {
        console.error("Error fetching landing page:", error);
        setError(
          "general",
          t("failedToLoadLandingPageData") || "Failed to load landing page data"
        );
      } finally {
        setIsLoadingLandingPage(false);
      }
    };

    fetchLandingPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingPageIdFromUrl, col, updatingPost, hasFetchedData]);

  // Combine data from query with updatingPost if available
  const landingPageData = updatingPost || landingPage;

  // Update form data when landing page data changes
  useEffect(() => {
    if (landingPageData) {
      console.log(
        "Updating form data with landing page data:",
        landingPageData
      );
      setFormData({
        landingPageId: landingPageData._id,
        name: landingPageData.name || "",
        username: landingPageData.username || "",
        bio: landingPageData.bio || "",
        active:
          landingPageData.active !== undefined ? landingPageData.active : true,
        textColor: landingPageData.textColor || "",
        bgColor: landingPageData.bgColor || "",
        buttonTextColor: landingPageData.buttonTextColor || "",
        buttonBgColor: landingPageData.buttonBgColor || "",
        buttonRoundness: landingPageData.buttonRoundness || "medium",
        buttonAnimation: landingPageData.buttonAnimation || "none",
        buttonShadow: landingPageData.buttonShadow || "none",
        shadowColor: landingPageData.shadowColor || "#000000",
        fontFamily: landingPageData.fontFamily || "default",
        textFontSize: landingPageData.textFontSize || "medium",
        buttonFontSize: landingPageData.buttonFontSize || "medium",
        socialIconsType: landingPageData.socialIconsType || "type2",
        textShadow: landingPageData.textShadow || "none",
        textShadowColor: landingPageData.textShadowColor || "#000000",
        // New fields from the form image
        showOnline:
          landingPageData.showOnline !== undefined
            ? landingPageData.showOnline
            : true,
        showCity:
          landingPageData.showCity !== undefined
            ? landingPageData.showCity
            : true,
        responseTime: landingPageData.responseTime || "none",
        promotion: landingPageData.promotion || "",
        promotionTextColor: landingPageData.promotionTextColor || "#FF0000",
        promotionEndsIn: landingPageData.promotionEndsIn || "",
        distanceFromVisitor: landingPageData.distanceFromVisitor || "",
        disableLinkLogos:
          landingPageData.disableLinkLogos !== undefined
            ? landingPageData.disableLinkLogos
            : false,
        facebookPixelId: landingPageData.facebookPixelId || "",
        // Add original image fields
        originalProfileImage: landingPageData.originalProfileImage || "",
        originalCoverImage: landingPageData.originalCoverImage || "",
      });
      setProfileImage(landingPageData.profileImage || "");
      setCoverImage(landingPageData.coverImage || "");
    }
  }, [landingPageData]);

  // Fetch user's subscription and existing directlinks/landingpages
  useEffect(() => {
    async function loadUserData() {
      if (!mongoUser?._id) return;

      setIsLoadingData(true);
      const userData = await fetchUserDirectlinkLandingpageData(mongoUser._id);
      setUserSubscription(userData.subscription);
      setUserDirectlinks(userData.directlinks);
      setUserLandingpages(userData.landingpages);
      setIsLoadingData(false);
    }

    loadUserData();
  }, [mongoUser?._id]);

  // Update the URL when step or landingPageId changes
  useEffect(() => {
    const updateUrl = () => {
      if (step === 1 && !formData.landingPageId) {
        // Clear URL params if in step 1 with no landingPageId
        router.replace(window.location.pathname);
      } else {
        // Update URL with current step and landingPageId if available
        const params = new URLSearchParams();
        params.set("step", step.toString());
        if (formData.landingPageId) {
          params.set("landingPageId", formData.landingPageId);
        }
        router.replace(`${window.location.pathname}?${params.toString()}`);
      }
    };

    updateUrl();
  }, [step, formData.landingPageId, router]);

  const resetForm = () => {
    setFormData({
      landingPageId: "",
      name: "",
      username: "",
      bio: "",
      active: true,
      textColor: "#ffffff",
      bgColor: "",
      buttonTextColor: "#ffffff",
      buttonBgColor: "#ffb6c1",
      buttonRoundness: "medium",
      buttonAnimation: "none",
      buttonShadow: "none",
      shadowColor: "#000000",
      fontFamily: "default",
      textFontSize: "medium",
      buttonFontSize: "medium",
      socialIconsType: "type2",
      textShadow: "none",
      textShadowColor: "#000000",
      // New fields from the form image
      showOnline: true,
      showCity: true,
      responseTime: "none",
      promotion: "",
      promotionTextColor: "#FF0000",
      promotionEndsIn: "",
      distanceFromVisitor: "",
      disableLinkLogos: false,
      facebookPixelId: "",
      // Reset original image fields
      originalProfileImage: "",
      originalCoverImage: "",
    });
    setProfileImage("");
    setCoverImage("");
    setStep(1);
    setCreatedLandingPage(null);
    clearAllErrors();
    formRef.current?.reset();
    router.replace(window.location.pathname); // Clear URL params
  };

  const handleChange = createChangeHandler((e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 2 || step === 3) return; // Don't submit in step 2 or 3

    setLoading(true);
    clearAllErrors();

    try {
      // Generate random distance if not provided by user
      let processedFormData = { ...formData };

      // If distance is empty, generate a random number between 1-10 with one decimal place
      if (!processedFormData.distanceFromVisitor) {
        // Generate a number between 1.0 and 10.0 with one decimal place
        const randomDistance = (Math.random() * 9 + 1).toFixed(1);
        processedFormData.distanceFromVisitor = randomDistance;
      }

      // Check name uniqueness (case-insensitive)
      // Always pass the landingPageId for uniqueness check when we have one
      const nameCheck = await checkNameUniqueness(
        processedFormData.name,
        "landingpages",
        updatingPost?._id || processedFormData.landingPageId || null
      );

      if (!nameCheck.isUnique) {
        setError("name", nameCheck.error);
        // Add toast for name error
        toastSet({
          isOpen: true,
          title: t("error") || "Name Error",
          text: nameCheck.error,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check subscription limits (only for new landingpages)
      if (!isExistingLandingPage) {
        const limitCheck = checkSubscription2Limit(
          userSubscription,
          userDirectlinks,
          userLandingpages,
          isUpdateMode,
          mongoUser
        );

        if (!limitCheck.withinLimits) {
          setError(
            "subscription",
            getSubscription2LimitMessage(userSubscription)
          );
          setLoading(false);

          // Get upgrade suggestion
          const upgradeSuggestion =
            getSubscription2UpgradeSuggestion(userSubscription);

          // Show upgrade toast
          toastSet({
            isOpen: true,
            title: t("subscriptionLimitReached"),
            text: upgradeSuggestion.message,
            action: {
              label: t("upgrade"),
              onClick: () => router.push("/pricing"),
            },
            variant: "destructive",
          });

          return;
        }
      }

      let result;
      const fullData = {
        ...processedFormData,
        profileImage,
        coverImage,
        // Include original images if they exist, otherwise use the current images
        originalProfileImage:
          processedFormData.originalProfileImage || profileImage,
        originalCoverImage: processedFormData.originalCoverImage || coverImage,
        // Clean up the username to remove @ prefix if present
        username: processedFormData.username
          ? processedFormData.username.replace("@", "")
          : "",
      };

      // Check if we're in update mode OR if we already have a landingPageId from a previous step
      if (isUpdateMode || processedFormData.landingPageId) {
        // Update existing landing page - for both true update mode or when editing during creation flow
        const idToUpdate = updatingPost?._id || processedFormData.landingPageId;

        console.log("Updating existing landing page with ID:", idToUpdate);
        result = await updateLandingPage(idToUpdate, fullData);
      } else {
        // Create new landing page - only when no landingPageId exists
        console.log("Creating new landing page");
        result = await addLandingPage({
          ...fullData,
          createdBy: mongoUser?._id,
        });
      }

      if (updatingPost) {
        // If in true update mode with an existing updatingPost object, go straight to success flow
        handleSuccessFlow(result, fullData);
      } else if (processedFormData.landingPageId) {
        // If we have a landingPageId (either from URL or from previous creation step), just stay on step 1 and show success message
        toastSet({
          isOpen: true,
          title:
            t("landingPageUpdatedSuccessfully") ||
            "Landing page updated successfully!",
        });

        // Update our createdLandingPage state to sync with the latest changes
        setCreatedLandingPage(result);
      } else {
        // If creating for the first time (no landingPageId), move to step 2 and save the created landing page
        setCreatedLandingPage(result);

        // Update formData with the new landingPageId
        setFormData((prev) => ({
          ...prev,
          landingPageId: result._id,
        }));

        // Move to step 2
        setStep(2);

        toastSet({
          isOpen: true,
          title:
            t("landingPageCreatedAddSocialLinks") ||
            "Landing page created successfully! Now add your social links.",
        });
      }
    } catch (err) {
      console.error("Landing page creation error:", err);
      const errorMessage = `${t("failedTo")} ${
        isUpdateMode || formData.landingPageId ? t("update") : t("create")
      } ${t("landingPage")}. ${t("tryAgain")}`;

      setError("general", errorMessage);
      // Add toast for general error
      toastSet({
        isOpen: true,
        title: t("error") || "Error",
        text: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessFlow = (result, fullData) => {
    // Custom success handler or default behavior
    if (onCustomSuccess) {
      onCustomSuccess({
        res: result,
        formData: fullData,
        mode: isUpdateMode ? "update" : "add",
      });
    } else {
      // Default behavior
      if (!isUpdateMode) {
        resetForm();
      } else {
        // Just clear errors but keep form data for update mode
        clearAllErrors();
      }

      toastSet({
        isOpen: true,
        title: `${t("landingPage")} ${
          isUpdateMode ? t("updated") : t("createdAndConfigured")
        } ${t("successfully")}`,
      });
    }
  };

  const handleFinish = () => {
    // After social links are added, complete the process
    handleSuccessFlow(createdLandingPage || { _id: formData.landingPageId }, {
      ...formData,
      profileImage,
      coverImage,
      // Clean up the username to remove @ prefix if present
      username: formData.username ? formData.username.replace("@", "") : "",
    });

    router.push("/landingpages");
  };

  // Calculate limit info for UI display
  const getLimitInfo = () => {
    if (isExistingLandingPage) return null;

    const limitCheck = checkSubscription2Limit(
      userSubscription,
      userDirectlinks,
      userLandingpages,
      isUpdateMode,
      mongoUser
    );

    return limitCheck;
  };

  const limitCheck = getLimitInfo();
  const displayInfo = limitCheck
    ? getSubscription2DisplayInfo(limitCheck)
    : null;

  // Determine if subscription limits are reached or trial expired
  const hasReachedSubscriptionLimits =
    !isExistingLandingPage &&
    limitCheck &&
    (!limitCheck.withinLimits ||
      (userSubscription?.status === "trialing" &&
        userSubscription?.trialDaysRemaining <= 0));

  // Function to manually refresh the preview
  const refreshPreview = (refreshSocialLinks = true) => {
    // Use a function to ensure we get the most recent state
    setRefreshPreviewTrigger((prev) => {
      const count = typeof prev === "object" ? prev.count + 1 : prev + 1;
      return {
        count,
        refreshSocialLinks,
        timestamp: Date.now(), // Add timestamp to ensure it's always different
      };
    });
  };

  // Handle customization updates
  const handleCustomizationComplete = (colorData) => {
    // Silent update of formData without triggering refreshes
    setFormData((prev) => {
      return {
        ...prev,
        textColor: colorData.textColor || prev.textColor,
        bgColor: colorData.bgColor || prev.bgColor,
        buttonTextColor: colorData.buttonTextColor || prev.buttonTextColor,
        buttonBgColor: colorData.buttonBgColor || prev.buttonBgColor,
        buttonRoundness: colorData.buttonRoundness || prev.buttonRoundness,
        buttonAnimation: colorData.buttonAnimation || prev.buttonAnimation,
        buttonShadow: colorData.buttonShadow || prev.buttonShadow,
        shadowColor: colorData.shadowColor || prev.shadowColor,
        fontFamily: colorData.fontFamily || prev.fontFamily,
        textFontSize: colorData.textFontSize || prev.textFontSize,
        buttonFontSize: colorData.buttonFontSize || prev.buttonFontSize,
        socialIconsType: colorData.socialIconsType || prev.socialIconsType,
        textShadow: colorData.textShadow || prev.textShadow,
        textShadowColor: colorData.textShadowColor || prev.textShadowColor,
        showOnline:
          colorData.showOnline !== undefined
            ? colorData.showOnline
            : prev.showOnline,
        showCity:
          colorData.showCity !== undefined ? colorData.showCity : prev.showCity,
        responseTime: colorData.responseTime || prev.responseTime,
        promotion: colorData.promotion || prev.promotion,
        promotionTextColor:
          colorData.promotionTextColor || prev.promotionTextColor,
        promotionEndsIn: colorData.promotionEndsIn || prev.promotionEndsIn,
        distanceFromVisitor:
          colorData.distanceFromVisitor || prev.distanceFromVisitor,
        disableLinkLogos:
          colorData.disableLinkLogos !== undefined
            ? colorData.disableLinkLogos
            : prev.disableLinkLogos,
        facebookPixelId: colorData.facebookPixelId || prev.facebookPixelId,
      };
    });

    // The preview refresh is handled in LandingPageCustomizationForm already
  };

  // Handle geo filter completion
  const handleGeoFilterComplete = (geoFilterData) => {
    console.log("Geo filter settings complete:", geoFilterData);

    // Since geo filter is saved directly to the database, we don't need to update formData
    // We can just refresh the preview if needed
    refreshPreview(false);
  };

  // Refresh preview when created links count changes (but not too frequently)
  useEffect(() => {
    // Don't auto-refresh in step 2 as it causes infinite loading loops
    // The refresh will be triggered by the SocialMediaLinks component directly
    if (step !== 2 && createdLinksCount > 0) {
      // Only refresh when links count changes - this is actually managing when we go to step 3
      refreshPreview(false); // Don't need to refetch social links data here
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdLinksCount, step]);

  // Auto-refresh preview after any important field changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // These changes don't affect social links, only styles and content
      refreshPreview(false);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.name,
    formData.username,
    formData.bio,
    formData.textColor,
    formData.bgColor,
    formData.buttonTextColor,
    formData.buttonBgColor,
    formData.buttonRoundness,
    formData.buttonAnimation,
    formData.buttonShadow,
    formData.shadowColor,
    formData.fontFamily,
    formData.textFontSize,
    formData.buttonFontSize,
    formData.showOnline,
    formData.showCity,
    formData.responseTime,
    formData.promotion,
    formData.promotionTextColor,
    formData.promotionEndsIn,
    formData.distanceFromVisitor,
    formData.disableLinkLogos,
    formData.facebookPixelId,
    profileImage,
    coverImage,
  ]);

  // Also update the useEffect that refreshes on forced navigation to step 2
  useEffect(() => {
    // Special handling for direct navigation to step 2
    if (step === 2 && formData.landingPageId) {
      // Force refresh the preview once after component mount
      const timer = setTimeout(() => {
        // Only refresh layout/styles, not social links data
        refreshPreview(false);
        console.log(
          "Forced preview refresh for direct step 2 navigation (styles only)"
        );
      }, 500); // Give time for React Query to initialize

      return () => clearTimeout(timer);
    }
  }, [step, formData.landingPageId]); // Only depend on step and landingPageId to run once when these change

  // ! landing page preview mode

  const handleStepNavigation = (newStep) => {
    setStep(newStep);
  };

  if (isLoading && landingPageIdFromUrl) {
    return (
      <div className="p15 w-full max-w-md mx-auto">
        <div className="fcc">
          <div>
            {t("loadingLandingPageData") || "Loading landing page data..."}
          </div>
          {errors.general && (
            <div className="mt-4 text-red-500">{errors.general}</div>
          )}
        </div>
      </div>
    );
  }

  // Render the appropriate step content
  const renderStepContent = () => {
    if (step === 1) {
      // Step 1: Basic landing page info
      return (
        <>
          {/* // ! ProfileImagesUploader */}
          <ProfileImagesUploader
            profileImage={profileImage}
            coverImage={coverImage}
            setProfileImage={setProfileImage}
            setCoverImage={setCoverImage}
            mongoUser={mongoUser}
            originalProfileImage={formData.originalProfileImage}
            originalCoverImage={formData.originalCoverImage}
            setOriginalProfileImage={(url) =>
              setFormData((prev) => ({ ...prev, originalProfileImage: url }))
            }
            setOriginalCoverImage={(url) =>
              setFormData((prev) => ({ ...prev, originalCoverImage: url }))
            }
          />

          <FormUniqueNameInput
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <FormUsernameInput
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />

          <FormBioTextarea
            value={formData.bio}
            onChange={handleChange}
            error={errors.bio}
          />

          <FormActiveCheckbox
            isActive={formData.active}
            onChange={handleChange}
          />

          <FormSection title="advancedSettings">
            {/* New fields from the image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Online status indicator */}
              <div className="p-4 border rounded-md">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="text-sm font-medium">
                    {t("online") || "Online"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("usingAnOnlineIndicator") ||
                    "Using an Online indicator can boost clicks on your exclusive content link."}
                </p>
                <Switch2
                  checked={formData.showOnline}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: "showOnline",
                        type: "checkbox",
                        checked,
                      },
                    })
                  }
                  id="show-online-switch"
                />
              </div>

              {/* City location */}
              <div className="p-4 border rounded-md">
                <div className="flex items-center mb-2">
                  <MapPin size={16} className="mr-2" />
                  <h3 className="text-sm font-medium">{t("city") || "City"}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("usingAGeoIPLocalizer") ||
                    "Using a GeoIP localizer makes fans feel closer to you."}
                </p>
                <Switch2
                  checked={formData.showCity}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: "showCity",
                        type: "checkbox",
                        checked,
                      },
                    })
                  }
                  id="show-city-switch"
                />
              </div>
            </div>

            {/* Group related fields in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Response Time - moved closer to Online status */}
              <div className={`${formData.showOnline ? "" : "opacity-50"}`}>
                <Input
                  label={t("responseTime") || "Response Time"}
                  type="number"
                  min={0}
                  max={999}
                  name="responseTime"
                  value={formData.responseTime}
                  onChange={handleChange}
                  className="block w-full"
                  placeholder={t("enterResponseTime") || "Enter response time"}
                  helperText={
                    t("addIReplyInLessThanXMinutes") ||
                    'Add "I reply in less than X minutes" to the first button.'
                  }
                  disabled={!formData.showOnline}
                />
              </div>

              {/* Distance from visitor - moved closer to City */}
              <div className={`${formData.showCity ? "" : "opacity-50"}`}>
                <Input
                  label={
                    t("distanceFromVisitor") || "Distance From Visitor (miles)"
                  }
                  type="number"
                  name="distanceFromVisitor"
                  value={formData.distanceFromVisitor}
                  onChange={handleChange}
                  className="block w-full"
                  placeholder={`${t("leaveEmptyForRandom")} (1-10 miles)`}
                  helperText={
                    t("distanceHelperText") ||
                    "Set how far away you appear to be. If left empty, a random distance between 1-10 miles will be used."
                  }
                  max="9999"
                  step="0.1"
                  disabled={!formData.showCity}
                />
              </div>
            </div>
          </FormSection>

          <FormSection>
            {/* Promotion */}
            <div className="mt-4">
              <div className="tac fz20 mt25 mb-4">{t("promotion")}</div>
              <Input
                label={t("promotion") || "Promotion"}
                type="text"
                name="promotion"
                value={formData.promotion}
                onChange={handleChange}
                className="mt-1 block w-full"
                placeholder="80% OFF"
                helperText={
                  t("highlightASpecialOffer") ||
                  "Highlight a special offer with a countdown to attract more fans."
                }
              />
            </div>

            {/* Promotion End Time */}
            <div className="mt-4 pt10">
              <div className="setEndTimeForPromotion">
                <SmartDatetimeInput
                  label={t("promotionEndsIn") || "Promotion Ends At"}
                  name="promotionEndsIn"
                  value={
                    formData.promotionEndsIn
                      ? new Date(formData.promotionEndsIn)
                      : null
                  }
                  onValueChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      promotionEndsIn: date ? date.toISOString() : "",
                    }))
                  }
                  className="f block w-full border-input"
                  placeholder={t("selectDate") || "Select date"}
                />
                <p className="px15 fr jcsb mt5 text-xs text-muted-foreground mt-1">
                  {t("setEndTimeForPromotion") ||
                    "Set when your promotion expires to create urgency with a countdown timer."}
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection>
            {/* Other */}
            <div className="tac fz20 mt25 mb-4">{t("other") || "Other"}</div>
            {/* Facebook Pixel ID */}
            <FormPixelIdInput
              value={formData.facebookPixelId}
              onChange={handleChange}
              error={errors.facebookPixelId}
            />
          </FormSection>

          <FormSection>
            {/* Disable Link Logos */}
            <div className="my-4 mb-8">
              <FormActiveCheckbox
                isActive={formData.disableLinkLogos}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "disableLinkLogos",
                      type: "checkbox",
                      checked: e.target.checked,
                    },
                  })
                }
                customLabel={
                  t("disableLinkLogos") ||
                  "Disable Link Logos (Other Links Only)"
                }
              />
              <p className="text-xs text-muted-foreground ml-10">
                {t("hideTheLogosInYourLinkButtons") ||
                  "Hide the logos in your 'Other' link buttons only (social media links will still show icons)"}
              </p>
            </div>
          </FormSection>

          <div className="fcc">
            {/* Show button in the following cases:
                1. Always show when we have a landingPageId (either from updatingPost or from URL or from previous steps)
                2. In add mode when not explicitly on step 1 URL param
            */}
            {(isExistingLandingPage || searchParams.get("step") !== "1") && (
              <FormSubmitButton
                loading={loading}
                isUpdateMode={isUpdateMode}
                isLoadingData={!isExistingLandingPage && isLoadingData}
                hasReachedLimits={hasReachedSubscriptionLimits}
                isAdmin={mongoUser?.isAdmin}
                additionalText={t("landingPage")}
              />
            )}
          </div>
        </>
      );
    } else if (step === 2) {
      // Step 2: Social links editor with link count tracking
      return (
        <>
          <LandingPageSocialLinksEditor
            mongoUser={mongoUser}
            formData={formData}
            setCreatedLinksCount={setCreatedLinksCount}
            refreshPreviewTrigger={refreshPreviewTrigger}
            setRefreshPreviewTrigger={setRefreshPreviewTrigger}
          />

          <div className="fcc g15 mt25">
            <div className="wf fz12 tac text-red-400">
              {createdLinksCount === 0 &&
                (t("pleaseAddAtLeastOneLink") ||
                  "Please add at least one link")}
            </div>
            <Button
              as="div"
              onClick={() => setStep(3)}
              disabled={createdLinksCount === 0}
            >
              {t("continueToCustomization") || "Continue to Customization"}
            </Button>
          </div>
        </>
      );
    } else if (step === 3) {
      // Step 3: Customization
      return (
        <>
          <LandingPageCustomizationForm
            landingPageId={formData.landingPageId}
            initialColors={{
              textColor: formData.textColor,
              bgColor: formData.bgColor,
              buttonTextColor: formData.buttonTextColor,
              buttonBgColor: formData.buttonBgColor,
              buttonRoundness: formData.buttonRoundness,
              buttonAnimation: formData.buttonAnimation,
              buttonShadow: formData.buttonShadow,
              shadowColor: formData.shadowColor,
              fontFamily: formData.fontFamily,
              textFontSize: formData.textFontSize,
              buttonFontSize: formData.buttonFontSize,
              socialIconsType: formData.socialIconsType,
              textShadow: formData.textShadow,
              textShadowColor: formData.textShadowColor,
              promotionTextColor: formData.promotionTextColor,
            }}
            onComplete={handleCustomizationComplete}
            refreshPreview={refreshPreview}
          />

          <div className="fcc g15 mt25">
            <Button as="div" onClick={() => setStep(4)}>
              {t("continueToGeoFiltering")}
            </Button>
          </div>
        </>
      );
    } else if (step === 4) {
      // Step 4: Geo Filtering
      return (
        <>
          <GeoFilterForm
            entityId={formData.landingPageId}
            entityType="landingpage"
            refreshPreview={refreshPreview}
            onComplete={handleGeoFilterComplete}
          />

          <div className="fcc g15 mt25">
            <Button as="div" variant="outline" onClick={handleFinish}>
              {t("finish") || "Finish Setup"}
            </Button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="pt100 maw1000 wf mxa p15">
      <h2 className="title tac mb15">
        {isUpdateMode
          ? t("editLandingPage") || "Update Landing Page"
          : t("addLandingPage") || "Add Landing Page"}
      </h2>

      <FormErrorDisplay error={errors.general} />

      {!isExistingLandingPage && (
        <Subscription2LimitInfo displayInfo={displayInfo} errors={errors} />
      )}

      <div className="border-b wf mb25">
        <StepNavigation
          currentStep={step}
          setStep={handleStepNavigation}
          formData={formData}
        />
      </div>

      <div className="flex flex-col min-[768px]:flex-row !fwn g25 wf por">
        <div className="wf lg:w-1/2 order-2 lg:order-1">
          <form ref={formRef} onSubmit={handleSubmit} className="fc g15">
            {renderStepContent()}
          </form>
        </div>

        <div className="lg:block lg:w-1/2 order-2 lg:order-2 mt-4 lg:mt-0">
          <div className="sticky top-4">
            <AddLandingPageFormPreview
              formData={formData}
              mongoUser={mongoUser}
              profileImage={profileImage}
              coverImage={coverImage}
              refreshTrigger={refreshPreviewTrigger}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLandingPageForm;
