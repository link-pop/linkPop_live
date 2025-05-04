"use client";

import { useState } from "react";
import axios from "axios";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import Button2 from "../ui/shared/Button/Button2";
import { checkTrialEligibility } from "@/lib/actions/checkTrialEligibility";

export default function StripeButton(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { toastSet } = useContext();
  const { t } = useTranslation();

  // Extract custom attributes to pass to the button
  const { "data-plan-id": dataPlanId, ...otherProps } = props;

  const handleClick = async () => {
    try {
      setIsLoading(true);

      // Determine the type of payment (feed post, chat message, or subscription)
      const postType = props.postType || "feeds";
      let endpoint,
        requestData = {};

      // Handle different payment types
      if (postType === "feeds") {
        if (!props.postId) {
          throw new Error("Missing required property: postId");
        }
        endpoint = "/api/stripe/feeds";
        requestData = { postId: props.postId };
      } else if (postType === "chatmessages") {
        if (!props.messageId) {
          throw new Error("Missing required property: messageId");
        }
        endpoint = "/api/stripe/chatmessages";
        requestData = { messageId: props.messageId };
      } else if (postType === "subscription") {
        if (!props.planId) {
          throw new Error("Missing required property: planId");
        }

        // Check if this is a trial signup
        if (props.trialDays && props.trialDays > 0) {
          // Check if user is eligible for a trial
          const eligibility = await checkTrialEligibility();

          if (!eligibility.eligible) {
            // Show message explaining why they can't get a trial
            toastSet({
              title: `Trial not available`,
              text:
                eligibility.message ||
                "You are not eligible for a free trial at this time.",
              variant: "destructive",
            });
            setIsLoading(false);
            return; // Stop here, don't proceed with payment
          }
        }

        endpoint = "/api/stripe/pricing2";
        requestData = {
          planId: props.planId,
          trialDays: props.trialDays || 0,
        };

        // Add any metadata if available
        if (props.metadata) {
          requestData.metadata = props.metadata;
        }
      } else {
        throw new Error(`Unsupported payment type: ${postType}`);
      }

      console.log(`Sending ${postType} payment request:`, requestData);

      // Send request to the appropriate API endpoint
      const { data } = await axios.post(endpoint, requestData);

      if (data?.sessionUrl) {
        console.log("Redirecting to Stripe checkout:", data.sessionUrl);
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("No session URL returned from payment service");
      }
    } catch (error) {
      console.error("Stripe payment error:", error);

      // Show user-friendly error message
      toastSet({
        title: t("paymentError"),
        text:
          error.response?.data?.error ||
          error.message ||
          t("unknownPaymentError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ! code start StripeButton
  return (
    <div className="por wf" style={{ position: "relative" }}>
      <PostsLoader
        {...{ isLoading, className: "!poa !h35 !wf !ml0 !mt0 !br6" }}
      />
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={
          props?.children ||
          t("subscribeTo", { planName: props.plan?.name || "" })
        }
        className="wsn fcc ttu h44 br20 py12 px24 cp transition-colors bg-[var(--color-brand)] hover:brightness-[1.1] text-white"
        style={{
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "14px",
          fontWeight: "500",
          border: "none",
          outline: "none",
          padding: "0 24px",
          height: "44px",
          borderRadius: "20px",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
        data-plan-id={dataPlanId || props.planId}
        {...otherProps}
      >
        {props?.children ||
          t("subscribeTo", { planName: props.plan?.name || "" })}
      </button>
    </div>
  );
  // ? code end StripeButton
}
