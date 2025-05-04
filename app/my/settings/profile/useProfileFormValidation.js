import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { validateUrl, formatUrl } from "@/lib/utils/formatUrl";

export default function useProfileFormValidation() {
  const { t } = useTranslation();
  const { toastSet } = useContext();

  const validateMinLength = (value, minLength, fieldName) => {
    if (value.length < minLength) {
      return {
        isValid: false,
        error: t("minLengthError").replace("{count}", minLength),
      };
    }
    return { isValid: true, error: "" };
  };

  const validateForm = (profile) => {
    const errors = {};
    let isValid = true;

    // Remove @ from username for validation
    const cleanUsername = profile.username.replace("@", "");

    // Validate minLength for username
    const usernameValidation = validateMinLength(cleanUsername, 3, "username");
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error;
      isValid = false;
    }

    // Validate minLength for displayName
    const displayNameValidation = validateMinLength(
      profile.displayName,
      3,
      "displayName"
    );
    if (!displayNameValidation.isValid) {
      errors.displayName = displayNameValidation.error;
      isValid = false;
    }

    // Validate URLs before submission
    if (!validateUrl(profile.website) && profile.website !== "") {
      errors.website =
        t("invalidWebsiteURL") || "Please enter a valid website URL";
      isValid = false;
    }

    if (!validateUrl(profile.amazonWishlist) && profile.amazonWishlist !== "") {
      errors.amazonWishlist =
        t("invalidAmazonURL") || "Please enter a valid Amazon wishlist URL";
      isValid = false;
    }

    return { isValid, errors };
  };

  return {
    validateURL: validateUrl,
    validateMinLength,
    validateForm,
    formatUrl,
  };
}
