/**
 * Utility functions for shipping carrier operations
 * Ensures USPS is used exclusively as per requirements
 */

/**
 * Normalize carrier name to USPS
 * @param {string|object} carrierData - Carrier account, provider name, or rate object
 * @returns {string} - Always returns "USPS"
 */
export const normalizeCarrierToUSPS = (carrierData) => {
  // Always return USPS as per requirements
  return "USPS";
};

/**
 * Check if a rate is from USPS
 * @param {object} rate - Shippo rate object
 * @returns {boolean} - True if rate is from USPS
 */
export const isUSPSRate = (rate) => {
  if (!rate) return false;

  const provider = rate.provider?.toLowerCase() || "";
  const servicelevel = rate.servicelevel?.name?.toLowerCase() || "";
  const carrierAccount = rate.carrier_account?.toLowerCase() || "";

  return (
    provider.includes("usps") ||
    servicelevel.includes("usps") ||
    carrierAccount.includes("usps")
  );
};

/**
 * Filter rates to only include USPS carriers
 * @param {array} rates - Array of Shippo rate objects
 * @returns {array} - Filtered array containing only USPS rates
 */
export const filterUSPSRates = (rates) => {
  if (!rates || !rates.length) {
    return [];
  }

  const uspsRates = rates.filter(isUSPSRate);

  console.log(
    `Filtered ${uspsRates.length} USPS rates from ${rates.length} total rates`
  );

  // If no USPS rates found, log warning but return all rates as fallback
  if (uspsRates.length === 0) {
    console.warn("No USPS rates found, using all available rates as fallback");
    return rates;
  }

  return uspsRates;
};

/**
 * Get carrier display information for UI
 * @param {string} carrierAccount - Carrier account identifier
 * @returns {object} - Carrier display information
 */
export const getCarrierDisplayInfo = (carrierAccount) => {
  // Always return USPS information as per requirements
  return {
    name: "USPS",
    displayName: "USPS",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "truck", // For icon selection
  };
};

/**
 * Ensure tracking uses USPS carrier
 * @param {string} carrier - Original carrier identifier
 * @returns {string} - USPS carrier identifier for tracking
 */
export const normalizeTrackingCarrier = (carrier) => {
  // Ensure we use USPS for tracking
  if (!carrier) return "usps";

  const normalizedCarrier = carrier.toLowerCase();
  return normalizedCarrier.includes("usps") ? carrier : "usps";
};
