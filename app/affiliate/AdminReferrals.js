import React from "react";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getAll } from "@/lib/actions/crud";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import { Badge } from "@/components/ui/badge";
import {
  filterValidEarnings,
  groupEarningsByReferral,
} from "@/lib/utils/referral/calculateReferralEarnings";
import HorizontalTableScroll from "@/components/ui/shared/HorizontalScroll/HorizontalTableScroll";

export default async function AdminReferrals() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser?.isAdmin) return null;

  // Fetch referrals with populated user data
  const referrals = await getAll({
    col: "referrals",
    populate: ["referrerId", "referredId"],
  });

  // Fetch referral earnings records with populated data
  const referralEarningsResult = await getAll({
    col: "referralearnings",
    populate: ["referrerId", "referredId", "subscriptionId"],
  });

  // Ensure we have a valid array of earnings
  const referralEarnings = Array.isArray(referralEarningsResult)
    ? referralEarningsResult
    : [];

  // Filter out earnings from trial subscriptions
  const validReferralEarnings = filterValidEarnings(referralEarnings);

  // Group earnings by referral (using both referrerId and referredId as a combined key)
  const earningsByReferral = groupEarningsByReferral(validReferralEarnings);

  return (
    <div className="space-y-6 p-4 bg-background rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-foreground">All Referrals</h2>

      <HorizontalTableScroll className="pb-2">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-accent">
              <th className="p-2 text-left">Referrer</th>
              <th className="p-2 text-left">Referred User</th>
              <th className="p-2 text-left">Referral Code</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Activated</th>
              <th className="p-2 text-left">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(referrals) || referrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-2 text-center">
                  No referrals found
                </td>
              </tr>
            ) : (
              referrals.map((referral) => {
                const referrerId = referral.referrerId?._id?.toString();
                const referredId = referral.referredId?._id?.toString();

                // Get earnings specific to this referrer-referred relationship
                const key = `${referrerId}:${referredId}`;
                const earnings = earningsByReferral[key] || [];

                // Calculate earnings totals
                const totalEarned = earnings.reduce(
                  (sum, earning) =>
                    sum + (parseFloat(earning.commissionAmount) || 0),
                  0
                );

                const paidEarnings = earnings.filter(
                  (earning) => earning.status === "paid"
                );
                const pendingEarnings = earnings.filter(
                  (earning) => earning.status === "pending"
                );

                const totalPaid = paidEarnings.reduce(
                  (sum, earning) =>
                    sum + (parseFloat(earning.commissionAmount) || 0),
                  0
                );
                const totalPending = pendingEarnings.reduce(
                  (sum, earning) =>
                    sum + (parseFloat(earning.commissionAmount) || 0),
                  0
                );

                return (
                  <tr
                    key={referral._id}
                    className="border-b border-accent hover:bg-accent/20"
                  >
                    <td className="p-2">
                      {referral.referrerId ? (
                        <CreatedBy
                          wrapClassName="pen"
                          createdBy={referral.referrerId}
                          showName={true}
                        />
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="p-2">
                      {referral.referredId ? (
                        <CreatedBy
                          wrapClassName="pen"
                          createdBy={referral.referredId}
                          showName={true}
                        />
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="p-2">{referral.referralCode}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === "active"
                            ? "bg-green-500/20 text-green-600"
                            : referral.status === "cancelled"
                            ? "bg-red-500/20 text-red-600"
                            : "bg-yellow-500/20 text-yellow-600"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {referral.activatedAt
                        ? new Date(referral.activatedAt).toLocaleDateString()
                        : "Not activated"}
                    </td>
                    <td className="p-2">
                      <div className="fc g4">
                        <div className="font-bold">
                          ${totalEarned.toFixed(2)}
                        </div>
                        <div className="text-sm flex gap-2">
                          <Badge
                            variant="outline"
                            className="text-green-500 bg-green-50 dark:bg-green-950/50"
                          >
                            ${totalPaid.toFixed(2)} paid
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"
                          >
                            ${totalPending.toFixed(2)} pending
                          </Badge>
                        </div>
                        {earnings.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              ({earnings.length} transaction
                              {earnings.length !== 1 ? "s" : ""})
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </HorizontalTableScroll>
    </div>
  );
}
