"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import Input from "@/components/ui/shared/Input/Input";
import Select from "@/components/ui/shared/Select/Select";
import Switch from "@/components/ui/shared/Switch/Switch";
import { update } from "@/lib/actions/crud";
import Button from "@/components/ui/shared/Button/Button2";
import { useContext } from "@/components/Context/Context";
import useFormErrors from "@/hooks/useFormErrors";
import {
  HAIR_COLOR_TAGS,
  BODY_TYPE_TAGS,
  RACE_ETHNICITY_TAGS,
  GENDER_TAGS,
  createSelectOptions,
} from "@/lib/constants/creatorTags";

export default function AccountForm({ mongoUser, onSuccess }) {
  if (!mongoUser?._id) return null;

  const { t } = useTranslation();
  const [account, setAccount] = useState({
    preferAge: mongoUser.preferAge || "",
    raceEthnicity: mongoUser.raceEthnicity || "",
    hairColor: mongoUser.hairColor || "",
    bodyType: mongoUser.bodyType || "",
    preferGender: mongoUser.preferGender || "",
    displayAllUsersIfNoMatchFoundForSuggestions:
      mongoUser.displayAllUsersIfNoMatchFoundForSuggestions || false,
  });

  const { toastSet } = useContext();
  const { errors: formErrors, setMultipleErrors, clearError } = useFormErrors();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field if it exists
    if (formErrors[name]) {
      clearError(name);
    }

    setAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes - this receives the value directly, not an event
  const handleSelectChange = (name) => (value) => {
    // Clear error for this field if it exists
    if (formErrors[name]) {
      clearError(name);
    }

    setAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hair color options using constants
  const hairColorOptions = createSelectOptions(
    HAIR_COLOR_TAGS,
    true,
    mongoUser?.profileType === "fan",
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  // Body type options using constants
  const bodyTypeOptions = createSelectOptions(
    BODY_TYPE_TAGS,
    true,
    mongoUser?.profileType === "fan",
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  // Race/Ethnicity options using constants
  const raceEthnicityOptions = createSelectOptions(
    RACE_ETHNICITY_TAGS,
    true,
    false,
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  // Gender options using constants (for fan preferences)
  const genderOptions = createSelectOptions(
    GENDER_TAGS,
    true,
    mongoUser?.profileType === "fan",
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Age validation - must be a number between 18 and 120
    if (
      account.preferAge &&
      (isNaN(account.preferAge) ||
        account.preferAge < 18 ||
        account.preferAge > 120)
    ) {
      errors.preferAge = t("invalidAge") || "Age must be between 18 and 120";
      isValid = false;
    }

    return { isValid, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset all form errors
    setMultipleErrors({});

    // Validate form
    const { isValid, errors } = validateForm();

    if (!isValid) {
      setMultipleErrors(errors);
      return;
    }

    // Update user in DB
    await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        preferAge: account.preferAge,
        raceEthnicity: account.raceEthnicity,
        hairColor: account.hairColor,
        bodyType: account.bodyType,
        preferGender: account.preferGender,
        displayAllUsersIfNoMatchFoundForSuggestions:
          account.displayAllUsersIfNoMatchFoundForSuggestions,
      },
      revalidate: "/my/settings/account",
    });

    toastSet({
      isOpen: true,
      title: t("accountUpdated") || "Account updated successfully",
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className={`fc g30 p15 wf maw600`}>
      {/* FORM */}
      <form onSubmit={handleSubmit} className={`fc g20 wf maw600`}>
        {mongoUser?.profileType === "fan" && (
          <>
            {/* PREFERRED AGE */}
            <div className={`fc g5`}>
              <Input
                type="number"
                name="preferAge"
                value={account.preferAge}
                onChange={handleInputChange}
                className={`gray br5`}
                label={t("preferredAge") || "Preferred Age"}
                min={18}
                max={120}
                error={formErrors.preferAge}
              />
            </div>

            {/* PREFERRED GENDER */}
            <div className={`fc g5`}>
              <Select
                name="preferGender"
                value={account.preferGender}
                onValueChange={handleSelectChange("preferGender")}
                className={`gray br5`}
                label={t("preferredGender") || "Preferred Gender"}
                options={genderOptions}
                error={formErrors.preferGender}
                placeholder={t("selectOption")}
                version="new"
              />
            </div>
          </>
        )}

        {/* RACE / ETHNICITY */}
        {mongoUser?.isDev && (
          <div className={`fc g5`}>
            <Select
              name="raceEthnicity"
              value={account.raceEthnicity}
              onValueChange={handleSelectChange("raceEthnicity")}
              className={`gray br5`}
              label={t("raceEthnicity") || "Race / Ethnicity"}
              options={raceEthnicityOptions}
              error={formErrors.raceEthnicity}
              placeholder={t("selectOption")}
              version="new"
            />
          </div>
        )}

        {/* HAIR COLOR */}
        <div className={`fc g5`}>
          <Select
            name="hairColor"
            value={account.hairColor}
            onValueChange={handleSelectChange("hairColor")}
            className={`gray br5`}
            label={t("hairColor") || "Hair Color"}
            options={hairColorOptions}
            error={formErrors.hairColor}
            placeholder={t("selectOption")}
            version="new"
          />
        </div>

        {/* BODY TYPE / BUILD */}
        <div className={`fc g5`}>
          <Select
            name="bodyType"
            value={account.bodyType}
            onValueChange={handleSelectChange("bodyType")}
            className={`gray br5`}
            label={t("bodyType") || "Body Type / Build"}
            options={bodyTypeOptions}
            error={formErrors.bodyType}
            placeholder={t("selectOption")}
            version="new"
          />
        </div>

        {/* DISPLAY ALL USERS IF NO MATCH FOUND */}
        <div className={`fc g5`}>
          <Switch
            name="displayAllUsersIfNoMatchFoundForSuggestions"
            label={
              t("displayAllUsersIfNoMatchFoundForSuggestions") ||
              "Show all creators if no matches found for your preferences"
            }
            isChecked={account.displayAllUsersIfNoMatchFoundForSuggestions}
            onCheckedChange={(value) => {
              setAccount((prev) => ({
                ...prev,
                displayAllUsersIfNoMatchFoundForSuggestions: value,
              }));
            }}
            className="p-3 bg-accent/5 rounded-md"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <Button type="submit" className={`bg-[--color-brand] white br5 p10 cp`}>
          {t("saveChanges") || "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
