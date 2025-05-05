import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getAll } from "@/lib/actions/crud";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import AdminSubscriptions2Revenue from "./AdminSubscriptions2Revenue";
import { getPaymentInfo } from "@/lib/utils/subscription/paymentUtils";
import { getPriceByPlanId } from "@/lib/utils/pricing/getPlanPrices";
import HorizontalTableScroll from "@/components/ui/shared/HorizontalScroll/HorizontalTableScroll";

export default async function AdminSubscriptions2() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser?.isAdmin) return null;

  const subscriptions = await getAll({
    col: "subscriptions2",
    populate: ["createdBy", "referrerId"],
  });

  // Function to calculate days between dates
  const calculateDaysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to calculate days remaining
  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    if (end < now) return 0;
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to determine subscription status display
  const getSubscriptionStatusInfo = (sub, allSubscriptions) => {
    // Base status
    let statusText = sub.status;
    let statusClass = "bg-gray-500/20 text-gray-600";
    let secondStatus = null;

    // Check for upgrade/downgrade status
    if (sub.metadata) {
      if (
        sub.metadata.isChangingPlan === "true" ||
        sub.metadata.isChangingPlan === true
      ) {
        const prevPlan = sub.metadata.previousPlanId || "";
        const currPlan = sub.planId || "";

        if (prevPlan.includes("agency") && currPlan.includes("creator")) {
          secondStatus = {
            text: "downgraded",
            class: "bg-red-500/20 text-red-600",
          };
        } else if (
          prevPlan.includes("creator") &&
          currPlan.includes("agency")
        ) {
          secondStatus = {
            text: "upgraded",
            class: "bg-blue-500/20 text-blue-600",
          };
        }
      }

      // Check for extraLinks changes
      if (
        sub.metadata.extraLinks !== undefined &&
        sub.metadata.previousSubscriptionId
      ) {
        const prevSub = allSubscriptions.find(
          (s) => s._id.toString() === sub.metadata.previousSubscriptionId
        );

        if (prevSub) {
          const prevExtraLinks = prevSub.extraLinks || 0;
          const currExtraLinks = sub.extraLinks || 0;

          if (currExtraLinks > prevExtraLinks) {
            secondStatus = {
              text: `+${currExtraLinks - prevExtraLinks} links`,
              class: "bg-green-500/20 text-green-600",
            };
          } else if (currExtraLinks < prevExtraLinks) {
            secondStatus = {
              text: `-${prevExtraLinks - currExtraLinks} links`,
              class: "bg-yellow-500/20 text-yellow-600",
            };
          }
        }
      }
    }

    // Active subscription
    if (sub.status === "active") {
      if (sub.cancelAtPeriodEnd) {
        statusText = "cancellation scheduled";
        statusClass = "bg-yellow-500/20 text-yellow-600";
      } else {
        statusClass = "bg-green-500/20 text-green-600";
      }
    }
    // Trial subscription
    else if (sub.status === "trialing") {
      if (sub.canceledAt) {
        statusText = "canceled trial";
        statusClass = "bg-red-500/20 text-red-600";
      } else if (new Date(sub.trialEnd) < new Date()) {
        statusText = "trial expired";
        statusClass = "bg-red-500/20 text-red-600";
      } else {
        statusClass = "bg-orange-500/20 text-orange-600";
      }
    }
    // Canceled subscription
    else if (sub.status === "canceled") {
      // Check if canceled due to plan change
      const isCanceledForPlanChange =
        sub.cancelReason === "plan_change" ||
        sub.cancelReason === "plan_upgrade" ||
        sub.cancelReason === "plan_downgrade" ||
        sub.cancelReason === "extra_links_increase" ||
        sub.cancelReason === "extra_links_decrease" ||
        (sub.metadata &&
          (sub.metadata.cancelReason === "plan_change" ||
            sub.metadata.cancelReason === "plan_upgrade" ||
            sub.metadata.cancelReason === "plan_downgrade" ||
            sub.metadata.cancelReason === "extra_links_increase" ||
            sub.metadata.cancelReason === "extra_links_decrease"));

      if (isCanceledForPlanChange) {
        // Find the replacement subscription
        const nextSub = allSubscriptions.find((s) => {
          // If this is the subscription that replaced the current one
          return s.metadata?.previousSubscriptionId === sub._id.toString();
        });

        // Directly use the cancelReason if available
        if (
          sub.cancelReason === "plan_upgrade" ||
          (sub.metadata && sub.metadata.cancelReason === "plan_upgrade")
        ) {
          statusText = "canceled to upgrade";
          statusClass = "bg-blue-500/20 text-blue-600";
        } else if (
          sub.cancelReason === "plan_downgrade" ||
          (sub.metadata && sub.metadata.cancelReason === "plan_downgrade")
        ) {
          statusText = "canceled to downgrade";
          statusClass = "bg-red-500/20 text-red-600";
        } else if (
          sub.cancelReason === "extra_links_increase" ||
          (sub.metadata && sub.metadata.cancelReason === "extra_links_increase")
        ) {
          statusText = "canceled to add links";
          statusClass = "bg-green-500/20 text-green-600";
        } else if (
          sub.cancelReason === "extra_links_decrease" ||
          (sub.metadata && sub.metadata.cancelReason === "extra_links_decrease")
        ) {
          statusText = "canceled to remove links";
          statusClass = "bg-yellow-500/20 text-yellow-600";
        } else if (nextSub) {
          // Check if it's an upgrade or downgrade
          if (
            sub.planId?.includes("agency") &&
            nextSub.planId?.includes("creator")
          ) {
            statusText = "canceled to downgrade";
            statusClass = "bg-red-500/20 text-red-600";
          } else if (
            sub.planId?.includes("creator") &&
            nextSub.planId?.includes("agency")
          ) {
            statusText = "canceled to upgrade";
            statusClass = "bg-blue-500/20 text-blue-600";
          } else if (sub.planId === nextSub.planId) {
            // Check if it's an extraLinks change
            const prevExtraLinks = sub.extraLinks || 0;
            const nextExtraLinks = nextSub.extraLinks || 0;

            if (nextExtraLinks > prevExtraLinks) {
              statusText = "canceled to add links";
              statusClass = "bg-green-500/20 text-green-600";
            } else if (nextExtraLinks < prevExtraLinks) {
              statusText = "canceled to remove links";
              statusClass = "bg-yellow-500/20 text-yellow-600";
            } else {
              statusText = "canceled for plan change";
              statusClass = "bg-yellow-500/20 text-yellow-600";
            }
          } else {
            statusText = "canceled for plan change";
            statusClass = "bg-yellow-500/20 text-yellow-600";
          }
        } else if (sub.newPlanId) {
          // If we have the new plan ID stored, we can determine the change
          if (
            sub.planId?.includes("agency") &&
            sub.newPlanId?.includes("creator")
          ) {
            statusText = "canceled to downgrade";
            statusClass = "bg-red-500/20 text-red-600";
          } else if (
            sub.planId?.includes("creator") &&
            sub.newPlanId?.includes("agency")
          ) {
            statusText = "canceled to upgrade";
            statusClass = "bg-blue-500/20 text-blue-600";
          } else {
            statusText = "canceled for plan change";
            statusClass = "bg-yellow-500/20 text-yellow-600";
          }
        } else {
          statusText = "canceled for plan change";
          statusClass = "bg-yellow-500/20 text-yellow-600";
        }
      } else {
        statusClass = "bg-red-500/20 text-red-600";
      }
    }
    // Past due subscription
    else if (sub.status === "past_due") {
      statusClass = "bg-red-500/20 text-red-600";
    }
    // Incomplete subscription
    else if (sub.status === "incomplete") {
      statusClass = "bg-yellow-500/20 text-yellow-600";
    }
    // Incomplete expired subscription
    else if (sub.status === "incomplete_expired") {
      statusText = "incomplete expired";
      statusClass = "bg-red-500/20 text-red-600";
    }
    // Unpaid subscription
    else if (sub.status === "unpaid") {
      statusClass = "bg-red-500/20 text-red-600";
    }

    return { statusText, statusClass, secondStatus };
  };

  // Function to format plan ID for display
  const formatPlanId = (planId) => {
    if (!planId) return "N/A";

    // Remove price_ prefix
    let formattedPlan = planId.replace("price_", "");

    // Remove _monthly prefix
    formattedPlan = formattedPlan.replace("_monthly", "");

    return formattedPlan;
  };

  // Function to format links display
  const getLinksDisplay = (sub) => {
    if (!sub.planId || !sub.planId.includes("agency")) {
      return { text: "N/A", class: "text-gray-500" };
    }

    // Get the plan details to know base links
    const planDetails = getPriceByPlanId(sub.planId, sub.extraLinks || 0);
    const baseLinks = planDetails.baseLinks || 50;
    const extraLinks = sub.extraLinks || 0;
    const totalLinks = baseLinks + extraLinks;

    // Calculate extra cost
    const extraLinksCost = extraLinks > 0 ? extraLinks : 0;

    return {
      text: `${totalLinks} (${baseLinks}+${extraLinks})`,
      class: extraLinks > 0 ? "text-green-600" : "text-gray-600",
      extraCost: extraLinksCost > 0 ? `+$${extraLinksCost.toFixed(2)}` : null,
    };
  };

  return (
    <div className="space-y-6 p-4 bg-background rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-4">
        All Subscriptions
      </h2>

      {/* Revenue Dashboard */}
      <AdminSubscriptions2Revenue subscriptions={subscriptions} />

      {/* Subscriptions Table */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Subscription Details</h3>
        <HorizontalTableScroll className="pb-2">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-accent">
                <th className="p-2 text-center">User</th>
                <th className="p-2 text-center">Plan</th>
                <th className="p-2 text-center">Links</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Paid</th>
                <th className="p-2 text-center">Current Period</th>
                <th className="p-2 text-center">Expires In</th>
                <th className="p-2 text-center">Trial Info</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-2 text-center">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const { statusText, statusClass, secondStatus } =
                    getSubscriptionStatusInfo(sub, subscriptions);

                  // Calculate actual trial duration from actual dates
                  const actualTrialDuration =
                    sub.trialStart && sub.trialEnd
                      ? calculateDaysBetween(sub.trialStart, sub.trialEnd)
                      : sub.trialDurationDays || 0;

                  // Calculate days remaining until expiration
                  const daysRemaining = calculateDaysRemaining(
                    sub.currentPeriodEnd
                  );

                  // Get payment information
                  const paymentInfo = getPaymentInfo(sub, subscriptions);

                  // Get links information
                  const linksInfo = getLinksDisplay(sub);

                  return (
                    <tr
                      key={sub._id}
                      className="border-b border-accent hover:bg-accent/20"
                    >
                      <td className="p-2 text-center">
                        {sub.createdBy ? (
                          <CreatedBy
                            wrapClassName="pen"
                            createdBy={sub.createdBy}
                            showName={true}
                          />
                        ) : (
                          "Unknown"
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {formatPlanId(sub.planId)}
                      </td>
                      <td className="p-2 text-center">
                        <div
                          className={`flex flex-col items-center ${linksInfo.class}`}
                        >
                          <span>{linksInfo.text}</span>
                          {linksInfo.extraCost && (
                            <span className="text-xs text-green-600">
                              {linksInfo.extraCost}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${statusClass} text-center`}
                          >
                            {statusText}
                          </span>
                          {secondStatus && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${secondStatus.class} text-center`}
                            >
                              {secondStatus.text}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {sub.amount
                          ? `${sub.amount.toFixed(
                              2
                            )} ${sub.currency.toUpperCase()}`
                          : "N/A"}
                      </td>
                      <td className="p-2 text-center">
                        <div
                          className={`flex flex-col items-center ${paymentInfo.class}`}
                        >
                          <span>{paymentInfo.text}</span>
                          {paymentInfo.previousPlan && (
                            <span className="text-xs text-gray-500">
                              Previous: {formatPlanId(paymentInfo.previousPlan)}
                            </span>
                          )}
                          {paymentInfo.nextPlan && (
                            <span className="text-xs text-gray-500">
                              Next: {formatPlanId(paymentInfo.nextPlan)}
                            </span>
                          )}
                          {paymentInfo.note && (
                            <span className="text-xs text-gray-500">
                              {paymentInfo.note}
                            </span>
                          )}
                          {paymentInfo.extraLinksChange && (
                            <span className="text-xs text-blue-500">
                              {paymentInfo.extraLinksChange}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {new Date(sub.currentPeriodStart).toLocaleDateString()}{" "}
                        to {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`${
                            daysRemaining <= 3 ? "text-red-500 font-medium" : ""
                          } ${
                            sub.status !== "active" && sub.status !== "trialing"
                              ? "tdlt"
                              : ""
                          }`}
                        >
                          {daysRemaining} days
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        {sub.status === "trialing" || sub.trialEnd ? (
                          <div className="flex flex-col text-xs items-center">
                            <span>Duration: {actualTrialDuration} days</span>
                            {sub.trialStart && (
                              <span>
                                Start:{" "}
                                {new Date(sub.trialStart).toLocaleDateString()}
                              </span>
                            )}
                            {sub.trialEnd && (
                              <span>
                                End:{" "}
                                {new Date(sub.trialEnd).toLocaleDateString()}
                                {new Date(sub.trialEnd) < new Date() &&
                                  " (Expired)"}
                              </span>
                            )}
                            {sub.canceledAt && sub.status === "trialing" && (
                              <span className="text-red-500">
                                Canceled:{" "}
                                {new Date(sub.canceledAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </HorizontalTableScroll>
      </div>
    </div>
  );
}
