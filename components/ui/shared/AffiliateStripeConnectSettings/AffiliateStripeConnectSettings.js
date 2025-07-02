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
  DollarSign,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  isStripeConnectReadyIncludingDevBypass,
  getStripeConnectStatus,
} from "@/lib/utils/stripe/stripeConnectHelpers";
import {
  isEligibleForAffiliatePayout,
  calculatePendingPayout,
} from "@/lib/utils/affiliate/affiliatePayoutHelpers";

export default function AffiliateStripeConnectSettings({
  mongoUser,
  earnings = [],
  onStatusChange,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [payoutInfo, setPayoutInfo] = useState(null);

  // Check Stripe Connect status and calculate payout info on component mount
  useEffect(() => {
    if (mongoUser?.stripeConnect) {
      setAccountStatus(mongoUser.stripeConnect);
    }

    // Calculate payout information
    const pendingPayout = calculatePendingPayout(earnings);
    setPayoutInfo(pendingPayout);
  }, [mongoUser, earnings]);

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
      console.error("❌ Error creating Stripe Connect account:", error);
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
      console.error("❌ Error refreshing account status:", error);
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
      console.error("❌ Error continuing onboarding:", error);
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

  const canReceivePayouts = () => {
    return isStripeConnectReadyIncludingDevBypass(mongoUser);
  };

  const eligibility = isEligibleForAffiliatePayout(mongoUser);

  return (
    <Card className="border rounded-lg bg-background">
      <CardContent className="mt30 space-y-6">
        {/* Payout Eligibility Status */}
        <div className="flex items-center justify-between p15 bg-accent/20 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="w20 h20 text-primary" />
            <div>
              <div className="font-medium">{t("payoutEligibility")}</div>
              <div className="text-sm text-muted-foreground">
                {eligibility.eligible
                  ? t("eligibleForPayouts")
                  : t(eligibility.reason)}
              </div>
            </div>
          </div>
          <Badge
            className={eligibility.eligible ? "bg-green-500" : "bg-red-500"}
            variant={eligibility.eligible ? "default" : "secondary"}
          >
            {eligibility.eligible ? t("eligible") : t("notEligible")}
          </Badge>
        </div>

        {/* Pending Payout Information */}
        {payoutInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("pendingEarnings")}
              </span>
              <span className="text-lg font-bold text-primary">
                ${payoutInfo.totalPending.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("payoutMethod")}
              </span>
              <span className="text-sm">{t("automatic")}</span>
            </div>

            {payoutInfo.totalPending > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("earningsCount")}
                </span>
                <span className="text-sm">{payoutInfo.earningsCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Stripe Connect Setup Actions */}
        <div className="space-y-3">
          {!accountStatus?.accountId ? (
            // No account created yet
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("stripeConnectAffiliateInfo")}
              </p>
              <Button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? t("loading") : t("setupStripeConnect")}
              </Button>
            </div>
          ) : !accountStatus.onboardingCompleted ? (
            // Account created but onboarding not complete
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("completeOnboardingToReceivePayouts")}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleContinueOnboarding}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? t("loading") : t("completeStripeOnboarding")}
                </Button>
                <Button
                  onClick={handleRefreshStatus}
                  disabled={isLoading}
                  variant="outline"
                >
                  {t("refresh")}
                </Button>
              </div>
            </div>
          ) : !accountStatus.chargesEnabled ? (
            // Onboarding complete but charges not enabled
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("stripeReviewInProgress")}
              </p>
              <Button
                onClick={handleRefreshStatus}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? t("loading") : t("refreshStatus")}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Dev Mode Notice */}
        {mongoUser?.isDev && (
          <div className="flex items-center gap-2 p10 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w16 h16 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {t("devModeStripeConnectMessage")}
            </span>
          </div>
        )}

        {/* Payout Schedule Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{t("affiliatePayoutScheduleInfo")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
