"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import StoreItemStepNavigation from "@/components/ui/shared/StoreItemStepNavigation/StoreItemStepNavigation";
import UserStripeConnectOnboardingButton from "@/components/ui/shared/UserStripeConnectOnboardingButton/UserStripeConnectOnboardingButton";
import StoreOwnerShippingAddressForm from "@/components/ui/shared/StoreOwnerShippingAddressForm/StoreOwnerShippingAddressForm";
import AddStoreItemForms from "@/components/ui/shared/AddStoreItemForms/AddStoreItemForms";
import { isStripeConnectReadyIncludingDevBypass } from "@/lib/utils/stripe/stripeConnectHelpers";

export default function AddStoreItemWithSteps({ col, mongoUser }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isStripeConnectReady, setIsStripeConnectReady] = useState(false);
  const [hasShippingAddress, setHasShippingAddress] = useState(false);

  // Check initial states
  useEffect(() => {
    // Check Stripe Connect status (includes dev bypass)
    const stripeReady = isStripeConnectReadyIncludingDevBypass(mongoUser);
    setIsStripeConnectReady(stripeReady);

    // Check if shipping address exists
    const addressExists = !!(
      mongoUser?.storeShippingAddress?.name &&
      mongoUser?.storeShippingAddress?.line1 &&
      mongoUser?.storeShippingAddress?.city &&
      mongoUser?.storeShippingAddress?.state &&
      mongoUser?.storeShippingAddress?.postal_code &&
      mongoUser?.storeShippingAddress?.country
    );
    setHasShippingAddress(addressExists);

    // Auto-advance to appropriate step based on completion status
    if (stripeReady && addressExists) {
      setCurrentStep(3); // Go directly to store item form
    } else if (stripeReady) {
      setCurrentStep(2); // Go to shipping address
    } else {
      setCurrentStep(1); // Stay on Stripe Connect
    }
  }, [mongoUser]);

  const handleStripeConnectComplete = (isReady) => {
    setIsStripeConnectReady(isReady);
    if (isReady && currentStep === 1) {
      setCurrentStep(2); // Auto-advance to shipping address
    }
  };

  const handleShippingAddressChange = (address) => {
    // Check if address is complete (but don't auto-advance yet)
    const isComplete = !!(
      address?.name &&
      address?.line1 &&
      address?.city &&
      address?.state &&
      address?.postal_code &&
      address?.country
    );
    setHasShippingAddress(isComplete);
  };

  const handleShippingAddressSaved = (address) => {
    // Only advance to next step after successful save
    setHasShippingAddress(true);
    if (currentStep === 2) {
      setCurrentStep(3); // Auto-advance to store item form after save
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto p20">
            <div className="text-center mb30">
              <h1 className="text-2xl font-bold mb10">{t("setupPayments")}</h1>
              <p className="text-muted-foreground">
                {t("stripeConnectRequiredForStore")}
              </p>
            </div>
            <UserStripeConnectOnboardingButton
              mongoUser={mongoUser}
              onOnboardingComplete={handleStripeConnectComplete}
              variant="default"
            />
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto p20">
            <div className="text-center mb30">
              <h1 className="text-2xl font-bold mb10">
                {t("shippingAddress")}
              </h1>
              <p className="text-muted-foreground">
                {t("configureStoreShippingAddress")}
              </p>
            </div>
            <StoreOwnerShippingAddressForm
              mongoUser={mongoUser}
              onAddressChange={handleShippingAddressChange}
              onAddressSaved={handleShippingAddressSaved}
              disabled={!isStripeConnectReady}
            />
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto p20">
            <div className="text-center mb30">
              <h1 className="text-2xl font-bold mb10">
                {t("createStoreItem")}
              </h1>
              <p className="text-muted-foreground">{t("addItemToYourStore")}</p>
            </div>
            <AddStoreItemForms
              col={col}
              mongoUser={mongoUser}
              placeholder={t("describeYourStoreItem")}
              submitBtnText={t("addToStore")}
              submitBtnClassName="z51 poa r15 -t250"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Step Navigation */}
      <StoreItemStepNavigation
        currentStep={currentStep}
        setStep={setCurrentStep}
        isStripeConnectReady={isStripeConnectReady}
        hasShippingAddress={hasShippingAddress}
      />

      {/* Step Content */}
      <div className="pt-20">{renderStepContent()}</div>
    </div>
  );
}
