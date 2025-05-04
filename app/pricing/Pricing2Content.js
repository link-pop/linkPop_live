"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import StripeButton from "@/components/Stripe/StripeButton";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { getPlanPrices } from "@/lib/utils/pricing/getPlanPrices";
import Select from "@/components/ui/shared/Select/Select";
import {
  Link2,
  Globe,
  Shield,
  Map,
  BarChart2,
  MousePointer,
  Zap,
  Users,
  Lock,
  Layout,
  Activity,
  Monitor,
  MessageCircle,
  ArrowUp,
} from "lucide-react";
import { cancelSubscription2Immediately } from "@/lib/actions/cancelSubscription2Immediately";
import { cancelSubscription2AtPeriodEnd } from "@/lib/actions/cancelSubscription2AtPeriodEnd";
import ClickForSupport from "@/components/ui/shared/ClickForSupport/ClickForSupport";
import AdminTestControls from "@/components/ui/shared/AdminTestControls/AdminTestControls";

export default function Pricing2Content({ userSubscription, isAdmin = false }) {
  const { t } = useTranslation();
  const { toastSet, dialogSet } = useContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize linksCount from existing subscription if available
  const initialLinksCount =
    userSubscription &&
    userSubscription.planId === "price_agency_monthly" &&
    userSubscription.extraLinks
      ? userSubscription.extraLinks
      : 0;

  const [linksCount, setLinksCount] = useState(initialLinksCount);

  // Use the pricing utility to get plan prices with extra links
  const planPrices = getPlanPrices(linksCount);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const prorated = searchParams.get("prorated");
    const proratedDays = searchParams.get("prorated_days");
    const previousPlan = searchParams.get("previous_plan");
    const newPlan = searchParams.get("new_plan");
    const extraLinksChange = searchParams.get("extra_links_change");
    const previousLinks = searchParams.get("previous_links");
    const newLinks = searchParams.get("new_links");
    const oldPrice = searchParams.get("old_price");
    const newPrice = searchParams.get("new_price");
    const daysUsed = searchParams.get("days_used");
    const remainingDays = searchParams.get("remaining_days");
    const sessionId = searchParams.get("session_id");

    // Function to clean up URL parameters after showing message
    const cleanupUrlParams = () => {
      // Use the router to replace the current URL with a clean one
      router.replace("/pricing", { scroll: false });
    };

    if (success) {
      if (sessionId) {
        // This is the new webhook-based approach
        // Show a simple success message - details will be updated when the page refreshes
        toastSet({
          title: t("subscriptionSuccess"),
          text: t("subscriptionProcessing"),
          variant: "default",
        });

        // After a short delay, refresh the page to show updated subscription details
        // This gives the webhook time to process the subscription
        const refreshTimer = setTimeout(() => {
          router.refresh();
          // Clean up URL after refresh
          cleanupUrlParams();
        }, 3000);

        return () => clearTimeout(refreshTimer);
      } else if (extraLinksChange === "true" && previousLinks && newLinks) {
        // Legacy code for extra links change success
        let detailedMessage = "";
        if (oldPrice && newPrice && daysUsed && remainingDays) {
          // Format prices for better readability
          const oldPriceNum = parseFloat(oldPrice);
          const newPriceNum = parseFloat(newPrice);
          const daysUsedNum = parseInt(daysUsed);
          const remainingDaysNum = parseInt(remainingDays);

          // Calculate the unused value
          const unusedValue = oldPriceNum * (remainingDaysNum / 30);

          // detailedMessage = t("subscriptionPeriodInfo", {
          //   usedDays: daysUsedNum,
          //   remainingDays: remainingDaysNum,
          //   unusedValue: unusedValue.toFixed(2),
          //   oldPlanPrice: oldPriceNum.toFixed(2),
          //   convertedDays: proratedDays,
          //   newPlanPrice: newPriceNum.toFixed(2),
          // });
        }

        toastSet({
          title: t("extraLinksUpdated"),
          text: `${t("extraLinksChangeSuccess", {
            previous: previousLinks,
            new: newLinks,
            days: proratedDays || 0,
          })} ${detailedMessage}`,
          variant: "default",
        });

        cleanupUrlParams();
      } else if (prorated === "true" && proratedDays) {
        const upgradeOrDowngrade =
          previousPlan &&
          newPlan &&
          previousPlan.includes("creator") &&
          newPlan.includes("agency")
            ? "upgrade"
            : "downgrade";

        const previousPlanName = previousPlan
          ? previousPlan.includes("creator")
            ? "Creator"
            : "Agency"
          : "previous";
        const newPlanName = newPlan
          ? newPlan.includes("creator")
            ? "Creator"
            : "Agency"
          : "new";

        // Create a more detailed explanation of the calculation if we have all the data
        let detailedMessage = "";
        if (oldPrice && newPrice && daysUsed && remainingDays) {
          // Format prices for better readability
          const oldPriceNum = parseFloat(oldPrice);
          const newPriceNum = parseFloat(newPrice);
          const daysUsedNum = parseInt(daysUsed);
          const remainingDaysNum = parseInt(remainingDays);

          // Calculate the unused value
          const unusedValue = oldPriceNum * (remainingDaysNum / 30);

          // detailedMessage = t("subscriptionPeriodInfo", {
          //   usedDays: daysUsedNum,
          //   remainingDays: remainingDaysNum,
          //   unusedValue: unusedValue.toFixed(2),
          //   oldPlanPrice: oldPriceNum.toFixed(2),
          //   convertedDays: proratedDays,
          //   newPlanPrice: newPriceNum.toFixed(2),
          // });
        }

        toastSet({
          title: t("subscriptionSuccess"),
          text: `${t("upgradedFromToWithCredit", {
            fromPlan: previousPlanName,
            toPlan: newPlanName,
            days: proratedDays,
          })} ${detailedMessage}`,
          variant: "default",
        });

        cleanupUrlParams();
      } else {
        toastSet({
          title: t("subscriptionSuccess"),
          text: t("subscriptionActivated"),
          variant: "default",
        });

        cleanupUrlParams();
      }
    }

    if (error) {
      toastSet({
        title: t("subscriptionError"),
        text: t(error) || t("unknownSubscriptionError"),
        variant: "destructive",
      });

      cleanupUrlParams();
    }
  }, [searchParams, toastSet, t, router]);

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!userSubscription) return;

    const isTrial = userSubscription.status === "trialing";
    const confirmMessage = isTrial
      ? t("cancelTrialDesc")
      : t("cancelSubscriptionDesc");

    dialogSet({
      isOpen: true,
      title: isTrial ? t("cancelTrial") : t("cancelSubscription"),
      text: confirmMessage,
      showCancelBtn: true,
      cancelBtnText: t("cancel"),
      confirmBtnText: t("confirm"),
      confirmBtnVariant: "destructive",
      action: async () => {
        setIsLoading(true);

        try {
          // Get the subscription ID
          const subscriptionId = userSubscription._id
            ? userSubscription._id.toString()
            : userSubscription.id
            ? userSubscription.id.toString()
            : null;

          if (!subscriptionId) {
            throw new Error("Could not determine subscription ID");
          }

          console.log("Attempting to cancel subscription:", subscriptionId);

          // Use different cancellation methods based on subscription type
          // For trials, cancel immediately. For active subscriptions, cancel at period end.
          const result = isTrial
            ? await cancelSubscription2Immediately(subscriptionId)
            : await cancelSubscription2AtPeriodEnd(subscriptionId, {
                cancelReason: "user_cancel",
              });

          console.log("Cancellation result:", result);

          if (result && result.success) {
            toastSet({
              title: isTrial ? "Trial Canceled" : "Subscription Canceled",
              text: isTrial
                ? "Your trial has been canceled immediately."
                : "Your subscription has been canceled and will remain active until the end of your billing period.",
              variant: "default",
            });

            // Force refresh the page to update subscription status display
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            const errorMessage =
              result && result.error
                ? result.error
                : "Failed to cancel subscription. Please try again or contact support.";

            console.error("Cancellation failed:", errorMessage);

            toastSet({
              title: "Error",
              text: errorMessage,
              variant: "destructive",
            });
          }
        } catch (error) {
          const errorMessage =
            error.message ||
            "An unexpected error occurred during cancellation. Please try again.";
          console.error("Error canceling subscription:", error);

          toastSet({
            title: "Error",
            text: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Handle plan change (upgrade or downgrade)
  const handlePlanChange = (plan) => {
    if (!userSubscription || !plan) return;

    // Debug log to see the structure of userSubscription
    console.log("UserSubscription object:", userSubscription);

    // Determine if this is an upgrade or downgrade
    const currentPlanIndex = plans.findIndex(
      (p) => p.planId === userSubscription.planId
    );
    const newPlanIndex = plans.findIndex((p) => p.planId === plan.planId);

    // If we're changing from a non-existent plan (just trial history), treat as new subscription
    const isNewSubscription =
      !userSubscription.planId ||
      (!userSubscription._id &&
        !userSubscription.id &&
        !userSubscription.subscriptionId);

    const isDowngrade = !isNewSubscription && newPlanIndex < currentPlanIndex;
    const actionType = isNewSubscription
      ? "subscribe"
      : isDowngrade
      ? "downgrade"
      : "upgrade";

    // Customize dialog message based on whether this is a new subscription or an upgrade/downgrade
    let dialogText = "";
    if (isNewSubscription) {
      dialogText = t("subscribeToPlan");
    } else {
      dialogText = isDowngrade
        ? t("downgradePlanDescription")
        : t("upgradePlanDescription");
    }

    // If this includes extra links, add that to the dialog text
    if (plan.extraLinks > 0) {
      dialogText += ` This includes ${plan.extraLinks} extra links for a total of ${plan.totalLinks} links.`;
      // Add note that extra links don't get trial periods
      if (isNewSubscription) {
        dialogText += " " + t("noTrialWithExtraLinks");
      }
    }

    dialogSet({
      isOpen: true,
      title: isNewSubscription
        ? t("subscribeToPlan")
        : isDowngrade
        ? t("downgradePlan")
        : t("upgradePlan"),
      text: dialogText,
      showCancelBtn: true,
      cancelBtnText: t("cancel"),
      confirmBtnText: t("confirm"),
      confirmBtnVariant: isDowngrade ? "destructive" : "default",
      action: async () => {
        // For upgrades and downgrades, we'll cancel the current subscription and redirect to Stripe for the new one
        setIsLoading(true);

        try {
          // If this is a new subscription (no existing active plan), skip cancellation and go straight to checkout
          if (isNewSubscription) {
            // Find and click the Stripe button for this plan
            const stripeButton = document.querySelector(
              `button[data-plan-id="${plan.planId}"]`
            );
            if (stripeButton) {
              stripeButton.click();
            } else {
              throw new Error(
                "Could not find the button to process your request"
              );
            }
            return;
          }

          // For actual plan changes, get the subscription ID
          let subscriptionId = null;

          if (userSubscription._id) {
            subscriptionId =
              typeof userSubscription._id === "string"
                ? userSubscription._id
                : userSubscription._id.toString();
          } else if (userSubscription.id) {
            subscriptionId =
              typeof userSubscription.id === "string"
                ? userSubscription.id
                : userSubscription.id.toString();
          } else if (userSubscription.subscriptionId) {
            subscriptionId = userSubscription.subscriptionId;
          }

          if (!subscriptionId) {
            throw new Error("Could not determine subscription ID");
          }

          // Create a checkout session with metadata to handle cancellation on success
          const endpoint = "/api/stripe/pricing2";
          const requestData = {
            planId: plan.planId,
            trialDays: 0, // Trial days will be calculated server-side based on remaining value
            metadata: {
              pendingCancellation: "true",
              oldSubscriptionId: subscriptionId,
              cancelReason: isDowngrade ? "plan_downgrade" : "plan_upgrade",
              ...(plan.extraLinks > 0
                ? { extraLinks: plan.extraLinks.toString() }
                : {}),
            },
          };

          console.log(
            "Sending request to create checkout session for plan change:",
            requestData
          );

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });

          const data = await response.json();

          if (data?.sessionUrl) {
            console.log("Redirecting to Stripe checkout:", data.sessionUrl);
            window.location.href = data.sessionUrl;
          } else {
            throw new Error(
              data?.error || "No session URL returned from payment service"
            );
          }
        } catch (error) {
          const errorMessage =
            error.message ||
            `An unexpected error occurred during ${actionType}. Please try again.`;
          console.error(`Error during ${actionType}:`, error);

          toastSet({
            title: "Error",
            text: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Handle extra links change for Agency plan
  const handleExtraLinksChange = async (newLinksCount) => {
    if (!userSubscription || userSubscription.planId !== "price_agency_monthly")
      return;

    // Check if links count actually changed
    if (userSubscription.extraLinks === newLinksCount) {
      toastSet({
        title: t("noChange"),
        text: t("extraLinksAlreadySet"),
        variant: "default",
      });
      return;
    }

    dialogSet({
      isOpen: true,
      title: t("updateExtraLinks"),
      text: `${t("updateExtraLinksDescription")} ${t("fromCurrentToNew", {
        current: userSubscription.extraLinks || 0,
        new: newLinksCount,
      })} ${t("totalLinks")}: ${newLinksCount + 50}`,
      showCancelBtn: true,
      cancelBtnText: t("cancel"),
      confirmBtnText: t("confirm"),
      confirmBtnVariant: "default",
      action: async () => {
        setIsLoading(true);

        try {
          // Get the subscription ID
          const subscriptionId = userSubscription._id
            ? userSubscription._id.toString()
            : userSubscription.id
            ? userSubscription.id.toString()
            : null;

          if (!subscriptionId) {
            throw new Error("Could not determine subscription ID");
          }

          console.log(
            "Attempting to update extra links for subscription:",
            subscriptionId
          );

          // Instead of cancelling immediately, we'll create a checkout session
          // and let the success route handle the cancellation
          try {
            const endpoint = "/api/stripe/pricing2";
            const requestData = {
              planId: "price_agency_monthly",
              trialDays: 0, // Trial days will be calculated server-side based on remaining value
              metadata: {
                extraLinks: newLinksCount.toString(),
                pendingCancellation: "true", // Flag to indicate this should cancel the old subscription on success
                oldSubscriptionId: subscriptionId, // Pass the old subscription ID to cancel
              },
            };

            console.log(
              "Sending request to create checkout session for extra links change:",
              requestData
            );

            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (data?.sessionUrl) {
              console.log("Redirecting to Stripe checkout:", data.sessionUrl);
              window.location.href = data.sessionUrl;
            } else {
              throw new Error(
                data?.error || "No session URL returned from payment service"
              );
            }
          } catch (error) {
            console.error("Error creating checkout session:", error);
            toastSet({
              title: t("paymentError"),
              text: error.message || t("unknownPaymentError"),
              variant: "destructive",
            });
          }
        } catch (error) {
          const errorMessage =
            error.message ||
            "An unexpected error occurred during extra links update. Please try again.";
          console.error("Error during extra links update:", error);

          toastSet({
            title: "Error",
            text: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Update the plans array to use the pricing utility
  const plans = [
    {
      name: t("starter"),
      price: planPrices.free.formatted,
      period: `/${t("mo")}`,
      text: t("starterPlanDesc"),
      features: [
        {
          name: t("deeplinkTechnology"),
          info: true,
          icon: <Link2 size={16} />,
        },
        {
          name: t("oneLandingPageOrDirectLink"),
          info: true,
          icon: <Globe size={16} />,
        },
        { name: t("unlimitedContent"), info: true, icon: <Layout size={16} /> },
        {
          name: t("beautifulDesigns"),
          info: true,
          icon: <Monitor size={16} />,
        },
      ],
      icon: "/icons/paper-plane.svg",
      color: "bg-purple-50",
      buttonText: t("freePlan"),
      buttonClass: "bg-gray-200 text-gray-700 hover:bg-gray-300",
      trialDays: null,
    },
    {
      name: t("creator"),
      price: planPrices.creator.formatted,
      period: `/${t("mo")}`,
      text: t("creatorPlanDesc"),
      features: [
        { name: t("everythingInStarter"), icon: <Zap size={16} /> },
        {
          name: "",
          value: t("fiveLandingPagesOrDirectLinks"),
          info: true,
          icon: <Link2 size={16} />,
        },
        {
          name: t("shieldProtection"),
          info: true,
          learnMore: true,
          icon: <Shield size={16} />,
        },
        {
          name: t("geoFilter"),
          info: true,
          learnMore: true,
          icon: <Map size={16} />,
        },
        { name: t("linkAnalytics"), info: true, icon: <BarChart2 size={16} /> },
        {
          name: t("clicksTracking"),
          info: true,
          icon: <MousePointer size={16} />,
        },
        {
          name: t("vipSupport"),
          info: true,
          icon: <MessageCircle size={16} />,
        },
      ],
      icon: "/icons/airplane.svg",
      color: "bg-purple-100",
      buttonText: t("becomeCreator"),
      buttonClass: "bg-purple-100 brand hover:bg-purple-200",
      trialDays: 14,
      planId: planPrices.creator.planId,
    },
    {
      name: t("agency"),
      price: planPrices.agency.formatted,
      period: `/${t("mo")}`,
      text: t("agencyPlanDesc"),
      features: [
        { name: t("everythingInCreator"), icon: <Zap size={16} /> },
        {
          name: "",
          value:
            linksCount > 0
              ? `${planPrices.agency.totalLinks} Landing Pages or Direct Links`
              : t("fiftyLandingPagesOrDirectLinks"),
          info: true,
          icon: <Link2 size={16} />,
        },
        {
          name: t("shieldsForAllLinks"),
          info: true,
          learnMore: true,
          icon: <Shield size={16} />,
        },
        {
          name: t("allInOneDashboard"),
          info: true,
          icon: <Layout size={16} />,
        },
        {
          name: t("customTracking"),
          info: true,
          icon: <BarChart2 size={16} />,
        },
        {
          name: t("whiteLabelExperience"),
          info: true,
          icon: <Users size={16} />,
        },
        {
          name: t("engagementBoost"),
          info: true,
          icon: <Activity size={16} />,
        },
      ],
      icon: "/icons/rocket.svg",
      color: "bg-purple-100",
      buttonText: t("becomeAgency"),
      buttonClass: "bg-purple-100 brand hover:bg-purple-200",
      trialDays: 14,
      planId: planPrices.agency.planId,
      extraLinks: linksCount,
      baseLinks: 50,
      totalLinks: 50 + linksCount,
    },
  ];

  const isCurrent = (planId) => {
    if (!userSubscription) return planId === null; // Free plan is current if no subscription
    return userSubscription.planId === planId;
  };

  const getPlanButtonProps = (plan, index) => {
    const isCurrentPlan = isCurrent(plan.planId);

    if (isCurrentPlan) {
      return {
        text: t("currentPlan"),
        className:
          "w-full py-2 px-4 rounded-md text-center bg-green-100 text-green-600",
        onClick: null,
        disabled: true,
        dataPlanId: null,
      };
    }

    if (!plan.planId) {
      // Free plan
      return {
        text: plan.buttonText,
        className: `w-full py-2 px-4 rounded-md text-center ${plan.buttonClass}`,
        onClick: null,
        disabled: false,
        dataPlanId: null,
      };
    }

    // Check if we're dealing with active subscription or just trial history
    const hasActiveSubscription =
      userSubscription &&
      userSubscription.hasActiveSubscription !== false &&
      !userSubscription.isTrialHistoryOnly;

    if (hasActiveSubscription) {
      // User has a real subscription - determine if this is upgrade or downgrade
      const currentPlanIndex = plans.findIndex(
        (p) => p.planId === userSubscription.planId
      );
      const targetPlanIndex = index;

      const isDowngrade = targetPlanIndex < currentPlanIndex;

      return {
        text: isDowngrade ? "Downgrade Plan" : "Upgrade Plan",
        className: `w-full py-2 px-4 rounded-md text-center ${
          isDowngrade
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : plan.buttonClass
        }`,
        onClick: () => handlePlanChange(plan),
        disabled: false,
        dataPlanId: plan.planId,
      };
    }

    // Either new user or user with only trial history
    // If they've used a trial before, don't offer another trial
    const trialText = userSubscription?.hasUsedTrial
      ? plan.buttonText
      : plan.trialDays > 0
      ? `Start ${plan.trialDays}-Day Free Trial`
      : plan.buttonText;

    // If user just has trial history but no active plan, show "Subscribe" button with direct Stripe access
    if (
      userSubscription &&
      userSubscription.hasUsedTrial &&
      userSubscription.isTrialHistoryOnly
    ) {
      // For users with just trial history, create a button that goes directly to Stripe
      return {
        text: `Subscribe to ${plan.name}`,
        className: `w-full py-2 px-4 rounded-md text-center ${plan.buttonClass}`,
        onClick: null, // Don't use the handlePlanChange that tries to cancel an existing subscription
        disabled: false,
        dataPlanId: plan.planId,
        useDirectStripe: true, // Flag to indicate this should use Stripe directly
      };
    }

    // Complete new user, no subscription history
    return {
      text:
        linksCount > 0 ? t("subscribeTo", { planName: plan.name }) : trialText,
      className: `w-full py-2.5 px-4 rounded-md text-center font-medium text-white bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] animate-gradient-x`,
      onClick: null,
      disabled: false,
      dataPlanId: plan.planId,
    };
  };

  return (
    <div className={`container mx-auto py-16 px-4`}>
      <h1 className={`text-3xl font-bold text-center mb-4`}>
        {t("choosePlan")}
      </h1>
      <p className={`text-gray-500 text-center mb-12 max-w-2xl mx-auto`}>
        {t("choosePlanDesc")}
      </p>

      {/* Admin Test Controls */}
      <AdminTestControls isAdmin={isAdmin} />

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto`}
      >
        {plans.map((plan, index) => {
          const buttonProps = getPlanButtonProps(plan, index);

          return (
            <div
              key={index}
              className={`bg-accent rounded-xl shadow-md overflow-hidden flex flex-col h-full ${
                isCurrent(plan.planId) ? "ring-2 ring-pink-500" : ""
              }`}
            >
              <div className={`p-6 flex-grow`}>
                <div className={`flex justify-center mb-4`}></div>

                <h2 className={`text-2xl font-semibold text-center mb-2`}>
                  {plan.name}
                </h2>
                <div className={`flex justify-center items-end mb-4`}>
                  <span className={`text-4xl font-bold brand`}>
                    {plan.price}
                  </span>
                  <span className={`text-gray-500`}>{plan.period}</span>
                </div>

                <p
                  className={`text-gray-500 text-center text-sm mb-6 h-[60px] flex items-center justify-center`}
                >
                  "{plan.text}"
                </p>

                <div className={`space-y-3`}>
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className={`flex items-center gap-2`}>
                      <div
                        className={`min-w-6 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center brand shrink-0 mt-0.5`}
                      >
                        {feature.icon}
                      </div>
                      <div
                        className={`flex items-center flex-wrap flex-1 text-sm`}
                      >
                        <span>{feature.name}</span>
                        {feature.value && (
                          <span className={`${feature.name ? "ml-1" : ""}`}>
                            {feature.value}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Links Selection for Agency Plan */}
                {plan.planId === planPrices.agency.planId && (
                  <div className="border-t my15 border-gray-200 py-3">
                    <p className="text-sm text-foreground mb-2 font-medium">
                      {t("howManyLinksDoYouNeed")}
                    </p>
                    <div className="flex items-center mb10">
                      <Select
                        value={String(linksCount)}
                        onValueChange={(value) => setLinksCount(Number(value))}
                        options={[
                          { value: "0", label: "50 links - $39.99/mo" },
                          { value: "50", label: "100 links - $89.99/mo" },
                          { value: "100", label: "150 links - $139.99/mo" },
                          { value: "150", label: "200 links - $189.99/mo" },
                          { value: "200", label: "250 links - $239.99/mo" },
                          { value: "250", label: "300 links - $289.99/mo" },
                          { value: "300", label: "350 links - $339.99/mo" },
                          { value: "350", label: "400 links - $389.99/mo" },
                          { value: "400", label: "450 links - $439.99/mo" },
                          { value: "450", label: "500 links - $489.99/mo" },
                        ]}
                        className="w-full border-border"
                        placeholder={t("selectNumberOfLinks")}
                        renderOption={(option) => option.label}
                      />
                    </div>

                    {/* Add Update Extra Links button for current Agency subscribers */}
                    {isCurrent(plan.planId) &&
                      plan.planId === "price_agency_monthly" && (
                        <button
                          onClick={() => handleExtraLinksChange(linksCount)}
                          disabled={
                            isLoading || linksCount === initialLinksCount
                          }
                          className={`wsn fcc fwn aic g5 mb10 w-full mt-2 py-2 px-4 rounded-md text-center font-medium ${
                            linksCount === initialLinksCount || isLoading
                              ? "bg-gray-200 text-gray-500"
                              : "text-white bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] animate-gradient-x"
                          }`}
                        >
                          <ArrowUp size={16} />
                          {isLoading
                            ? t("processing")
                            : linksCount === initialLinksCount
                            ? t("updateExtraLinks")
                            : t("updateExtraLinks")}
                        </button>
                      )}

                    <ClickForSupport
                      textOnly={true}
                      buttonText={t("needMoreContactUs")}
                      className="wf fz13"
                    />

                    {/* // ! don't uncomment this */}
                    {/* <p className="text-xs text-gray-500 mt-2">
                      {linksCount > 0
                        ? t("baseLinksExtraLinksTotal", {
                            baseLinks: planPrices.agency.baseLinks,
                            extraLinks: linksCount,
                            totalLinks: planPrices.agency.totalLinks,
                          })
                        : t("defaultLinksIncluded")}
                    </p> */}
                  </div>
                )}
              </div>

              <div className={`p-4 mt-auto`}>
                {/* CURRENT PLAN BUTTON - Only show for paid plans, not for Starter/Free plan */}
                {isCurrent(plan.planId) && plan.planId && (
                  <div
                    className={`w-full py-2.5 px-4 rounded-md text-center bg-green-100 text-green-600 font-medium`}
                  >
                    {t("currentPlan")}
                  </div>
                )}

                {/* FREE PLAN BUTTON - Always show for the free plan */}
                {!plan.planId && (
                  <div
                    className={`w-full py-2.5 px-4 rounded-md text-center ${plan.buttonClass} font-medium`}
                  >
                    {plan.buttonText}
                  </div>
                )}

                {/* UPGRADE/DOWNGRADE BUTTON for users with active subscriptions */}
                {!isCurrent(plan.planId) &&
                  plan.planId &&
                  userSubscription &&
                  !userSubscription.isTrialHistoryOnly &&
                  userSubscription.planId &&
                  (() => {
                    // Calculate isDowngrade and gradientClass above the JSX return
                    const currentPlanIndex = plans.findIndex(
                      (p) => p.planId === userSubscription.planId
                    );
                    const targetPlanIndex = plans.findIndex(
                      (p) => p.planId === plan.planId
                    );
                    const isDowngrade = targetPlanIndex < currentPlanIndex;
                    const gradientClass = isDowngrade
                      ? "bg-gradient-to-r from-[#F75C9D] to-[#FF6B6B]"
                      : "bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA]";
                    return (
                      <button
                        onClick={() => handlePlanChange(plan)}
                        disabled={isLoading}
                        className={`w-full py-2.5 px-4 rounded-md text-center font-medium text-white ${gradientClass} animate-gradient-x ${
                          isLoading ? "opacity-50" : ""
                        }`}
                        data-plan-id={plan.planId}
                      >
                        {isLoading
                          ? t("processing")
                          : isDowngrade
                          ? t("downgradePlan")
                          : t("upgradePlan")}
                      </button>
                    );
                  })()}

                {/* SUBSCRIPTION BUTTON for users with only trial history */}
                {!isCurrent(plan.planId) &&
                  plan.planId &&
                  userSubscription &&
                  userSubscription.isTrialHistoryOnly && (
                    <StripeButton
                      className={`w-full py-2.5 px-4 rounded-md text-center font-medium text-white bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] animate-gradient-x`}
                      postType="subscription"
                      planId={plan.planId}
                      plan={plan}
                      trialDays={0}
                      data-plan-id={plan.planId}
                      data-button-type="new-subscription"
                      metadata={
                        plan.extraLinks
                          ? { extraLinks: plan.extraLinks.toString() }
                          : undefined
                      }
                    >
                      {t("subscribeTo", { planName: plan.name })}
                    </StripeButton>
                  )}

                {/* NEW USER BUTTON - either trial or direct subscription */}
                {!isCurrent(plan.planId) &&
                  plan.planId &&
                  !userSubscription && (
                    <StripeButton
                      className={`w-full py-2.5 px-4 rounded-md text-center font-medium text-white bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] animate-gradient-x`}
                      postType="subscription"
                      planId={plan.planId}
                      plan={plan}
                      trialDays={plan.extraLinks > 0 ? 0 : plan.trialDays || 0}
                      data-plan-id={plan.planId}
                      data-button-type="new-user"
                      metadata={
                        plan.extraLinks
                          ? { extraLinks: plan.extraLinks.toString() }
                          : undefined
                      }
                    >
                      {plan.extraLinks > 0
                        ? t("subscribeTo", { planName: plan.name })
                        : plan.trialDays > 0
                        ? t("startFreeTrial", { days: plan.trialDays })
                        : plan.buttonText}
                    </StripeButton>
                  )}

                {/* HIDDEN STRIPE BUTTON FOR PLAN CHANGES - this is the button that will be clicked programmatically */}
                {!isCurrent(plan.planId) &&
                  plan.planId &&
                  userSubscription &&
                  !userSubscription.isTrialHistoryOnly && (
                    <div
                      className="invisible absolute opacity-0"
                      style={{ position: "absolute", left: "-9999px" }}
                    >
                      <StripeButton
                        className={`plan-change-button w-full py-2.5 px-4 rounded-md text-center font-medium text-white bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] animate-gradient-x`}
                        postType="subscription"
                        planId={plan.planId}
                        plan={plan}
                        trialDays={0}
                        data-plan-id={plan.planId}
                        data-button-type="plan-change"
                        id={`stripe-plan-change-${plan.planId}`}
                        metadata={
                          plan.extraLinks
                            ? { extraLinks: plan.extraLinks.toString() }
                            : undefined
                        }
                      >
                        {t("changeTo", { planName: plan.name })}
                      </StripeButton>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {userSubscription &&
        (userSubscription.status === "active" ||
          userSubscription.status === "trialing" ||
          userSubscription.status === "canceled" ||
          userSubscription.isTrialHistoryOnly) && (
          <div className={`mt-12 p-6 bg-accent rounded-xl shadow-md`}>
            <h2 className={`text-xl font-semibold mb-4`}>
              {userSubscription.isTrialHistoryOnly
                ? t("subscriptionHistory")
                : t("yourSubscription")}
            </h2>

            {/* x days left - ending soon */}
            {userSubscription.trialDaysRemaining <= 3 &&
              userSubscription.trialDaysRemaining > 0 && (
                <div className="my10 text-xs text-orange-500 font-medium">
                  {t("trialEndingSoon", {
                    days: userSubscription.trialDaysRemaining,
                  })}
                </div>
              )}

            {userSubscription.isTrialHistoryOnly ? (
              // Show simplified view for users with only trial history
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full bg-gray-500 mr-2`}
                  ></span>
                  <p className="text-sm text-gray-500">
                    {t("previouslyUsedTrial")}
                  </p>
                </div>
              </div>
            ) : (
              // Show regular subscription details for active/trialing/canceled subscriptions
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
                <div>
                  <p className={`text-sm text-gray-500 mb-1`}>{t("status")}</p>
                  <p className={`font-medium`}>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        userSubscription.status === "canceled"
                          ? "bg-red-500"
                          : userSubscription.status === "trialing"
                          ? userSubscription.trialDaysRemaining <= 0
                            ? "bg-red-500"
                            : "bg-orange-500"
                          : userSubscription.cancelAtPeriodEnd
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      } mr-2`}
                    ></span>
                    {userSubscription.status === "canceled"
                      ? t("canceled")
                      : userSubscription.status === "trialing"
                      ? userSubscription.trialDaysRemaining <= 0
                        ? t("trialExpired")
                        : t("trialDaysLeft", {
                            days: userSubscription.trialDaysRemaining || "?",
                          })
                      : userSubscription.cancelAtPeriodEnd
                      ? t("canceledActiveUntilPeriodEnd")
                      : t("active")}
                  </p>
                </div>
                <div>
                  <p className={`text-sm text-gray-500 mb-1`}>
                    {userSubscription.status === "canceled"
                      ? t("canceledOn")
                      : userSubscription.status === "trialing"
                      ? userSubscription.trialDaysRemaining <= 0
                        ? t("trialEndedOn")
                        : t("trialEndsOn")
                      : userSubscription.cancelAtPeriodEnd
                      ? t("activeUntil")
                      : t("nextBillingDate")}
                  </p>
                  <p className={`font-medium`}>
                    {userSubscription.status === "canceled" &&
                    userSubscription.canceledAt
                      ? new Date(
                          userSubscription.canceledAt
                        ).toLocaleDateString()
                      : userSubscription.status === "trialing" &&
                        userSubscription.trialEnd
                      ? new Date(userSubscription.trialEnd).toLocaleDateString()
                      : new Date(
                          userSubscription.currentPeriodEnd
                        ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className={`text-sm text-gray-500 mb-1`}>
                    {userSubscription.status === "canceled" ||
                    (userSubscription.status === "trialing" &&
                      userSubscription.trialDaysRemaining <= 0)
                      ? t("actionNeeded")
                      : userSubscription.cancelAtPeriodEnd
                      ? t("subscription")
                      : t("manageSubscription")}
                  </p>
                  {userSubscription.status === "canceled" ||
                  (userSubscription.trialDaysRemaining <= 0 &&
                    userSubscription.status === "trialing") ? (
                    <button
                      onClick={() => router.push("/pricing")}
                      className={`brand hover:underline font-medium`}
                    >
                      {t("upgradeNow")}
                    </button>
                  ) : userSubscription.cancelAtPeriodEnd ? (
                    <span className="text-yellow-600 font-medium">
                      {t("cancellationScheduled")}
                    </span>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isLoading}
                      className={`text-red-500 hover:underline font-medium disabled:opacity-50 ${
                        userSubscription.status === "trialing" ? "" : ""
                      }`}
                    >
                      {isLoading ? t("processing") : t("cancelSubscription")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {userSubscription.cancelAtPeriodEnd && (
              <div className="mt-4 p-3 border border-yellow-200 rounded-md text-sm">
                <p>
                  {t("subscriptionRemainsActiveUntil", {
                    date: new Date(
                      userSubscription.currentPeriodEnd
                    ).toLocaleDateString(),
                  })}
                </p>
              </div>
            )}

            {/* Show extra links information if applicable */}
            {userSubscription.planId === "price_agency_monthly" && (
              <div className="mt-4 p-3 border border-gray-200 rounded-md">
                <p className="text-sm font-medium">
                  {t("thisIncludesExtraLinks", {
                    extraLinks: userSubscription.extraLinks || 0,
                    totalLinks: 50 + (userSubscription.extraLinks || 0),
                  })}
                </p>
              </div>
            )}

            {userSubscription.status === "canceled" && (
              <div className="mt-4 text-xs text-gray-500">
                {t("subscriptionCanceled")}
              </div>
            )}

            {userSubscription.status === "trialing" &&
              userSubscription.trialDaysRemaining <= 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  {t("trialExpiredUpgradeNow")}
                </div>
              )}
          </div>
        )}

      {/* Support Component */}
      <ClickForSupport
        title={t("contactSupport")}
        hrefs={[
          "link.pop.com@gmail.com",
          "whatsapp.com/send?phone=380950168170",
        ]}
        labels={[t("emailSupport"), t("whatsappSupport")]}
        buttonText={t("contactSupport")}
        className="px-8"
        supportSectionTitle={t("needHelp")}
        supportSectionText={t("supportTeamHere")}
      />
    </div>
  );
}
