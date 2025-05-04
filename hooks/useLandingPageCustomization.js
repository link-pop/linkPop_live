import { useEffect } from "react";

export default function useLandingPageCustomization({
  id,
  textColor = "#ffffff",
  bgColor,
  buttonTextColor = "#ffffff",
  buttonBgColor = "#ffb6c1",
  buttonRoundness = "medium",
  buttonAnimation = "none",
  buttonShadow = "none",
  shadowColor = "#000000",
  fontFamily = "default",
  textFontSize = "medium",
  buttonFontSize = "medium",
  socialIconsType = "type2",
  textShadow = "none",
  textShadowColor = "#000000",
  showOnline = true,
  showCity = true,
  responseTime = "",
  promotion = "",
  promotionTextColor = "#FF0000",
  promotionEndsIn = "",
  distanceFromVisitor = "",
  disableLinkLogos = false,
  facebookPixelId = "",
  isPreview = false,
}) {
  useEffect(() => {
    // Create or update style element
    const styleId = isPreview
      ? `preview-style-${id}`
      : `landingpage-style-${id}`;
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Font family mapping
    const fontFamilyMap = {
      default: "",
      // Sans-serif fonts
      inter: "'Inter', sans-serif",
      roboto: "'Roboto', sans-serif",
      montserrat: "'Montserrat', sans-serif",
      poppins: "'Poppins', sans-serif",
      oswald: "'Oswald', sans-serif",
      raleway: "'Raleway', sans-serif",
      opensans: "'Open Sans', sans-serif",
      lato: "'Lato', sans-serif",
      nunito: "'Nunito', sans-serif",
      rubik: "'Rubik', sans-serif",
      sourcesans: "'Source Sans 3', sans-serif",
      ubuntu: "'Ubuntu', sans-serif",
      worksans: "'Work Sans', sans-serif",
      quicksand: "'Quicksand', sans-serif",
      mulish: "'Mulish', sans-serif",
      manrope: "'Manrope', sans-serif",
      karla: "'Karla', sans-serif",
      outfit: "'Outfit', sans-serif",
      firasans: "'Fira Sans', sans-serif",
      cabin: "'Cabin', sans-serif",
      josefinsans: "'Josefin Sans', sans-serif",
      barlow: "'Barlow', sans-serif",
      dmsans: "'DM Sans', sans-serif",

      // Serif fonts
      playfair: "'Playfair Display', serif",
      lora: "'Lora', serif",
      merriweather: "'Merriweather', serif",
      vollkorn: "'Vollkorn', serif",
      breeserif: "'Bree Serif', serif",
      bitter: "'Bitter', serif",
      domine: "'Domine', serif",
      crimsonpro: "'Crimson Pro', serif",
      eb: "'EB Garamond', serif",
      cormorant: "'Cormorant', serif",
      alegreya: "'Alegreya', serif",
      source: "'Source Serif 4', serif",
      spectral: "'Spectral', serif",
      lusitana: "'Lusitana', serif",
      bodoni: "'Bodoni Moda', serif",

      // Display and decorative fonts
      bebasneue: "'Bebas Neue', display",
      comfortaa: "'Comfortaa', display",
      caveat: "'Caveat', handwriting",
      pacifico: "'Pacifico', handwriting",
      lobster: "'Lobster', display",
      architectsdaughter: "'Architects Daughter', handwriting",
      permanentmarker: "'Permanent Marker', handwriting",
      satisfy: "'Satisfy', handwriting",
      sacramento: "'Sacramento', cursive",
      greatvibes: "'Great Vibes', cursive",
      dancingscript: "'Dancing Script', cursive",
      abril: "'Abril Fatface', display",
      alfa: "'Alfa Slab One', display",
      righteous: "'Righteous', display",
      creepster: "'Creepster', display",
      bangers: "'Bangers', display",
      pressstart: "'Press Start 2P', display",
      specialelite: "'Special Elite', display",
      vt323: "'VT323', monospace",

      // Monospace fonts
      robotomono: "'Roboto Mono', monospace",
      spacemono: "'Space Mono', monospace",
      inconsolata: "'Inconsolata', monospace",
      cousine: "'Cousine', monospace",
      firacode: "'Fira Code', monospace",
    };

    // Get the CSS value for the selected font
    const fontFamilyValue = fontFamilyMap[fontFamily] || "";

    // Load Google Fonts if a non-default font is selected
    if (fontFamily !== "default" && fontFamilyValue) {
      // Check if the font is already loaded
      const fontLinkId = `google-font-${fontFamily}`;
      if (!document.getElementById(fontLinkId)) {
        // Font name mapping for URL
        const fontUrlMap = {
          // Special cases that need different formatting
          sourcesans: "Source+Sans+3",
          sourcesanspro: "Source+Sans+Pro",
          dmsans: "DM+Sans",
          opensans: "Open+Sans",
          crimsonpro: "Crimson+Pro",
          eb: "EB+Garamond",
          source: "Source+Serif+4",
          playfair: "Playfair+Display",
          josefinsans: "Josefin+Sans",
          firasans: "Fira+Sans",
          firacode: "Fira+Code",
          bebasneue: "Bebas+Neue",
          permanentmarker: "Permanent+Marker",
          architectsdaughter: "Architects+Daughter",
          dancingscript: "Dancing+Script",
          greatvibes: "Great+Vibes",
          abril: "Abril+Fatface",
          robotomono: "Roboto+Mono",
          pressstart: "Press+Start+2P",
          spacemono: "Space+Mono",
          specialelite: "Special+Elite",
          breeserif: "Bree+Serif",
          bodoni: "Bodoni+Moda",
          worksans: "Work+Sans",
          alfa: "Alfa+Slab+One",
        };

        // Default: capitalize and replace spaces with +
        const fontForUrl =
          fontUrlMap[fontFamily] ||
          fontFamily.charAt(0).toUpperCase() +
            fontFamily.slice(1).replace(/([A-Z])/g, "+$1");

        const link = document.createElement("link");
        link.id = fontLinkId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontForUrl}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }

    // Font size mapping for text (username & bio)
    const fontSizeMap = {
      default: "1rem", // 16px
      small: "0.875rem", // 14px
      medium: "1rem", // 16px
      large: "1.125rem", // 18px
      xl: "1.5rem", // 24px
      xxl: "1.75rem", // 28px
      xxxl: "2rem", // 32px
    };

    // Font size mapping for buttons
    const buttonFontSizeMap = {
      default: "1rem", // 16px
      small: "0.875rem", // 14px
      medium: "1rem", // 16px
      large: "1.125rem", // 18px
      xl: "1.5rem", // 24px
      xxl: "1.75rem", // 28px
      xxxl: "2rem", // 32px
    };

    // Get font sizes based on settings
    const textFontSizeValue = fontSizeMap[textFontSize] || fontSizeMap.medium;
    const buttonFontSizeValue =
      buttonFontSizeMap[buttonFontSize] || buttonFontSizeMap.medium;

    // Convert buttonRoundness value to pixel values
    const roundnessMap = {
      none: "0px",
      small: "5px",
      medium: "10px",
      large: "20px",
      full: "9999px",
    };

    const borderRadius = roundnessMap[buttonRoundness] || "10px";

    // Shadow style based on shadow type
    const getShadowCSS = () => {
      switch (buttonShadow) {
        case "soft":
          return `box-shadow: 3px 3px 10px ${shadowColor}80;`;
        case "hard":
          return `box-shadow: 5px 5px 0px ${shadowColor};`;
        default:
          return "";
      }
    };

    const shadowCSS = getShadowCSS();

    // Animation keyframes definitions
    const animationKeyframes = {
      bouncing: `
        @keyframes bouncing-${id} {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `,
      buzzing: `
        @keyframes buzzing-${id} {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
      `,
      pulsing: `
        @keyframes pulsing-${id} {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `,
      shaking: `
        @keyframes shaking-${id} {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `,
      swinging: `
        @keyframes swinging-${id} {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(10deg); }
          40%, 60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }
      `,
      glowing: `
        @keyframes glowing-${id} {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.7); }
          50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.9); }
        }
      `,
      floating: `
        @keyframes floating-${id} {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(2deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(5px) rotate(-2deg); }
        }
      `,
      wobbling: `
        @keyframes wobbling-${id} {
          0%, 100% { transform: skewX(0deg) skewY(0deg); }
          25% { transform: skewX(3deg) skewY(1deg); }
          50% { transform: skewX(-3deg) skewY(-1deg); }
          75% { transform: skewX(3deg) skewY(1deg); }
        }
      `,
      flipping: `
        @keyframes flipping-${id} {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
      `,
    };

    // Add blinking animation keyframe for online indicator
    const blinkingAnimationKeyframe = `
      @keyframes blinking-online-${id} {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;

    // Animation CSS properties
    const animationCSS =
      buttonAnimation !== "none"
        ? `animation: ${buttonAnimation}-${id} 2s infinite ease-in-out; overflow: visible !important;`
        : "";

    // Get text shadow CSS based on shadow type
    const getTextShadowCSS = () => {
      switch (textShadow) {
        case "light":
          return `text-shadow: 1px 1px 2px ${textShadowColor}80;`;
        case "medium":
          return `text-shadow: 2px 2px 4px ${textShadowColor};`;
        case "strong":
          return `text-shadow: 3px 3px 6px ${textShadowColor}, -1px -1px 1px ${textShadowColor};`;
        default:
          return "";
      }
    };

    const textShadowCSS = getTextShadowCSS();

    // Define CSS for custom colors
    const css = `
      ${animationKeyframes[buttonAnimation] || ""}
      ${blinkingAnimationKeyframe}
      
      /* Debug Info */
      /* Promotion Text Color: ${promotionTextColor || "#FF0000"} */
      
      ${isPreview ? `.PreviewContainer-${id}` : `.LandingPage-${id}`} {
        ${bgColor ? `background-color: ${bgColor} !important;` : ""}
        ${fontFamilyValue ? `font-family: ${fontFamilyValue} !important;` : ""}
      }
      
      ${
        isPreview
          ? `html body .PreviewContainer-${id} *`
          : `html body .LandingPage-${id} *`
      } {
        ${fontFamilyValue ? `font-family: ${fontFamilyValue} !important;` : ""}
      }
      
      ${
        isPreview
          ? `.PreviewContainer-${id} .landing-page-text`
          : `.LandingPage-${id} .landing-page-text`
      } {
        ${textColor ? `color: ${textColor} !important;` : ""}
        ${
          textFontSizeValue ? `font-size: ${textFontSizeValue} !important;` : ""
        }
        ${textShadowCSS}
      }

      /* Online status indicator blinking effect */
      ${
        isPreview
          ? `.PreviewContainer-${id} .w-2.h-2.bg-green-500.rounded-full`
          : `.LandingPage-${id} .w-2.h-2.bg-green-500.rounded-full`
      } {
        animation: blinking-online-${id} 1.5s infinite ease-in-out;
      }

      /* Maximum specificity selectors for promotion text */
      /* Class-based selector */
      html body ${
        isPreview
          ? `.PreviewContainer-${id} .promotion-text`
          : `.LandingPage-${id} .promotion-text`
      } {
        color: ${promotionTextColor || "#FF0000"} !important;
      }
      
      /* Backup selector for text-red-500 - MODIFIED to be more specific to promotion element only */
      html body ${
        isPreview ? `.PreviewContainer-${id}` : `.LandingPage-${id}`
      } .promotion-element .text-red-500 {
        color: ${promotionTextColor || "#FF0000"} !important;
      }
      
      ${
        isPreview
          ? `.PreviewContainer-${id} .landing-page-button, .PreviewButton`
          : `.LandingPage-${id} .landing-page-button, .LandingPageButton`
      } {
        ${buttonTextColor ? `color: ${buttonTextColor} !important;` : ""}
        ${buttonBgColor ? `background-color: ${buttonBgColor} !important;` : ""}
        border-radius: ${borderRadius} !important;
        ${shadowCSS}
        ${
          buttonFontSizeValue
            ? `font-size: ${buttonFontSizeValue} !important;`
            : ""
        }
        ${
          buttonAnimation !== "none"
            ? `animation: ${buttonAnimation}-${id} 2s ease-in-out infinite; overflow: visible !important;`
            : ""
        }
      }

      /* Apply text color to icons when socialIconsType is type2 */
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .text-foreground {
        ${textColor ? `color: ${textColor} !important;` : ""}
      }

      /* Apply font family to all text in the container */
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} h1,
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} h2,
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} h3,
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} p,
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} span,
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} div {
        ${fontFamilyValue ? `font-family: ${fontFamilyValue} !important;` : ""}
      }

      /* Regular buttons (social media links) */
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} .PreviewButton,
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .LandingPageButton,
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .landing-page-button {
        ${buttonTextColor ? `color: ${buttonTextColor} !important;` : ""}
        ${buttonBgColor ? `background-color: ${buttonBgColor} !important;` : ""}
        border-radius: ${borderRadius} !important;
        ${shadowCSS}
        ${
          buttonFontSizeValue
            ? `font-size: ${buttonFontSizeValue} !important;`
            : ""
        }
        ${
          buttonAnimation !== "none"
            ? `animation: ${buttonAnimation}-${id} 2s ease-in-out infinite; overflow: visible !important;`
            : ""
        }
      }
      
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} .PreviewButton *,
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .LandingPageButton *,
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .landing-page-button * {
        ${buttonTextColor ? `color: ${buttonTextColor} !important;` : ""}
        font-size: ${buttonFontSizeValue} !important;
      }
      
      /* Other links buttons with animations and shadows */
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .OtherLinkButton {
        ${animationCSS}
        ${shadowCSS}
        transition: all 0.2s ease-in-out !important;
        font-size: ${buttonFontSizeValue} !important;
      }

      /* Hard shadow hover effect */
      ${
        buttonShadow === "hard"
          ? `.${
              isPreview ? "PreviewContainer" : "LandingPage"
            }-${id} .OtherLinkButton:hover {
        transform: translate(2px, 2px) !important;
        box-shadow: 3px 3px 0px ${shadowColor} !important;
      }`
          : ""
      }
      
      /* Override ProfileImages backgrounds */
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .ProfileImage div,
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} .CoverImage,
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .PreviewCoverImage,
      .${
        isPreview ? "PreviewContainer" : "LandingPage"
      }-${id} .PreviewProfileImage div {
        ${bgColor ? `background-color: ${bgColor} !important;` : ""}
      }
      
      /* For elements using var(--color-brand) */
      .${isPreview ? "PreviewContainer" : "LandingPage"}-${id} {
        ${bgColor ? `--color-brand: ${bgColor} !important;` : ""}
      }
    `;

    styleElement.innerHTML = css;

    // Cleanup function to remove the style element when component unmounts
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }

      // We don't remove the font links as they might be used by other landing pages
    };
  }, [
    id,
    textColor,
    bgColor,
    buttonTextColor,
    buttonBgColor,
    buttonRoundness,
    buttonAnimation,
    buttonShadow,
    shadowColor,
    fontFamily,
    textFontSize,
    buttonFontSize,
    socialIconsType,
    textShadow,
    textShadowColor,
    promotionTextColor,
    isPreview,
  ]);
}
