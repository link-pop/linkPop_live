"use client";

import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useRouter } from "next/navigation";

// ! code start ClickForSupport
export default function ClickForSupport({
  title,
  hrefs = ["link.pop.com@gmail.com", "whatsapp.com/send?phone=380950168170"],
  labels = [],
  className = "",
  buttonText,
  mini = false,
  textOnly = false,
  supportSectionTitle,
  supportSectionText,
  ...props
}) {
  const { dialogSet } = useContext();
  const { t } = useTranslation();
  const router = useRouter();

  // Set translated defaults after getting translation function
  title = title || t("support");
  buttonText = buttonText || t("getSupport");
  supportSectionTitle = supportSectionTitle || t("needHelp");
  supportSectionText = supportSectionText || t("supportTeamHere");

  // Helper function to determine if a string is a valid email
  const isValidEmail = (email) => {
    return email && email.includes("@") && email.includes(".");
  };

  // Format hrefs properly with mailto: or https:// if needed
  const formatHref = (href) => {
    if (isValidEmail(href) && !href.startsWith("mailto:")) {
      // Return null for emails - we'll handle them differently
      return null;
    }

    if (href.includes("whatsapp")) {
      // Properly format whatsapp links to use correct API URL
      if (href.includes("send?phone=")) {
        // Extract phone number from existing URL
        const phoneMatch = href.match(/phone=(\d+)/);
        if (phoneMatch && phoneMatch[1]) {
          return `https://api.whatsapp.com/send?phone=${phoneMatch[1]}`;
        }
      }

      // For any other whatsapp URL
      if (!href.startsWith("https://")) {
        return `https://${href}`;
      }
    }

    if (
      href.includes("telegram") &&
      !href.startsWith("https://") &&
      !href.startsWith("t.me")
    ) {
      return `https://${href}`;
    }

    if (
      !href.startsWith("http") &&
      !href.startsWith("mailto:") &&
      !href.startsWith("tel:")
    ) {
      return `https://${href}`;
    }

    return href;
  };

  // Handle click on email links - redirect to contact form
  const handleEmailClick = (email) => {
    // Close the dialog first
    dialogSet({ isOpen: false });

    // Import the ADD_CONTACT_ROUTE from constants
    const { ADD_CONTACT_ROUTE } = require("@/lib/utils/constants");
    // Navigate to the contact form
    router.push(ADD_CONTACT_ROUTE);
  };

  // Handle click on the support button
  const handleSupportClick = () => {
    // If only one href is provided, handle it directly
    if (hrefs.length === 1) {
      const href = hrefs[0];
      if (isValidEmail(href)) {
        handleEmailClick(href);
      } else {
        window.open(formatHref(href), "_blank");
        dialogSet({ isOpen: false });
      }
      return;
    }

    // If multiple hrefs are provided, show dialog with options
    dialogSet({
      isOpen: true,
      title: title,
      text: t("selectSupportOption"),
      hasCloseIcon: true,
      comp: (
        <div className="flex flex-col space-y-3 py-4 px-2">
          {hrefs.map((href, index) => {
            const formattedHref = formatHref(href);
            const label = labels[index] || getDefaultLabel(href);
            const isEmail = isValidEmail(href);

            return (
              <a
                key={index}
                href={formattedHref}
                onClick={(e) => {
                  if (isEmail) {
                    e.preventDefault();
                    handleEmailClick(href);
                  } else {
                    // Close dialog when clicking any external link
                    dialogSet({ isOpen: false });
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 cp p-3 rounded-md bg-accent hover:bg-accent/80 transition-colors"
              >
                {getIconForHref(isEmail ? `mailto:${href}` : formattedHref)}
                <span className="font-medium">{label}</span>
              </a>
            );
          })}
        </div>
      ),
      showBtns: false,
    });
  };

  // Get appropriate icon based on href type
  const getIconForHref = (href) => {
    if (href && href.startsWith("mailto:")) {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (href && href.includes("whatsapp")) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    }

    if (href && (href.includes("telegram") || href.includes("t.me"))) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    }

    // Default icon for any other link
    return (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  // Get default label based on href type
  const getDefaultLabel = (href) => {
    if (isValidEmail(href)) {
      return `${t("email")}: ${href}`;
    }

    if (href.includes("whatsapp")) {
      return t("whatsapp");
    }

    if (href.includes("telegram") || href.includes("t.me")) {
      return t("telegram");
    }

    return href.replace(/https?:\/\//, "");
  };

  // Text-only version for the footer or other minimal contexts
  if (textOnly) {
    // If only one href is provided, return a simple link
    if (hrefs.length === 1) {
      const href = hrefs[0];
      if (isValidEmail(href)) {
        return (
          <span
            onClick={() => handleEmailClick(href)}
            className={`cursor-pointer text-foreground hover:underline ${className}`}
            {...props}
          >
            {buttonText}
          </span>
        );
      }
      return (
        <a
          href={formatHref(href)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => dialogSet({ isOpen: false })}
          className={`text-foreground hover:underline ${className}`}
          {...props}
        >
          {buttonText}
        </a>
      );
    }

    // If multiple hrefs, create a link that opens the dialog
    return (
      <span
        onClick={handleSupportClick}
        className={`cursor-pointer text-foreground hover:underline ${className}`}
        {...props}
      >
        {buttonText}
      </span>
    );
  }

  const SupportButton = () => (
    <button
      onClick={handleSupportClick}
      className={`py-2 px-4 bg-purple-100 brand hover:bg-purple-200 rounded-md ${className}`}
      {...props}
    >
      {buttonText}
    </button>
  );

  // If mini mode, just return the button
  if (mini) {
    return <SupportButton />;
  }

  // Otherwise, return the full support section
  return (
    <div
      className={`mt-12 p-6 backdrop-blur-sm bg-accent/70 dark:bg-accent/40 rounded-xl shadow-md text-center border border-accent/30`}
    >
      <h2 className={`text-xl font-semibold mb-4`}>{supportSectionTitle}</h2>
      <p className={`text-gray-500 mb-6`}>{supportSectionText}</p>
      <div className={`flex justify-center`}>
        <SupportButton />
      </div>
    </div>
  );
}
// ? code end ClickForSupport
