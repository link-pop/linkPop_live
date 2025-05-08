"use client";

import { useState, useEffect } from "react";
import { getPaymentAmount } from "@/lib/utils/subscription/paymentUtils";
import { isValidForReferralEarnings } from "@/lib/utils/referral/calculateReferralEarnings";

// ! code start AdminSubscriptions2Revenue
export default function AdminSubscriptions2Revenue({ subscriptions }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersByPlan: {
      agency: 0,
      creator: 0,
      free: 0,
      agencyPercent: 0,
      creatorPercent: 0,
      freePercent: 0,
    },
    subscriptionStats: {
      active: 0,
      trialing: 0,
      canceled: 0,
      pastDue: 0,
      incomplete: 0,
      upgraded: 0,
      downgraded: 0,
      linksIncreased: 0,
      linksDecreased: 0,
      activePercent: 0,
      trialingPercent: 0,
      canceledPercent: 0,
      pastDuePercent: 0,
      incompletePercent: 0,
      upgradedPercent: 0,
      downgradedPercent: 0,
      linksIncreasedPercent: 0,
      linksDecreasedPercent: 0,
    },
    revenue: {
      total: 0,
      byMonth: {},
      lastMonth: 0,
      growth: 0,
    },
    commissions: {
      total: 0,
      byMonth: {},
      totalReferrers: 0,
    },
    netRevenue: 0,
    topReferrers: [],
    totalPlanChangesCount: 0,
    totalLinksChangesCount: 0,
    averageExtraLinks: 0,
  });

  useEffect(() => {
    if (!subscriptions || !subscriptions.length) return;

    // Get unique users
    const uniqueUsers = new Set();
    subscriptions.forEach((sub) => {
      if (sub.createdBy && sub.createdBy._id) {
        uniqueUsers.add(sub.createdBy._id.toString());
      }
    });
    const totalUsers = uniqueUsers.size;

    // Count by plan type (only count active or trialing)
    const activeOrTrialingSubs = subscriptions.filter(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    const agencyCount = activeOrTrialingSubs.filter((sub) =>
      sub.planId?.includes("agency")
    ).length;

    const creatorCount = activeOrTrialingSubs.filter((sub) =>
      sub.planId?.includes("creator")
    ).length;

    const freeCount = totalUsers - (agencyCount + creatorCount);

    // Calculate percentages
    const agencyPercent = totalUsers
      ? Math.round((agencyCount / totalUsers) * 100)
      : 0;
    const creatorPercent = totalUsers
      ? Math.round((creatorCount / totalUsers) * 100)
      : 0;
    const freePercent = totalUsers
      ? Math.round((freeCount / totalUsers) * 100)
      : 0;

    // Count by subscription status
    const activeCount = subscriptions.filter(
      (sub) => sub.status === "active" && !sub.cancelAtPeriodEnd
    ).length;
    const trialingCount = subscriptions.filter(
      (sub) => sub.status === "trialing"
    ).length;

    // Count upgraded subscriptions
    const upgradedCount = subscriptions.filter(
      (sub) =>
        (sub.status === "canceled" || sub.cancelAtPeriodEnd) &&
        (sub.cancelReason === "plan_upgrade" ||
          sub.metadata?.cancelReason === "plan_upgrade")
    ).length;

    // Count downgraded subscriptions
    const downgradedCount = subscriptions.filter(
      (sub) =>
        (sub.status === "canceled" || sub.cancelAtPeriodEnd) &&
        (sub.cancelReason === "plan_downgrade" ||
          sub.metadata?.cancelReason === "plan_downgrade")
    ).length;

    // Count links increased subscriptions
    const linksIncreasedCount = subscriptions.filter(
      (sub) =>
        (sub.status === "canceled" || sub.cancelAtPeriodEnd) &&
        (sub.cancelReason === "extra_links_increase" ||
          sub.metadata?.cancelReason === "extra_links_increase")
    ).length;

    // Count links decreased subscriptions
    const linksDecreasedCount = subscriptions.filter(
      (sub) =>
        (sub.status === "canceled" || sub.cancelAtPeriodEnd) &&
        (sub.cancelReason === "extra_links_decrease" ||
          sub.metadata?.cancelReason === "extra_links_decrease")
    ).length;

    // Updated canceled count to exclude plan changes and links changes
    const canceledCount = subscriptions.filter(
      (sub) =>
        (sub.status === "canceled" || sub.cancelAtPeriodEnd) &&
        (!sub.cancelReason ||
          (sub.cancelReason !== "plan_upgrade" &&
            sub.cancelReason !== "plan_downgrade" &&
            sub.cancelReason !== "extra_links_increase" &&
            sub.cancelReason !== "extra_links_decrease")) &&
        (!sub.metadata?.cancelReason ||
          (sub.metadata.cancelReason !== "plan_upgrade" &&
            sub.metadata.cancelReason !== "plan_downgrade" &&
            sub.metadata.cancelReason !== "extra_links_increase" &&
            sub.metadata.cancelReason !== "extra_links_decrease"))
    ).length;

    const pastDueCount = subscriptions.filter(
      (sub) => sub.status === "past_due"
    ).length;
    const incompleteCount = subscriptions.filter(
      (sub) =>
        sub.status === "incomplete" || sub.status === "incomplete_expired"
    ).length;

    const totalStatusCount =
      activeCount +
      trialingCount +
      canceledCount +
      pastDueCount +
      incompleteCount +
      upgradedCount +
      downgradedCount +
      linksIncreasedCount +
      linksDecreasedCount;

    // Separate count for plan changes and links changes
    const totalPlanChangesCount = upgradedCount + downgradedCount;
    const totalLinksChangesCount = linksIncreasedCount + linksDecreasedCount;

    // Calculate percentages
    const activePercent = totalStatusCount
      ? Math.round((activeCount / totalStatusCount) * 100)
      : 0;
    const trialingPercent = totalStatusCount
      ? Math.round((trialingCount / totalStatusCount) * 100)
      : 0;
    const canceledPercent = totalStatusCount
      ? Math.round((canceledCount / totalStatusCount) * 100)
      : 0;
    const pastDuePercent = totalStatusCount
      ? Math.round((pastDueCount / totalStatusCount) * 100)
      : 0;
    const incompletePercent = totalStatusCount
      ? Math.round((incompleteCount / totalStatusCount) * 100)
      : 0;

    // Calculate percentages for upgraded and downgraded in the status section
    const upgradedPercent = totalStatusCount
      ? Math.round((upgradedCount / totalStatusCount) * 100)
      : 0;
    const downgradedPercent = totalStatusCount
      ? Math.round((downgradedCount / totalStatusCount) * 100)
      : 0;

    // Calculate percentages for links increased and decreased
    const linksIncreasedPercent = totalStatusCount
      ? Math.round((linksIncreasedCount / totalStatusCount) * 100)
      : 0;
    const linksDecreasedPercent = totalStatusCount
      ? Math.round((linksDecreasedCount / totalStatusCount) * 100)
      : 0;

    // Calculate average extra links for active agency plans
    const activeAgencyPlans = activeOrTrialingSubs.filter((sub) =>
      sub.planId?.includes("agency")
    );
    const totalExtraLinks = activeAgencyPlans.reduce(
      (sum, sub) => sum + (sub.extraLinks || 0),
      0
    );
    const averageExtraLinks = activeAgencyPlans.length
      ? Math.round((totalExtraLinks / activeAgencyPlans.length) * 10) / 10
      : 0;

    // Calculate revenue based on the "Paid" column, not the "Amount" column
    const revenueByMonth = {};
    let totalRevenue = 0;

    console.log("===== REVENUE CALCULATION DETAILS =====");
    console.log(`Total subscriptions: ${subscriptions.length}`);

    // Calculate revenue using the "Paid" column logic
    subscriptions.forEach((sub) => {
      console.log(`\nEvaluating subscription: ${sub._id?.toString()}`);
      console.log(`Status: ${sub.status}, Plan: ${sub.planId}`);
      console.log(`Amount: ${sub.amount}, Currency: ${sub.currency}`);

      if (sub.trialEnd) {
        console.log(`Trial end: ${new Date(sub.trialEnd).toISOString()}`);
      }

      if (sub.canceledAt) {
        console.log(`Canceled at: ${new Date(sub.canceledAt).toISOString()}`);
      }

      console.log(`Metadata: ${JSON.stringify(sub.metadata || {})}`);

      const paidAmount = getPaymentAmount(sub, subscriptions);

      console.log(`Payment amount calculated: ${paidAmount}`);

      if (paidAmount > 0) {
        console.log(
          `Adding to revenue: ${sub._id?.toString()}, status: ${
            sub.status
          }, paid amount: ${paidAmount}`
        );
        totalRevenue += paidAmount;

        // Group by month for the chart
        if (sub.currentPeriodStart) {
          const date = new Date(sub.currentPeriodStart);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

          if (!revenueByMonth[monthYear]) {
            revenueByMonth[monthYear] = 0;
          }
          revenueByMonth[monthYear] += paidAmount;
        }
      } else {
        console.log(
          `Zero payment for: ${sub._id?.toString()}, status: ${
            sub.status
          }, amount: ${sub.amount}`
        );
      }
    });

    console.log("Total revenue (from Paid column):", totalRevenue);
    console.log("===== END REVENUE CALCULATION =====");

    // Calculate commissions
    const commissionsByMonth = {};
    let totalCommissions = 0;

    // Get unique referrers
    const referrers = new Set();
    const referrerStats = {};

    console.log("===== COMMISSIONS CALCULATION DETAILS =====");

    subscriptions.forEach((sub) => {
      // Skip any subscription that doesn't qualify for referral earnings
      if (!isValidForReferralEarnings(sub)) {
        console.log(
          `Subscription ${sub._id?.toString()} not valid for commission calculation (trial or canceled trial)`
        );
        return;
      }

      if (sub.amount && sub.referralCommissionPercentage) {
        // Use the same payment amount logic we use for revenue calculation
        const paidAmount = getPaymentAmount(sub, subscriptions);

        console.log(
          `Evaluating commission for: ${sub._id?.toString()}, paid amount: ${paidAmount}`
        );

        if (paidAmount > 0) {
          const commission =
            (paidAmount * sub.referralCommissionPercentage) / 100;

          console.log(
            `Commission calculated: ${commission} (${sub.referralCommissionPercentage}% of ${paidAmount})`
          );

          if (sub.referrerId) {
            // Only count commission if there is an actual referrer
            totalCommissions += commission;
            console.log(
              `Adding to total commissions: ${commission}, new total: ${totalCommissions}`
            );

            // Track by month
            if (sub.currentPeriodStart) {
              const date = new Date(sub.currentPeriodStart);
              const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

              if (!commissionsByMonth[monthYear]) {
                commissionsByMonth[monthYear] = 0;
              }
              commissionsByMonth[monthYear] += commission;
            }

            // Track referrer info - ensure we're getting the referrer object properly
            const referrerId =
              typeof sub.referrerId === "object" && sub.referrerId?._id
                ? sub.referrerId._id.toString()
                : typeof sub.referrerId === "string"
                ? sub.referrerId
                : null;

            if (referrerId) {
              referrers.add(referrerId);

              if (!referrerStats[referrerId]) {
                referrerStats[referrerId] = {
                  id: referrerId,
                  name:
                    (sub.referrerId &&
                      (sub.referrerId.name || sub.referrerId.displayName)) ||
                    "Unknown",
                  avatar:
                    sub.referrerId &&
                    (sub.referrerId.avatar || sub.referrerId.profilePicture),
                  commissions: 0,
                  referrals: 0,
                };
              }

              referrerStats[referrerId].commissions += commission;
              referrerStats[referrerId].referrals += 1;
            }
          } else {
            console.log(
              `No referrer found for subscription ${sub._id?.toString()}`
            );
          }
        } else {
          console.log(
            `Zero paid amount for subscription ${sub._id?.toString()}, no commission calculated`
          );
        }
      } else {
        console.log(
          `Subscription ${sub._id?.toString()} missing amount or commission percentage`
        );
      }
    });

    console.log("Total commissions:", totalCommissions);
    console.log("===== END COMMISSIONS CALCULATION =====");

    // Get top referrers
    const topReferrers = Object.values(referrerStats)
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 5);

    // Calculate last month revenue and growth
    const sortedMonths = Object.keys(revenueByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split("/").map(Number);
      const [monthB, yearB] = b.split("/").map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    let lastMonthRevenue = 0;
    let previousMonthRevenue = 0;
    let growth = 0;

    if (sortedMonths.length >= 1) {
      lastMonthRevenue = revenueByMonth[sortedMonths[sortedMonths.length - 1]];
    }

    if (sortedMonths.length >= 2) {
      previousMonthRevenue =
        revenueByMonth[sortedMonths[sortedMonths.length - 2]];
      if (previousMonthRevenue > 0) {
        growth = Math.round(
          ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
            100
        );
      }
    }

    const netRevenue = totalRevenue - totalCommissions;
    console.log(
      `Final calculations: Total Revenue: ${totalRevenue}, Total Commissions: ${totalCommissions}, Net Revenue: ${netRevenue}`
    );

    setStats({
      totalUsers,
      usersByPlan: {
        agency: agencyCount,
        creator: creatorCount,
        free: freeCount,
        agencyPercent,
        creatorPercent,
        freePercent,
      },
      subscriptionStats: {
        active: activeCount,
        trialing: trialingCount,
        canceled: canceledCount,
        pastDue: pastDueCount,
        incomplete: incompleteCount,
        upgraded: upgradedCount,
        downgraded: downgradedCount,
        linksIncreased: linksIncreasedCount,
        linksDecreased: linksDecreasedCount,
        activePercent,
        trialingPercent,
        canceledPercent,
        pastDuePercent,
        incompletePercent,
        upgradedPercent,
        downgradedPercent,
        linksIncreasedPercent,
        linksDecreasedPercent,
      },
      revenue: {
        total: totalRevenue,
        byMonth: revenueByMonth,
        lastMonth: lastMonthRevenue,
        growth,
      },
      commissions: {
        total: totalCommissions,
        byMonth: commissionsByMonth,
        totalReferrers: referrers.size,
      },
      netRevenue,
      topReferrers,
      totalPlanChangesCount,
      totalLinksChangesCount,
      averageExtraLinks,
    });
  }, [subscriptions]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Create a bar for percentage visualization
  const PercentageBar = ({ percent, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${color}`}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-accent/40 backdrop-blur-sm border border-accent/30 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.revenue.total)}
              </p>
            </div>
          </div>

          {/* // ! uncomment this ONLY if you will be fixing it */}
          {/* <div className="mt-2 flex items-center">
            <span
              className={`text-xs font-semibold ${
                stats.revenue.growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.revenue.growth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(stats.revenue.growth)}%
            </span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div> */}
        </div>

        <div className="bg-white/80 dark:bg-accent/40 backdrop-blur-sm border border-accent/30 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Net Revenue
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatCurrency(stats.netRevenue)}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-xs font-semibold text-purple-600">
              {formatCurrency(stats.commissions.total)}
            </span>
            <span className="text-xs text-gray-500 ml-2">in commissions</span>
          </div>
        </div>
      </div>

      {/* Plan Distribution and Subscription Status in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white/80 dark:bg-accent/40 backdrop-blur-sm border border-accent/30 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Plan Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">
            Total Users: {stats.totalUsers}
          </p>

          <div className="relative pt-1">
            {/* Sort plan types by percentage (highest first) */}
            {[
              {
                type: "Agency",
                count: stats.usersByPlan.agency,
                percent: stats.usersByPlan.agencyPercent,
                textColor: "text-blue-600",
                bgColor: "bg-blue-200",
                barColor: "bg-blue-600",
              },
              {
                type: "Creator",
                count: stats.usersByPlan.creator,
                percent: stats.usersByPlan.creatorPercent,
                textColor: "text-indigo-600",
                bgColor: "bg-indigo-200",
                barColor: "bg-indigo-600",
              },
              {
                type: "Free",
                count: stats.usersByPlan.free,
                percent: stats.usersByPlan.freePercent,
                textColor: "text-gray-600",
                bgColor: "bg-gray-200",
                barColor: "bg-gray-600",
              },
            ]
              .sort((a, b) => b.percent - a.percent)
              .map((plan) => (
                <div key={plan.type} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${plan.textColor}`}>
                      {plan.type}
                    </span>
                    <span
                      className={`text-sm font-medium ${plan.textColor} ml-2`}
                    >
                      {plan.count} ({plan.percent}%)
                    </span>
                  </div>
                  <PercentageBar percent={plan.percent} color={plan.barColor} />
                </div>
              ))}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white/80 dark:bg-accent/40 backdrop-blur-sm border border-accent/30 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Subscription Status</h3>
          <p className="text-sm text-gray-500 mb-4">
            Total:{" "}
            {stats.subscriptionStats.active +
              stats.subscriptionStats.trialing +
              stats.subscriptionStats.canceled +
              stats.subscriptionStats.pastDue +
              stats.subscriptionStats.incomplete +
              stats.subscriptionStats.upgraded +
              stats.subscriptionStats.downgraded +
              stats.subscriptionStats.linksIncreased +
              stats.subscriptionStats.linksDecreased}
          </p>

          <div className="relative pt-1">
            {/* Sort status types by percentage (highest first) */}
            {[
              {
                type: "Active",
                count: stats.subscriptionStats.active,
                percent: stats.subscriptionStats.activePercent,
                textColor: "text-green-600",
                bgColor: "bg-green-200",
                barColor: "bg-green-600",
              },
              {
                type: "Trialing",
                count: stats.subscriptionStats.trialing,
                percent: stats.subscriptionStats.trialingPercent,
                textColor: "text-orange-600",
                bgColor: "bg-orange-200",
                barColor: "bg-orange-600",
              },
              {
                type: "Canceled",
                count: stats.subscriptionStats.canceled,
                percent: stats.subscriptionStats.canceledPercent,
                textColor: "text-red-600",
                bgColor: "bg-red-200",
                barColor: "bg-red-600",
              },
              {
                type: "Past Due",
                count: stats.subscriptionStats.pastDue,
                percent: stats.subscriptionStats.pastDuePercent,
                textColor: "text-yellow-600",
                bgColor: "bg-yellow-200",
                barColor: "bg-yellow-600",
              },
              {
                type: "Incomplete",
                count: stats.subscriptionStats.incomplete,
                percent: stats.subscriptionStats.incompletePercent,
                textColor: "text-gray-600",
                bgColor: "bg-gray-200",
                barColor: "bg-gray-600",
              },
              {
                type: "Upgraded",
                count: stats.subscriptionStats.upgraded,
                percent: stats.subscriptionStats.upgradedPercent,
                textColor: "text-blue-600",
                bgColor: "bg-blue-200",
                barColor: "bg-blue-600",
              },
              {
                type: "Downgraded",
                count: stats.subscriptionStats.downgraded,
                percent: stats.subscriptionStats.downgradedPercent,
                textColor: "text-purple-600",
                bgColor: "bg-purple-200",
                barColor: "bg-purple-600",
              },
              {
                type: "Links Increased",
                count: stats.subscriptionStats.linksIncreased,
                percent: stats.subscriptionStats.linksIncreasedPercent,
                textColor: "text-emerald-600",
                bgColor: "bg-emerald-200",
                barColor: "bg-emerald-600",
              },
              {
                type: "Links Decreased",
                count: stats.subscriptionStats.linksDecreased,
                percent: stats.subscriptionStats.linksDecreasedPercent,
                textColor: "text-amber-600",
                bgColor: "bg-amber-200",
                barColor: "bg-amber-600",
              },
            ]
              .filter((status) => status.count > 0) // Only show statuses with at least 1 item
              .sort((a, b) => b.percent - a.percent)
              .map((status) => (
                <div key={status.type} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${status.textColor}`}>
                      {status.type}
                    </span>
                    <span
                      className={`text-sm font-medium ${status.textColor} ml-2`}
                    >
                      {status.count} ({status.percent}%)
                    </span>
                  </div>
                  <PercentageBar
                    percent={status.percent}
                    color={status.barColor}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ? code end AdminSubscriptions2Revenue
