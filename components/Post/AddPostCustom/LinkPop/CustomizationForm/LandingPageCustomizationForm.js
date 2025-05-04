"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "use-debounce";
import ColorPicker from "@/components/ui/shared/ColorPicker/ColorPicker";
import { updateLandingPage } from "@/lib/actions/updateLandingPage";
import { useContext } from "@/components/Context/Context";
import SelectWithWrapper from "@/components/ui/shared/Select/SelectWithWrapper";
import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function LandingPageCustomizationForm({
  landingPageId,
  initialColors,
  onComplete,
  refreshPreview,
}) {
  const { toastSet } = useContext();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);
  const initialColorsRef = useRef(initialColors);
  const saveTimeoutRef = useRef(null);

  // Setup form state with guaranteed defaults (from initialColors)
  const [colors, setColors] = useState({
    textColor: initialColors?.textColor || "#ffffff",
    bgColor: initialColors?.bgColor || "",
    buttonTextColor: initialColors?.buttonTextColor || "#ffffff",
    buttonBgColor: initialColors?.buttonBgColor || "#ffb6c1",
    buttonRoundness: initialColors?.buttonRoundness || "medium",
    buttonAnimation: initialColors?.buttonAnimation || "none",
    buttonShadow: initialColors?.buttonShadow || "none",
    shadowColor: initialColors?.shadowColor || "#000000",
    fontFamily: initialColors?.fontFamily || "default",
    textFontSize: initialColors?.textFontSize || "medium",
    buttonFontSize: initialColors?.buttonFontSize || "medium",
    socialIconsType: initialColors?.socialIconsType || "type2",
    textShadow: initialColors?.textShadow || "none",
    textShadowColor: initialColors?.textShadowColor || "#000000",
    promotionTextColor: initialColors?.promotionTextColor || "#FF0000",
  });

  // Update colors when initialColors changes
  useEffect(() => {
    // Check if initialColors has actually changed (to avoid infinite loops)
    if (
      JSON.stringify(initialColorsRef.current) !== JSON.stringify(initialColors)
    ) {
      initialColorsRef.current = initialColors;

      setColors({
        textColor: initialColors?.textColor || "#ffffff",
        bgColor: initialColors?.bgColor || "",
        buttonTextColor: initialColors?.buttonTextColor || "#ffffff",
        buttonBgColor: initialColors?.buttonBgColor || "#ffb6c1",
        buttonRoundness: initialColors?.buttonRoundness || "medium",
        buttonAnimation: initialColors?.buttonAnimation || "none",
        buttonShadow: initialColors?.buttonShadow || "none",
        shadowColor: initialColors?.shadowColor || "#000000",
        fontFamily: initialColors?.fontFamily || "default",
        textFontSize: initialColors?.textFontSize || "medium",
        buttonFontSize: initialColors?.buttonFontSize || "medium",
        socialIconsType: initialColors?.socialIconsType || "type2",
        textShadow: initialColors?.textShadow || "none",
        textShadowColor: initialColors?.textShadowColor || "#000000",
        promotionTextColor: initialColors?.promotionTextColor || "#FF0000",
      });
    }
  }, [initialColors]);

  // Function to save changes
  const saveChanges = useCallback(
    (dataToSave) => {
      if (!landingPageId || loading) return;

      setLoading(true);

      updateLandingPage(landingPageId, dataToSave)
        .then(() => {
          // Notify parent component about the update
          onComplete?.(dataToSave);
          // Manually refresh the preview
          refreshPreview?.(false);
          setLoading(false);
        })
        .catch(() => {
          toastSet({
            isOpen: true,
            title: t("error"),
            text: t("failedToUpdateColors") || "Failed to update colors",
            variant: "destructive",
          });
          setLoading(false);
        });
    },
    [landingPageId, loading, onComplete, refreshPreview, t, toastSet]
  );

  // Handle form value changes with debounced save
  const handleColorChange = (colorType, value) => {
    // Update state immediately
    setColors((prev) => ({
      ...prev,
      [colorType]: value,
    }));

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save changes with captured state
    saveTimeoutRef.current = setTimeout(() => {
      // Use a callback to get the latest state
      setColors((currentColors) => {
        // Save the current state
        saveChanges(currentColors);
        // Return unchanged state
        return currentColors;
      });
    }, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Font size options
  const fontSizeOptions = [
    { label: t("default") || "Default", value: "default" },
    { label: t("small") || "Small", value: "small" },
    { label: t("medium") || "Medium", value: "medium" },
    { label: t("large") || "Large", value: "large" },
    { label: "XL", value: "xl" },
    { label: "XXL", value: "xxl" },
    { label: "XXXL", value: "xxxl" },
  ];

  // Font options
  const fontOptions = [
    // Default
    { value: "default", label: t("defaultFont") || "Default Font" },

    // Sans-serif fonts
    { value: "inter", label: "Inter" },
    { value: "roboto", label: "Roboto" },
    { value: "montserrat", label: "Montserrat" },
    { value: "poppins", label: "Poppins" },
    { value: "oswald", label: "Oswald" },
    { value: "raleway", label: "Raleway" },
    { value: "opensans", label: "Open Sans" },
    { value: "lato", label: "Lato" },
    { value: "nunito", label: "Nunito" },
    { value: "rubik", label: "Rubik" },
    { value: "sourcesans", label: "Source Sans" },
    { value: "ubuntu", label: "Ubuntu" },
    { value: "worksans", label: "Work Sans" },
    { value: "quicksand", label: "Quicksand" },
    { value: "mulish", label: "Mulish" },
    { value: "manrope", label: "Manrope" },
    { value: "karla", label: "Karla" },
    { value: "outfit", label: "Outfit" },
    { value: "firasans", label: "Fira Sans" },
    { value: "cabin", label: "Cabin" },
    { value: "josefinsans", label: "Josefin Sans" },
    { value: "barlow", label: "Barlow" },
    { value: "dmsans", label: "DM Sans" },

    // Serif fonts
    { value: "playfair", label: "Playfair Display" },
    { value: "lora", label: "Lora" },
    { value: "merriweather", label: "Merriweather" },
    { value: "vollkorn", label: "Vollkorn" },
    { value: "breeserif", label: "Bree Serif" },
    { value: "bitter", label: "Bitter" },
    { value: "domine", label: "Domine" },
    { value: "crimsonpro", label: "Crimson Pro" },
    { value: "eb", label: "EB Garamond" },
    { value: "cormorant", label: "Cormorant" },
    { value: "alegreya", label: "Alegreya" },
    { value: "source", label: "Source Serif" },
    { value: "spectral", label: "Spectral" },
    { value: "lusitana", label: "Lusitana" },
    { value: "bodoni", label: "Bodoni Moda" },

    // Display and decorative fonts
    { value: "bebasneue", label: "Bebas Neue" },
    { value: "comfortaa", label: "Comfortaa" },
    { value: "caveat", label: "Caveat" },
    { value: "pacifico", label: "Pacifico" },
    { value: "lobster", label: "Lobster" },
    { value: "architectsdaughter", label: "Architects Daughter" },
    { value: "permanentmarker", label: "Permanent Marker" },
    { value: "satisfy", label: "Satisfy" },
    { value: "sacramento", label: "Sacramento" },
    { value: "greatvibes", label: "Great Vibes" },
    { value: "dancingscript", label: "Dancing Script" },
    { value: "abril", label: "Abril Fatface" },
    { value: "alfa", label: "Alfa Slab One" },
    { value: "righteous", label: "Righteous" },
    { value: "creepster", label: "Creepster" },
    { value: "bangers", label: "Bangers" },
    { value: "pressstart", label: "Press Start 2P" },
    { value: "specialelite", label: "Special Elite" },
    { value: "vt323", label: "VT323" },

    // Monospace fonts
    { value: "robotomono", label: "Roboto Mono" },
    { value: "spacemono", label: "Space Mono" },
    { value: "inconsolata", label: "Inconsolata" },
    { value: "cousine", label: "Cousine" },
    { value: "firacode", label: "Fira Code" },
  ];

  // Roundness options
  const roundnessOptions = [
    { value: "none", label: t("noneRoundness") || "None (0px)" },
    { value: "small", label: t("smallRoundness") || "Small (5px)" },
    { value: "medium", label: t("mediumRoundness") || "Medium (10px)" },
    { value: "large", label: t("largeRoundness") || "Large (20px)" },
    { value: "full", label: t("fullRoundness") || "Full (9999px)" },
  ];

  // Shadow options
  const shadowOptions = [
    { value: "none", label: t("noShadow") || "No Shadow" },
    { value: "soft", label: t("softShadow") || "Soft Shadow" },
    { value: "hard", label: t("hardShadow") || "Hard Shadow" },
  ];

  // Animation options for other links/buttons
  const animationOptions = [
    { value: "none", label: t("none") || "None" },
    { value: "bouncing", label: t("bouncing") || "Bouncing" },
    { value: "buzzing", label: t("buzzing") || "Buzzing" },
    { value: "pulsing", label: t("pulsing") || "Pulsing" },
    { value: "shaking", label: t("shaking") || "Shaking" },
    { value: "swinging", label: t("swinging") || "Swinging" },
    { value: "glowing", label: t("glowing") || "Glowing" },
    { value: "floating", label: t("floating") || "Floating" },
    { value: "wobbling", label: t("wobbling") || "Wobbling" },
    { value: "flipping", label: t("flipping") || "Flipping" },
  ];

  // Add socialIconsType options
  const socialIconsTypeOptions = [
    {
      value: "type1",
      label: t("socialIconsType1") || "Social Icons Type 1 (with background)",
    },
    {
      value: "type2",
      label: t("socialIconsType2") || "Social Icons Type 2 (icons only)",
    },
  ];

  // Add text shadow options
  const textShadowOptions = [
    { value: "none", label: t("noTextShadow") || "No Text Shadow" },
    { value: "light", label: t("lightTextShadow") || "Light Text Shadow" },
    { value: "medium", label: t("mediumTextShadow") || "Medium Text Shadow" },
    { value: "strong", label: t("strongTextShadow") || "Strong Text Shadow" },
  ];

  // Get icon size based on button font size
  const getIconSize = (fontSize) => {
    const sizeMap = {
      default: 16,
      xsmall: 12,
      small: 14,
      medium: 16,
      large: 18,
      xl: 22,
      xxl: 24,
      xxxl: 28,
    };
    return sizeMap[fontSize] || 16;
  };

  // Button links component with dynamic icon sizing
  const SocialButtonWithDynamicIcon = ({ link, className = "" }) => {
    const iconSize = getIconSize(colors.buttonFontSize);

    return (
      <Link
        href={link.url || "#"}
        className={`f aic jcsb bg-accent py10 px15 br15 ${className}`}
      >
        <div className="f aic g10">
          <div className="fcc w40 h40 br10">
            <link.icon size={iconSize} />
          </div>
          <span>{link.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="fc g30">
      {/* Page Style Group */}
      <div className="fc g15">
        <div className="ttu fz14 fw600 tac bg-accent py10 px20 br4 mxa w320">
          {t("pageStyle") || "Page Style"}
        </div>

        <ColorPicker
          color={colors.bgColor}
          onColorChange={(color) => handleColorChange("bgColor", color)}
          label={t("backgroundColor") || "Background Color"}
          className="f mxa g10 bg-accent px20 py10 br20 w320 hover:scale-105"
        />

        <SelectWithWrapper
          value={colors.fontFamily}
          onValueChange={(value) => handleColorChange("fontFamily", value)}
          options={fontOptions}
          label={t("font") || "Font"}
          customLabelText={
            colors.fontFamily === "default"
              ? t("font") || "Font"
              : `${t("font") || "Font"}: ${
                  fontOptions.find((opt) => opt.value === colors.fontFamily)
                    ?.label
                }`
          }
        />

        <SelectWithWrapper
          value={colors.textFontSize}
          onValueChange={(value) => handleColorChange("textFontSize", value)}
          options={fontSizeOptions}
          label={t("textFontSize") || "Text Font Size"}
          customLabelText={
            colors.textFontSize === "medium" ||
            colors.textFontSize === "default"
              ? t("textFontSize") || "Text Font Size"
              : `${t("textSize") || "Text Size"}: ${colors.textFontSize}`
          }
        />

        <ColorPicker
          color={colors.textColor}
          onColorChange={(color) => handleColorChange("textColor", color)}
          label={t("textColor") || "Text Color"}
          className="f mxa g10 bg-accent px20 py10 br20 w320 hover:scale-105"
        />

        <ColorPicker
          color={colors.promotionTextColor}
          onColorChange={(color) =>
            handleColorChange("promotionTextColor", color)
          }
          label={t("promotionTextColor") || "Promotion Text Color"}
          className="f mxa g10 bg-accent px20 py10 br20 w320 hover:scale-105"
        />

        <SelectWithWrapper
          value={colors.textShadow}
          onValueChange={(value) => handleColorChange("textShadow", value)}
          options={textShadowOptions}
          label={t("textShadow") || "Text Shadow"}
          customLabelText={
            colors.textShadow === "none"
              ? t("textShadow") || "Text Shadow"
              : `${t("textShadow") || "Text Shadow"}: ${colors.textShadow}`
          }
        />

        {colors.textShadow !== "none" && (
          <ColorPicker
            color={colors.textShadowColor}
            onColorChange={(color) =>
              handleColorChange("textShadowColor", color)
            }
            label={t("textShadowColor") || "Text Shadow Color"}
            className="f mxa g10 bg-accent px20 py10 br20 w320 hover:scale-105"
          />
        )}
      </div>

      {/* Button Style Group */}
      <div className="fc g15">
        <div className="ttu fz14 fw600 tac bg-accent py10 px20 br4 mxa w320">
          {t("buttonAndLinkStyle") || "Button & Link Style"}
        </div>

        <SelectWithWrapper
          value={colors.socialIconsType}
          onValueChange={(value) => handleColorChange("socialIconsType", value)}
          options={socialIconsTypeOptions}
          label={t("socialIconsStyle") || "Social Icons Style"}
          customLabelText={
            colors.socialIconsType === "type1"
              ? t("socialIconsStyle1") || "Social Icons Style 1"
              : t("socialIconsStyle2") || "Social Icons Style 2"
          }
        />

        <ColorPicker
          color={colors.buttonTextColor}
          onColorChange={(color) => handleColorChange("buttonTextColor", color)}
          label={t("buttonTextColor") || "Button Text Color"}
          className="f mxa g10 bg-accent px20 py10 br20 w320 hover:scale-105"
        />

        <ColorPicker
          color={colors.buttonBgColor}
          onColorChange={(color) => handleColorChange("buttonBgColor", color)}
          label={t("buttonBackgroundColor") || "Button Background Color"}
          className="f mxa g10 bg-accent px20 py10 br20 w320 hover:scale-105"
        />

        <SelectWithWrapper
          value={colors.buttonFontSize}
          onValueChange={(value) => handleColorChange("buttonFontSize", value)}
          options={fontSizeOptions}
          label={t("buttonFontSize") || "Button Font Size"}
          customLabelText={
            colors.buttonFontSize === "medium" ||
            colors.buttonFontSize === "default"
              ? t("buttonFontSize") || "Button Font Size"
              : `${t("buttonSize") || "Button Size"}: ${colors.buttonFontSize}`
          }
        />

        <SelectWithWrapper
          value={colors.buttonRoundness}
          onValueChange={(value) => handleColorChange("buttonRoundness", value)}
          options={roundnessOptions}
          label={t("buttonRoundness") || "Button Roundness"}
          customLabelText={
            colors.buttonRoundness === "none"
              ? t("buttonRoundness") || "Button Roundness"
              : `${t("roundness") || "Roundness"}: ${colors.buttonRoundness}`
          }
        />

        <SelectWithWrapper
          value={colors.buttonAnimation}
          onValueChange={(value) => handleColorChange("buttonAnimation", value)}
          options={animationOptions}
          label={t("buttonAnimation") || "Button Animation"}
          customLabelText={
            colors.buttonAnimation === "none"
              ? t("buttonAnimation") || "Button Animation"
              : `${t("animation") || "Animation"}: ${colors.buttonAnimation}`
          }
        />

        <SelectWithWrapper
          value={colors.buttonShadow}
          onValueChange={(value) => handleColorChange("buttonShadow", value)}
          options={shadowOptions}
          label={t("buttonShadow") || "Button Shadow"}
          customLabelText={
            colors.buttonShadow === "none"
              ? t("buttonShadow") || "Button Shadow"
              : `${t("shadow") || "Shadow"}: ${colors.buttonShadow}`
          }
        />

        {colors.buttonShadow !== "none" && (
          <ColorPicker
            color={colors.shadowColor}
            onColorChange={(color) => handleColorChange("shadowColor", color)}
            label={t("buttonShadowColor") || "Button Shadow Color"}
            className="f mxa g10 bg-accent px20 py10 br20 w320 hover:scale-105"
          />
        )}
      </div>

      {loading && (
        <div className="text-foreground/50 text-center">
          {t("savingChanges") || "Saving changes..."}
        </div>
      )}
    </div>
  );
}
