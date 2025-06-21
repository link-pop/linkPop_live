/**
 * Generate USPS tracking link for email notifications
 * @param {string} trackingNumber - The USPS tracking number
 * @param {string} linkText - The text to display for the link
 * @param {string} buttonText - The text for the button (optional)
 * @param {Object} options - Additional options
 * @returns {Object} - Object containing inline link and button HTML
 */
export const generateUSPSTrackingLink = (
  trackingNumber,
  linkText = null,
  buttonText = "Track on USPS",
  options = {}
) => {
  if (!trackingNumber) {
    return {
      inlineLink: "",
      buttonLink: "",
      trackingSection: "",
    };
  }

  const uspsUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  const displayText = linkText || trackingNumber;

  // Inline link for embedding in text
  const inlineLink = `<a href="${uspsUrl}" style="color: #2563eb; text-decoration: none;" target="_blank">${displayText}</a>`;

  // Button link for standalone tracking sections
  const buttonLink = `<a href="${uspsUrl}" 
     style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;" target="_blank">
    ${buttonText}
  </a>`;

  // Complete tracking section for emails
  const trackingSection = `
    <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #1e40af; margin-top: 0;">📍 Track Your Package:</h3>
      <p>${
        options.description || "You can track your package using USPS tracking:"
      }</p>
      ${buttonLink}
    </div>
  `;

  return {
    inlineLink,
    buttonLink,
    trackingSection,
    uspsUrl,
  };
};

/**
 * Generate tracking number display with USPS link for email
 * @param {string} trackingNumber - The USPS tracking number
 * @returns {string} - HTML string for tracking number with link
 */
export const generateTrackingNumberDisplay = (trackingNumber) => {
  if (!trackingNumber) return "";

  const { inlineLink } = generateUSPSTrackingLink(trackingNumber);
  return `<p><strong>Tracking Number:</strong> ${inlineLink}</p>`;
};

/**
 * Generate complete tracking section for different email types
 * @param {string} trackingNumber - The USPS tracking number
 * @param {string} emailType - Type of email (shipped, delivered, auction)
 * @returns {string} - HTML string for tracking section
 */
export const generateEmailTrackingSection = (
  trackingNumber,
  emailType = "shipped"
) => {
  if (!trackingNumber) return "";

  const configurations = {
    shipped: {
      description:
        "You can track your package using the tracking number above at:",
      buttonText: "Track on USPS",
    },
    delivered: {
      description:
        "You can view the complete delivery history using your tracking number:",
      buttonText: "View Delivery History on USPS",
    },
    auction: {
      description: "Track your auction item in real-time using USPS tracking:",
      buttonText: "Track on USPS",
    },
  };

  const config = configurations[emailType] || configurations.shipped;
  const { trackingSection } = generateUSPSTrackingLink(
    trackingNumber,
    null,
    config.buttonText,
    { description: config.description }
  );

  return trackingSection;
};
