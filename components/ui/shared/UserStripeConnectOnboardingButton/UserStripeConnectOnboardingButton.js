"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
} from "lucide-react";
import { isStripeConnectReadyIncludingDevBypass } from "@/lib/utils/stripe/stripeConnectHelpers";

export default function UserStripeConnectOnboardingButton({
  mongoUser,
  onOnboardingComplete,
  className = "",
  variant = "default", // "default", "compact", "warning"
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);

  // Check Stripe Connect status on component mount
  useEffect(() => {
    if (mongoUser?.stripeConnect) {
      setAccountStatus(mongoUser.stripeConnect);
    }

    // Use the dev bypass logic to determine if onboarding is complete
    const isReady = isStripeConnectReadyIncludingDevBypass(mongoUser);
    onOnboardingComplete?.(isReady);
  }, [mongoUser, onOnboardingComplete]);

  const isOnboardingComplete = () => {
    return isStripeConnectReadyIncludingDevBypass(mongoUser);
  };

  const hasAccount = () => {
    return accountStatus?.accountId;
  };

  const handleStartOnboarding = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const endpoint = hasAccount()
        ? "/api/stripe/connect/continue-onboarding"
        : "/api/stripe/connect/create-account";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to start Stripe Connect onboarding"
        );
      }

      if (data.accountLinkUrl) {
        // Redirect to Stripe onboarding using Account Links
        window.location.href = data.accountLinkUrl;
      } else {
        throw new Error("No onboarding URL received");
      }
    } catch (error) {
      console.error("Error starting Stripe Connect onboarding:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to start Stripe Connect onboarding",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isOnboardingComplete()) {
      const icon = mongoUser?.isDev ? (
        <Shield size={16} />
      ) : (
        <CheckCircle size={16} />
      );
      const text = mongoUser?.isDev
        ? t("devModeActive")
        : t("stripeConnectCompleted");
      return {
        icon,
        text,
        className: "bg-green-600 hover:bg-green-700 text-white",
        disabled: true,
      };
    }

    if (hasAccount()) {
      return {
        icon: <ExternalLink size={16} />,
        text: t("completeStripeOnboarding"),
        className: "bg-yellow-600 hover:bg-yellow-700 text-white",
        disabled: false,
      };
    }

    return {
      icon: <CreditCard size={16} />,
      text: t("setupStripeConnect"),
      className: "bg-accent hover:bg-accent/80 text-accent-foreground",
      disabled: false,
    };
  };

  const buttonContent = getButtonContent();

  if (variant === "compact") {
    return (
      <button
        onClick={handleStartOnboarding}
        disabled={isLoading || buttonContent.disabled}
        className={`f aic g8 px15 py8 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${buttonContent.className} ${className}`}
      >
        {buttonContent.icon}
        <span className="text-sm">
          {isLoading ? t("loading") : buttonContent.text}
        </span>
      </button>
    );
  }

  if (variant === "warning") {
    return (
      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p15">
        <div className="f aic g10 mb10">
          <AlertTriangle className="w20 h20 text-yellow-600" />
          <h4 className="font-medium text-yellow-800">
            {t("stripeConnectRequired")}
          </h4>
        </div>
        <p className="text-sm text-yellow-700 mb15">
          {t("stripeConnectRequiredMessage")}
        </p>
        <button
          onClick={handleStartOnboarding}
          disabled={isLoading || buttonContent.disabled}
          className={`f aic g8 px15 py8 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${buttonContent.className} ${className}`}
        >
          {buttonContent.icon}
          <span>{isLoading ? t("loading") : buttonContent.text}</span>
        </button>
      </div>
    );
  }

  // Default variant
  return (
    <div className="border rounded-lg p20 bg-background">
      <div className="f aic g15 mb15">
        {isOnboardingComplete() ? (
          <CheckCircle className="w24 h24 text-green-600" />
        ) : hasAccount() ? (
          <AlertTriangle className="w24 h24 text-yellow-600" />
        ) : (
          <CreditCard className="w24 h24 text-muted-foreground" />
        )}
        <div>
          <h3 className="font-semibold text-lg">{t("stripeConnectAccount")}</h3>
          <p className="text-sm text-muted-foreground">
            {isOnboardingComplete()
              ? t("stripeConnectActiveMessage")
              : hasAccount()
              ? t("stripeConnectPendingMessage")
              : t("stripeConnectSetupMessage")}
          </p>
        </div>
      </div>

      <button
        onClick={handleStartOnboarding}
        disabled={isLoading || buttonContent.disabled}
        className={`f aic g8 px20 py10 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${buttonContent.className} ${className}`}
      >
        {buttonContent.icon}
        <span>{isLoading ? t("loading") : buttonContent.text}</span>
      </button>

      {!isOnboardingComplete() && (
        <div className="mt15 p15 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            {t("stripeConnectOnboardingInfo")}
          </p>
        </div>
      )}
    </div>
  );
}
