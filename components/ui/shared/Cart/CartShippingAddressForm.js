"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { MapPin, Calculator, Truck, Save } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import LoadingSpinner from "@/components/ui/shared/LoadingSpinner/LoadingSpinner";
import Button2 from "@/components/ui/shared/Button/Button2";
import CartShippingAddressFormCountries from "./CartShippingAddressFormCountries";
import {
  getUserShippingAddress,
  saveUserShippingAddress,
} from "@/lib/actions/userShippingAddressActions";

export default function CartShippingAddressForm({
  onShippingAddressChange,
  onShippingCostChange,
  onShippingRateChange,
  cartGroups = [],
  isLoading = false,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [shippingError, setShippingError] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

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

  // Check if shipping information is filled (address valid and rates calculated)
  const isShippingInfoFilled = () => {
    return isAddressValid() && selectedShippingRate;
  };

  // Load saved shipping address on component mount
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const result = await getUserShippingAddress();
        if (result.success && result.hasAddress) {
          const savedAddress = result.shippingAddress;
          setShippingAddress({
            name: savedAddress.name || "",
            line1: savedAddress.line1 || "",
            line2: savedAddress.line2 || "",
            city: savedAddress.city || "",
            state: savedAddress.state || "",
            postal_code: savedAddress.postal_code || "",
            country: savedAddress.country || "US",
          });

          // Notify parent of loaded address
          onShippingAddressChange?.(savedAddress);
        }
      } catch (error) {
        console.error("Error loading saved address:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    loadSavedAddress();
  }, []);

  // Handle address field changes
  const handleAddressChange = (field, value) => {
    const updatedAddress = {
      ...shippingAddress,
      [field]: value,
    };
    setShippingAddress(updatedAddress);

    // Clear previous rates when address changes
    setShippingRates([]);
    setSelectedShippingRate(null);
    setShippingError(null);

    // Notify parent of address change
    onShippingAddressChange?.(updatedAddress);
  };

  // Calculate shipping rates
  const calculateShippingRates = async () => {
    if (!isAddressValid()) {
      toastSet({
        isOpen: true,
        title: t("incompleteAddress"),
        text: t("pleaseCompleteShippingAddress"),
      });
      return;
    }

    if (!cartGroups.length) {
      toastSet({
        isOpen: true,
        title: t("emptyCart"),
        text: t("addItemsToCalculateShipping"),
      });
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const response = await fetch("/api/shippo/calculate-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress,
          cartGroups,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate shipping rates");
      }

      if (data.rates && data.rates.length > 0) {
        setShippingRates(data.rates);

        // Auto-select the cheapest rate
        const cheapestRate = data.rates.reduce((cheapest, rate) => {
          return parseFloat(rate.amount) < parseFloat(cheapest.amount)
            ? rate
            : cheapest;
        });

        setSelectedShippingRate(cheapestRate);
        onShippingCostChange?.(parseFloat(cheapestRate.amount));
      } else {
        setShippingError("No shipping rates available for this address");
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
      setShippingError(error.message);
      toastSet({
        isOpen: true,
        title: t("shippingCalculationError"),
        text: error.message || "Failed to calculate shipping rates",
      });
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Handle shipping rate selection
  const handleShippingRateSelect = (rate) => {
    setSelectedShippingRate(rate);
    onShippingCostChange?.(parseFloat(rate.amount));
    onShippingRateChange?.(rate);
  };

  // Save shipping address
  const handleSaveAddress = async () => {
    if (!isAddressValid()) {
      toastSet({
        isOpen: true,
        title: t("incompleteAddress"),
        text: t("pleaseCompleteShippingAddress"),
      });
      return;
    }

    setIsSavingAddress(true);

    try {
      const result = await saveUserShippingAddress(shippingAddress);

      if (result.error) {
        throw new Error(result.error);
      }

      toastSet({
        isOpen: true,
        title: t("addressSaved"),
        text: t("shippingAddressSavedSuccessfully"),
      });
    } catch (error) {
      console.error("Error saving address:", error);
      toastSet({
        isOpen: true,
        title: t("errorSavingAddress"),
        text: error.message || "Failed to save address",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (isLoadingAddress) {
    return (
      <div className="bg-background border border-border rounded-xl p25 shadow-sm">
        <div className="f aic g10 mb20">
          <MapPin className="w20 h20 text-foreground/50" />
          <h3 className="text-lg font-semibold text-foreground">
            {t("shippingAddress")}
          </h3>
        </div>
        <div className="f aic jcc p20">
          <LoadingSpinner size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-xl p25 shadow-sm">
      <div className="f aic g10 mb20">
        <MapPin className="w20 h20 text-foreground/50" />
        <h3 className="text-lg font-semibold text-foreground">
          {t("shippingAddress")}
        </h3>
      </div>

      {/* Shipping Address Form */}
      <div className="fc g15 mb20">
        {/* Full Name */}
        <div className="fc g5">
          <label className="text-sm font-medium text-foreground">
            {t("fullName")} *
          </label>
          <input
            type="text"
            value={shippingAddress.name}
            onChange={(e) => handleAddressChange("name", e.target.value)}
            placeholder={t("enterFullName")}
            className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={isLoading}
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
            disabled={isLoading}
          />
          <p className="fz12 text-muted-foreground -mt4 pl3">
            *{t("usePOBoxForAnonymousDelivery")}
          </p>
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
            disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Country */}
        <CartShippingAddressFormCountries
          value={shippingAddress.country}
          onChange={(value) => handleAddressChange("country", value)}
          disabled={isLoading}
          required={true}
        />
      </div>

      {/* Action Buttons */}
      <div className="fc g10 mb15">
        {/* Save Address Button */}
        <Button2
          text={isSavingAddress ? t("savingAddress") : t("saveAddress")}
          leftIcon={isSavingAddress ? undefined : undefined}
          onClick={handleSaveAddress}
          disabled={!isAddressValid() || isLoading || isSavingAddress}
          variant="outline"
          className="w-full"
        >
          {isSavingAddress && <LoadingSpinner size={16} className="mr-2" />}
        </Button2>

        {/* Calculate Shipping Button */}
        {isCalculatingShipping ? (
          <Button2
            variant={isShippingInfoFilled() ? "outline" : "primary"}
            className="w-full"
            disabled={true}
          >
            <LoadingSpinner size={16} className="mr-2" />
            {t("calculatingShipping")}
          </Button2>
        ) : (
          <Button2
            text={t("calculateShipping")}
            leftIcon={undefined}
            onClick={calculateShippingRates}
            disabled={!isAddressValid() || isLoading}
            variant={isShippingInfoFilled() ? "outline" : "primary"}
            className="w-full"
          />
        )}
      </div>

      {/* Shipping Error */}
      {shippingError && (
        <div className="p10 bg-destructive/10 border border-destructive/30 rounded-lg mb15">
          <p className="text-sm text-destructive">{shippingError}</p>
        </div>
      )}

      {/* Shipping Rates */}
      {shippingRates.length > 0 && (
        <div className="fc g10">
          <div className="f aic g8 mb10">
            <Truck className="w16 h16 text-foreground/50" />
            <h4 className="font-medium text-foreground">
              {t("shippingOptions")}
            </h4>
          </div>

          {shippingRates.map((rate) => (
            <div
              key={rate.object_id}
              className={`p12 border rounded-lg cursor-pointer transition-colors ${
                selectedShippingRate?.object_id === rate.object_id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50"
              }`}
              onClick={() => handleShippingRateSelect(rate)}
            >
              <div className="f jcsb aic">
                <div>
                  <div className="font-medium text-foreground">
                    {rate.servicelevel?.name || rate.provider}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {rate.estimated_days &&
                      `${rate.estimated_days} business days`}
                  </div>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {formatPrice(parseFloat(rate.amount))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Shipping Summary */}
      {selectedShippingRate && (
        <div className="mt15 p12 bg-accent border border-accent/30 rounded-lg">
          <div className="f jcsb aic">
            <span className="font-medium text-foreground">
              {t("selectedShipping")}:
            </span>
            <span className="font-bold text-foreground/50-foreground">
              {formatPrice(parseFloat(selectedShippingRate.amount))}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt5">
            {selectedShippingRate.servicelevel?.name ||
              selectedShippingRate.provider}
            {selectedShippingRate.estimated_days &&
              ` • ${selectedShippingRate.estimated_days} business days`}
          </div>
        </div>
      )}
    </div>
  );
}
