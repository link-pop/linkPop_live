"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
} from "lucide-react";
import { update } from "@/lib/actions/crud";
import {
  isStripeConnectReadyIncludingDevBypass,
  getStripeConnectStatus,
} from "@/lib/utils/stripe/stripeConnectHelpers";

export default function StripeConnectSettings({ mongoUser, onStatusChange }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);

  // Check Stripe Connect status on component mount
  useEffect(() => {
    if (mongoUser?.stripeConnect) {
      setAccountStatus(mongoUser.stripeConnect);
    }
  }, [mongoUser]);

  const handleCreateAccount = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create Stripe Connect account"
        );
      }

      if (data.accountLinkUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.accountLinkUrl;
      } else {
        throw new Error("No onboarding URL received");
      }
    } catch (error) {
      console.error("Error creating Stripe Connect account:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to create Stripe Connect account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/connect/account-status", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh account status");
      }

      setAccountStatus(data.account);
      onStatusChange?.(data.account);

      toastSet({
        isOpen: true,
        title: t("accountStatusUpdated"),
      });
    } catch (error) {
      console.error("Error refreshing account status:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to refresh account status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/connect/continue-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to continue onboarding");
      }

      if (data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl;
      } else {
        throw new Error("No onboarding URL received");
      }
    } catch (error) {
      console.error("Error continuing onboarding:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to continue onboarding",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    // If user is a dev, show shield icon
    if (mongoUser?.isDev) {
      return <Shield className="w20 h20 text-green-600" />;
    }

    if (!accountStatus?.accountId) {
      return <CreditCard className="w20 h20 text-muted-foreground" />;
    }

    if (accountStatus.onboardingCompleted && accountStatus.chargesEnabled) {
      return <CheckCircle className="w20 h20 text-green-600" />;
    }

    return <AlertCircle className="w20 h20 text-yellow-600" />;
  };

  const getStatusText = () => {
    const status = getStripeConnectStatus(mongoUser);

    switch (status.status) {
      case "dev_bypass":
        return t("devModeActive");
      case "active":
        return t("stripeConnectActive");
      case "not_setup":
        return t("stripeConnectNotSetup");
      case "pending_onboarding":
        return t("stripeConnectPendingOnboarding");
      case "pending_approval":
        return t("stripeConnectPendingApproval");
      default:
        return t("stripeConnectSetupIncomplete");
    }
  };

  const getStatusColor = () => {
    // If user is a dev, always show green
    if (mongoUser?.isDev) {
      return "text-green-600";
    }

    if (!accountStatus?.accountId) {
      return "text-muted-foreground";
    }

    if (accountStatus.onboardingCompleted && accountStatus.chargesEnabled) {
      return "text-green-600";
    }

    return "text-yellow-600";
  };

  const canReceivePayments = () => {
    return isStripeConnectReadyIncludingDevBypass(mongoUser);
  };

  return (
    <div className="border rounded-lg p20 bg-background">
      <div className="f aic g15 mb15">
        {getStatusIcon()}
        <div>
          <h3 className="font-semibold text-lg">{t("stripeConnectAccount")}</h3>
          <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
        </div>
      </div>

      {/* Account Details */}
      {accountStatus?.accountId && (
        <div className="mb15 p15 bg-muted/30 rounded-lg">
          <div className="fc g8 text-sm">
            <div className="f jcsb">
              <span className="text-muted-foreground">{t("accountId")}:</span>
              <span className="font-mono text-xs">
                {accountStatus.accountId.substring(0, 20)}...
              </span>
            </div>
            <div className="f jcsb">
              <span className="text-muted-foreground">{t("country")}:</span>
              <span>{accountStatus.country || "Not set"}</span>
            </div>
            <div className="f jcsb">
              <span className="text-muted-foreground">{t("currency")}:</span>
              <span>{accountStatus.currency?.toUpperCase() || "USD"}</span>
            </div>
            <div className="f jcsb">
              <span className="text-muted-foreground">
                {t("paymentsEnabled")}:
              </span>
              <span
                className={
                  accountStatus.chargesEnabled
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {accountStatus.chargesEnabled ? t("yes") : t("no")}
              </span>
            </div>
            <div className="f jcsb">
              <span className="text-muted-foreground">
                {t("payoutsEnabled")}:
              </span>
              <span
                className={
                  accountStatus.payoutsEnabled
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {accountStatus.payoutsEnabled ? t("yes") : t("no")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Requirements */}
      {accountStatus?.requirements?.currentlyDue?.length > 0 && (
        <div className="mb15 p15 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb8">
            {t("actionRequired")}
          </h4>
          <p className="text-sm text-yellow-700 mb10">
            {t("stripeConnectRequirementsMessage")}
          </p>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            {accountStatus.requirements.currentlyDue.map(
              (requirement, index) => (
                <li key={index}>{requirement.replace(/_/g, " ")}</li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Action Buttons - Hidden for dev users */}
      {!mongoUser?.isDev && (
        <div className="f g10">
          {!accountStatus?.accountId ? (
            <button
              onClick={handleCreateAccount}
              disabled={isLoading}
              className="px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed f aic g8"
            >
              <CreditCard size={16} />
              {isLoading ? t("creating") : t("setupStripeConnect")}
            </button>
          ) : (
            <>
              {!accountStatus.onboardingCompleted && (
                <button
                  onClick={handleContinueOnboarding}
                  disabled={isLoading}
                  className="px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed f aic g8"
                >
                  <ExternalLink size={16} />
                  {isLoading ? t("loading") : t("continueOnboarding")}
                </button>
              )}
              <button
                onClick={handleRefreshStatus}
                disabled={isLoading}
                className="px15 py10 border border-border hover:bg-muted rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("refreshing") : t("refreshStatus")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Info Message */}
      <div className="mt15 p15 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          {mongoUser?.isDev
            ? t("devModeStripeConnectMessage")
            : t("stripeConnectInfoMessage")}
        </p>
      </div>
    </div>
  );
}
