"use client";

import { useState } from "react";
import { fixSubscriptionReferralDataAction } from "@/lib/actions/admin/fixSubscriptionReferralDataAction";

export default function AdminReferralDataFixButton({ mongoUser }) {
  // Return null if user is not a dev
  if (!mongoUser?.isDev) return null;

  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFix = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      const response = await fixSubscriptionReferralDataAction();
      setResult(response);

      if (response.success) {
        // Auto-hide success message after 5 seconds
        setTimeout(() => setResult(null), 5000);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleFix}
        disabled={isFixing}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isFixing
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isFixing ? "Fixing..." : "Fix Referral Data"}
      </button>

      {result && (
        <div
          className={`text-sm p-2 rounded-md max-w-xs ${
            result.success
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {result.success ? (
            <div>
              <div className="font-medium">✅ Success!</div>
              <div className="text-xs mt-1">{result.message}</div>
            </div>
          ) : (
            <div>
              <div className="font-medium">❌ Error</div>
              <div className="text-xs mt-1">{result.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
