"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { MapPin, Save, Check } from "lucide-react";
import Button2 from "@/components/ui/shared/Button/Button2";
import CartShippingAddressFormCountries from "@/components/ui/shared/Cart/CartShippingAddressFormCountries";
import { updateUserShippingAddress } from "@/lib/actions/updateUserShippingAddress";

export default function StoreOwnerShippingAddressForm({
  mongoUser,
  onAddressChange,
  onAddressSaved,
  disabled = false,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();

  // Initialize form state with existing data if available
  const [shippingAddress, setShippingAddress] = useState({
    name: mongoUser?.storeShippingAddress?.name || mongoUser?.name || "",
    line1: mongoUser?.storeShippingAddress?.line1 || "",
    line2: mongoUser?.storeShippingAddress?.line2 || "",
    city: mongoUser?.storeShippingAddress?.city || "",
    state: mongoUser?.storeShippingAddress?.state || "",
    postal_code: mongoUser?.storeShippingAddress?.postal_code || "",
    country: mongoUser?.storeShippingAddress?.country || "US",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form validation
  const isAddressValid = () => {
    return (
      shippingAddress.name.trim() &&
      shippingAddress.line1.trim() &&
      shippingAddress.city.trim() &&
      shippingAddress.state.trim() &&
      shippingAddress.postal_code.trim() &&
      shippingAddress.country.trim()
    );
  };

  // Handle address field changes
  const handleAddressChange = (field, value) => {
    const updatedAddress = {
      ...shippingAddress,
      [field]: value,
    };
    setShippingAddress(updatedAddress);
    setHasUnsavedChanges(true);

    // Notify parent of address change
    onAddressChange?.(updatedAddress);
  };

  // Save address to user profile
  const saveAddress = async () => {
    if (!isAddressValid()) {
      toastSet({
        isOpen: true,
        title: t("incompleteAddress"),
        text: t("pleaseCompleteShippingAddress"),
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateUserShippingAddress({
        shippingAddress,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setHasUnsavedChanges(false);
      toastSet({
        isOpen: true,
        title: t("addressSaved"),
        text: t("storeShippingAddressSaved"),
      });

      // Notify parent that address has been successfully saved
      onAddressSaved?.(shippingAddress);
    } catch (error) {
      console.error("❌ Error saving shipping address:", error);
      toastSet({
        isOpen: true,
        title: t("errorSavingAddress"),
        text: error.message || "Failed to save shipping address",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if address is already saved
  const isAddressSaved = () => {
    if (!mongoUser?.storeShippingAddress) return false;

    const saved = mongoUser.storeShippingAddress;
    return (
      saved.name === shippingAddress.name &&
      saved.line1 === shippingAddress.line1 &&
      saved.line2 === shippingAddress.line2 &&
      saved.city === shippingAddress.city &&
      saved.state === shippingAddress.state &&
      saved.postal_code === shippingAddress.postal_code &&
      saved.country === shippingAddress.country
    );
  };

  return (
    <div className="bg-background border border-border rounded-xl p20 shadow-sm mb20">
      <div className="f aic g10 mb15">
        <MapPin className="w20 h20 text-foreground/50" />
        <h3 className="text-lg font-semibold text-foreground">
          {t("storeShippingAddress")}
        </h3>
        {isAddressSaved() && !hasUnsavedChanges && (
          <Check className="w16 h16 text-green-500" />
        )}
      </div>

      <p className="text-sm text-muted-foreground mb15">
        {t("storeShippingAddressDescription")}
      </p>

      {/* Shipping Address Form */}
      <div className="fc g15 mb15">
        {/* Full Name / Business Name */}
        <div className="fc g5">
          <label className="text-sm font-medium text-foreground">
            {t("businessName")} *
          </label>
          <input
            type="text"
            value={shippingAddress.name}
            onChange={(e) => handleAddressChange("name", e.target.value)}
            placeholder={t("enterBusinessName")}
            className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={disabled}
          />
        </div>

        {/* Address Line 1 */}
        <div className="fc g5">
          <label className="text-sm font-medium text-foreground">
            {t("addressLine1")} *
          </label>
          <input
            type="text"
            value={shippingAddress.line1}
            onChange={(e) => handleAddressChange("line1", e.target.value)}
            placeholder={t("streetAddress")}
            className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={disabled}
          />
        </div>

        {/* Address Line 2 */}
        <div className="fc g5">
          <label className="text-sm font-medium text-foreground">
            {t("addressLine2")}
          </label>
          <input
            type="text"
            value={shippingAddress.line2}
            onChange={(e) => handleAddressChange("line2", e.target.value)}
            placeholder={t("apartmentSuite")}
            className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={disabled}
          />
        </div>

        {/* City, State, ZIP */}
        <div className="f g10">
          <div className="fc g5 flex-1">
            <label className="text-sm font-medium text-foreground">
              {t("city")} *
            </label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              placeholder={t("city")}
              className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={disabled}
            />
          </div>
          <div className="fc g5 flex-1">
            <label className="text-sm font-medium text-foreground">
              {t("state")} *
            </label>
            <input
              type="text"
              value={shippingAddress.state}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              placeholder="CA"
              className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={disabled}
            />
          </div>
          <div className="fc g5 flex-1">
            <label className="text-sm font-medium text-foreground">
              {t("zipCode")} *
            </label>
            <input
              type="text"
              value={shippingAddress.postal_code}
              onChange={(e) =>
                handleAddressChange("postal_code", e.target.value)
              }
              placeholder="12345"
              className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Country */}
        <CartShippingAddressFormCountries
          value={shippingAddress.country}
          onChange={(value) => handleAddressChange("country", value)}
          disabled={disabled}
          required={true}
        />
      </div>

      {/* Save Address Button */}
      {!disabled && (
        <div className="f jce">
          <Button2
            text={isSaving ? t("saving") : t("saveAddress")}
            leftIcon={isSaving ? undefined : undefined}
            onClick={saveAddress}
            disabled={
              !isAddressValid() ||
              isSaving ||
              (!hasUnsavedChanges && isAddressSaved())
            }
            variant={hasUnsavedChanges ? "primary" : "outline"}
            className="mxa min-w-120"
          />
        </div>
      )}

      {/* Address Status */}
      {isAddressSaved() && !hasUnsavedChanges && (
        <div className="mt10 p10 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            {t("storeShippingAddressConfigured")}
          </p>
        </div>
      )}
    </div>
  );
}
