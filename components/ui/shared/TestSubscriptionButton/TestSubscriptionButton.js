"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";

export default function TestSubscriptionButton({ className = "" }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestSubscription = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/test-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 50, // $0.5 in cents
          duration: 1, // 1 day
          planType: "creator", // Creator plan type
        }),
      });

      const data = await response.json();

      if (data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || "Failed to create test subscription");
      }
    } catch (error) {
      console.error("❌ Error creating test subscription:", error);
      toastSet({
        title: "Error",
        text: error.message || "Failed to create test subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleTestSubscription}
      disabled={isLoading}
      className={`${className} ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? "Creating Test..." : "Test Subscription ($0.5, 1 day trial)"}
    </button>
  );
}
