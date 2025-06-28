import StripeButton from "@/components/Stripe/StripeButton";

// * SUBSCRIPTION BUTTON for users with canceled/expired subscriptions
export default function SubscriptionResubscribeButton({
  isCurrent,
  plan,
  userSubscription,
  t,
}) {
  if (
    isCurrent ||
    !plan.planId ||
    !userSubscription ||
    userSubscription.isTrialHistoryOnly ||
    !(
      userSubscription.status === "canceled" ||
      (userSubscription.status === "trialing" &&
        userSubscription.trialDaysRemaining <= 0)
    )
  ) {
    return null;
  }

  return (
    <StripeButton
      className={
        "w-full py-2.5 px-4 rounded-md text-center font-medium text-white bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] animate-gradient-x"
      }
      postType="subscription"
      planId={plan.planId}
      plan={plan}
      trialDays={0}
      data-plan-id={plan.planId}
      data-button-type="resubscribe"
      metadata={
        plan.extraLinks ? { extraLinks: plan.extraLinks.toString() } : undefined
      }
    >
      {t("subscribeTo", { planName: plan.name })}
    </StripeButton>
  );
}
