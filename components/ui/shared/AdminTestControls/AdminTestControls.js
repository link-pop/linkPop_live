"use client";

import { useState } from "react";
import { Beaker } from "lucide-react";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start AdminTestControls component
export default function AdminTestControls({ isAdmin = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const { dialogSet, toastSet } = useContext();
  const { t } = useTranslation();

  // Handle test trial subscription for admins
  const handleTestTrialSubscription = async () => {
    if (!isAdmin) return;

    dialogSet({
      isOpen: true,
      title: "Create Test Trial Subscription",
      text: "This will create a minimal trial subscription (1 day, $0.50) to test if Stripe auto-renewal sync works correctly with our database. Use this only for testing purposes.",
      showCancelBtn: true,
      cancelBtnText: t("cancel"),
      confirmBtnText: "Create Test Subscription",
      confirmBtnVariant: "default",
      action: async () => {
        setIsLoading(true);

        try {
          const endpoint = "/api/stripe/test-trial";
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              trialDays: 1, // Minimal trial period (1 day)
              amount: 50, // $0.50 in cents
              testMode: true,
            }),
          });

          const data = await response.json();

          if (data?.sessionUrl) {
            console.log(
              "Redirecting to Stripe test checkout:",
              data.sessionUrl
            );
            window.location.href = data.sessionUrl;
          } else {
            throw new Error(
              data?.error || "No session URL returned from payment service"
            );
          }
        } catch (error) {
          const errorMessage =
            error.message ||
            "An unexpected error occurred during test subscription creation.";
          console.error("Error creating test subscription:", error);

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

  if (!isAdmin) return null;

  return (
    <div className="mb-8 p-4 border border-red-200 rounded-md bg-red-50">
      <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
        <Beaker size={18} /> Admin Testing Controls
      </h3>
      <p className="text-sm text-red-600 mb-3">
        Use these controls to test Stripe integration. These options are only
        visible to admins.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTestTrialSubscription}
          disabled={isLoading}
          className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 flex items-center gap-2"
        >
          <Beaker size={16} />
          {isLoading ? "Processing..." : "Test 1-Day Trial ($0.50)"}
        </button>
      </div>
    </div>
  );
}
// ? code end AdminTestControls component
