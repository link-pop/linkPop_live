"use client";

import { useState, useRef, useEffect } from "react";
import { add, update } from "@/lib/actions/crud";
import { useRouter } from "next/navigation";
import { useContext } from "@/components/Context/Context";
import { checkNameUniqueness } from "@/lib/actions/checkNameUniqueness";
import {
  fetchUserDirectlinkLandingpageData,
  checkSubscription2Limit,
  getSubscription2LimitMessage,
} from "@/lib/actions/subscription2Limit";
import {
  getSubscription2DisplayInfo,
  getSubscription2UpgradeSuggestion,
} from "./subscription2UIUtils";
import Input from "@/components/ui/shared/Input/Input";
import Textarea from "@/components/ui/shared/Textarea/Textarea";
import Button2 from "@/components/ui/shared/Button/Button2";
import useFormErrors from "@/hooks/useFormErrors";
import FormErrorDisplay from "./FormErrorDisplay";
import Subscription2LimitInfo from "./Subscription2LimitInfo";
import FormActiveCheckbox from "./FormActiveCheckbox";
import GeoFilterForm from "./GeoFilterForm";
import StepNavigation from "./StepNavigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { formatUrl, validateUrl } from "@/lib/utils/formatUrl";
import FormPixelIdInput from "./FormPixelIdInput";
import FormUniqueNameInput from "./FormUniqueNameInput";
import FormBioTextarea from "./FormBioTextarea";
import FormUrlInput from "./FormUrlInput";
import FormSection from "./FormSection";
import FormSubmitButton from "./FormSubmitButton";
import FormShieldProtectionSection from "./FormShieldProtectionSection";
import TitleWithBackButton from "@/components/ui/shared/PageHeading/TitleWithBackButton";

export default function AddDirectlinkForm({
  col = "directlinks",
  mongoUser,
  updatingPost,
  onCustomSuccess,
}) {
  const router = useRouter();
  const formRef = useRef(null);
  const { toastSet } = useContext();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: updatingPost?.name || "",
    destinationUrl: updatingPost?.destinationUrl || "",
    freeUrl: updatingPost?.freeUrl || "",
    desc: updatingPost?.desc || "",
    active: updatingPost?.active !== undefined ? updatingPost.active : true,
    facebookPixelId: updatingPost?.facebookPixelId || "",
    shieldProtection:
      updatingPost?.shieldProtection !== undefined
        ? updatingPost.shieldProtection
        : true,
    safePageUrl: updatingPost?.safePageUrl || "https://www.google.com",
  });

  const [loading, setLoading] = useState(false);
  const { errors, setError, clearAllErrors, createChangeHandler } =
    useFormErrors();
  const [userSubscription, setUserSubscription] = useState(null);
  const [userDirectlinks, setUserDirectlinks] = useState([]);
  const [userLandingpages, setUserLandingpages] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [savedDirectlinkId, setSavedDirectlinkId] = useState(null);

  const isUpdateMode = !!updatingPost;

  // Define if we have an existing directlink (either updating or created and has ID)
  const isExistingDirectlink = isUpdateMode || !!savedDirectlinkId;

  // Fetch user's subscription and existing directlinks
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

  // In update mode, set the directlink ID for use in geo filtering
  useEffect(() => {
    if (isUpdateMode && updatingPost?._id) {
      setSavedDirectlinkId(updatingPost._id);
    }
  }, [isUpdateMode, updatingPost?._id]);

  const resetForm = () => {
    setFormData({
      name: "",
      destinationUrl: "",
      freeUrl: "",
      desc: "",
      active: true,
      facebookPixelId: "",
      shieldProtection: true,
      safePageUrl: "https://www.google.com",
    });
    clearAllErrors();
    formRef.current?.reset();
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
    setLoading(true);
    clearAllErrors();

    try {
      // Validate URLs
      if (formData.destinationUrl && !validateUrl(formData.destinationUrl)) {
        const errorMessage = t("invalidUrl") || "Invalid URL format";
        setError("destinationUrl", errorMessage);
        // Add toast for URL validation error
        toastSet({
          isOpen: true,
          title: t("urlValidationError") || "URL Validation Error",
          text: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (formData.freeUrl && !validateUrl(formData.freeUrl)) {
        const errorMessage = t("invalidUrl") || "Invalid URL format";
        setError("freeUrl", errorMessage);
        // Add toast for free URL validation error
        toastSet({
          isOpen: true,
          title: t("urlValidationError") || "URL Validation Error",
          text: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (formData.safePageUrl && !validateUrl(formData.safePageUrl)) {
        const errorMessage = t("invalidUrl") || "Invalid URL format";
        setError("safePageUrl", errorMessage);
        // Add toast for safe page URL validation error
        toastSet({
          isOpen: true,
          title: t("urlValidationError") || "URL Validation Error",
          text: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Format URLs before saving
      const formattedData = {
        ...formData,
        destinationUrl: formData.destinationUrl
          ? formatUrl(formData.destinationUrl)
          : "",
        freeUrl: formData.freeUrl ? formatUrl(formData.freeUrl) : "",
        safePageUrl: formData.safePageUrl
          ? formatUrl(formData.safePageUrl)
          : "https://www.google.com",
      };

      // Check name uniqueness (case-insensitive)
      const nameCheck = await checkNameUniqueness(
        formData.name,
        "directlinks",
        updatingPost?._id || savedDirectlinkId || null
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

      // Check subscription limits (only for new directlinks)
      if (!isExistingDirectlink) {
        const limitCheck = checkSubscription2Limit(
          userSubscription,
          userDirectlinks,
          userLandingpages,
          isUpdateMode,
          mongoUser
        );

        if (!limitCheck.withinLimits) {
          const errorMessage = getSubscription2LimitMessage(userSubscription);
          setError("subscription", errorMessage);
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

      // Process data
      let result;
      if (isUpdateMode) {
        // Update existing directlink when coming from update route
        console.log(
          "Updating existing directlink in update mode:",
          updatingPost._id
        );
        result = await update({
          col,
          data: { _id: updatingPost._id },
          update: formattedData,
        });
      } else if (savedDirectlinkId) {
        // Update existing directlink that was created earlier in the flow
        console.log(
          "Updating existing directlink with saved ID:",
          savedDirectlinkId
        );
        result = await update({
          col,
          data: { _id: savedDirectlinkId },
          update: formattedData,
        });
      } else {
        // Create new directlink
        console.log("Creating new directlink");
        result = await add({
          col,
          data: {
            ...formattedData,
            createdBy: mongoUser?._id,
          },
        });
      }

      if (!result) {
        const errorMessage =
          t("failedToSaveDirectlink") || "Failed to save directlink";
        throw new Error(errorMessage);
      }

      if (isUpdateMode) {
        // Handle update success when coming from update route
        if (onCustomSuccess) {
          onCustomSuccess({
            res: result,
            formData: formattedData,
            mode: "update",
          });
        } else {
          toastSet({
            isOpen: true,
            title:
              t("directLinkUpdatedSuccessfully") ||
              "Direct link updated successfully",
          });
          router.push("/directlinks");
        }
      } else if (savedDirectlinkId) {
        // When updating an existing directlink during creation flow, just show success toast
        toastSet({
          isOpen: true,
          title:
            t("directLinkUpdatedSuccessfully") ||
            "Direct link updated successfully",
        });
      } else {
        // For brand new creations, save the ID and move to step 2
        setSavedDirectlinkId(result._id);
        setCurrentStep(2);

        toastSet({
          isOpen: true,
          title:
            t("directlinkCreated") ||
            "Direct link created successfully! Now set up geo filtering.",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = `${t("failedTo")} ${
        isUpdateMode ? t("update") : t("create")
      } ${t("directLink")}. ${t("tryAgain")}`;

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

  // Handle geo filter completion
  const handleGeoFilterComplete = (geoFilterData) => {
    console.log("Geo filter settings complete:", geoFilterData);

    toastSet({
      isOpen: true,
      title:
        t("directlinkConfigurationComplete") ||
        "Direct link configuration complete!",
    });
  };

  // Calculate limit info for UI display
  const getLimitInfo = () => {
    if (isExistingDirectlink) return null;

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
    !isExistingDirectlink &&
    limitCheck &&
    (!limitCheck.withinLimits ||
      (userSubscription?.status === "trialing" &&
        userSubscription?.trialDaysRemaining <= 0));

  // Handle step navigation
  const handleStepNavigation = (newStep) => {
    setCurrentStep(newStep);
  };

  return (
    <div className="p15 pt100 wf maw600 mxa">
      <TitleWithBackButton
        title={
          isUpdateMode
            ? t("updateDirectLink") || "Update Direct Link"
            : t("addDirectLink") || "Add Direct Link"
        }
        className="fcc mb15"
      />

      {!isExistingDirectlink && (
        <Subscription2LimitInfo displayInfo={displayInfo} errors={errors} />
      )}

      <FormErrorDisplay error={errors.general} />

      <div className="wf mb25">
        <StepNavigation
          currentStep={currentStep}
          setStep={handleStepNavigation}
          formData={{ landingPageId: savedDirectlinkId }} // Use savedDirectlinkId to control step access
          stepsCount={2} // Only show 2 steps
        />
      </div>

      {currentStep === 1 ? (
        <>
          <form ref={formRef} onSubmit={handleSubmit} className="fc g15">
            <FormUniqueNameInput
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <FormSection showBorder={false}>
              <FormBioTextarea
                value={formData.desc}
                onChange={handleChange}
                error={errors.desc}
                name="desc"
              />
            </FormSection>

            <FormActiveCheckbox
              isActive={formData.active}
              onChange={handleChange}
              customLabel={t("active")}
            />

            <FormSection title="urlSettings" showBorder={false}>
              <FormUrlInput
                name="destinationUrl"
                value={formData.destinationUrl}
                onChange={handleChange}
                error={errors.destinationUrl}
                required={true}
                label="destinationUrl"
                hideHelperText={false}
                helperText={
                  t("destinationUrlDesc") ||
                  "The primary URL where visitors will be redirected"
                }
              />

              <FormUrlInput
                name="freeUrl"
                value={formData.freeUrl}
                onChange={handleChange}
                error={errors.freeUrl}
                label="freeUrl"
                hideHelperText={false}
                helperText={
                  t("freeUrlDesc") ||
                  "Optional alternative URL for visitors who are trying to leave your page - * works only with ${APP_NAME} website"
                }
              />
            </FormSection>

            <FormSection showBorder={false}>
              <FormShieldProtectionSection
                shieldProtection={formData.shieldProtection}
                safePageUrl={formData.safePageUrl}
                onChange={handleChange}
                errors={errors}
                hideHelperText={true}
              />
            </FormSection>

            <FormSection showBorder={false}>
              {/* Other */}
              <div className="tac fz20 mt25 mb-4">{t("other") || "Other"}</div>
              {/* Facebook Pixel ID */}
              <FormPixelIdInput
                value={formData.facebookPixelId}
                onChange={handleChange}
                error={errors.facebookPixelId}
              />
            </FormSection>

            <div className="fcc">
              <FormSubmitButton
                loading={loading}
                isUpdateMode={isUpdateMode}
                isLoadingData={!isExistingDirectlink && isLoadingData}
                hasReachedLimits={hasReachedSubscriptionLimits}
                isAdmin={mongoUser?.isAdmin}
                additionalText={t("directLink")}
              />
            </div>
          </form>
        </>
      ) : (
        <>
          <GeoFilterForm
            entityId={savedDirectlinkId}
            entityType="directlink"
            onComplete={handleGeoFilterComplete}
          />

          <div className="fcc mt-4">
            <Button2
              variant="outline"
              onClick={() => router.push("/directlinks")}
              className="mt-4"
            >
              {t("skipGeoFilter") || "Skip Geo Filter & Finish"}
            </Button2>
          </div>
        </>
      )}
    </div>
  );
}
