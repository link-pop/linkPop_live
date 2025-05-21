"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import Input from "@/components/ui/shared/Input/Input";
import Select from "@/components/ui/shared/Select/Select";
import { update } from "@/lib/actions/crud";
import Button from "@/components/ui/shared/Button/Button2";
import { useContext } from "@/components/Context/Context";
import useFormErrors from "@/hooks/useFormErrors";

export default function AccountForm({ mongoUser, onSuccess }) {
  if (!mongoUser?._id) return null;

  const { t } = useTranslation();
  const [account, setAccount] = useState({
    age: mongoUser.age || "",
    raceEthnicity: mongoUser.raceEthnicity || "",
    hairColor: mongoUser.hairColor || "",
    bodyType: mongoUser.bodyType || "",
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

  // Hair color options
  const hairColorOptions = [
    { value: "black", label: t("black") },
    { value: "brown", label: t("brown") },
    { value: "blonde", label: t("blonde") },
    { value: "red", label: t("red") },
    { value: "gray", label: t("gray") },
    { value: "white", label: t("white") },
    { value: "other", label: t("other") },
  ];

  // Body type/build options
  const bodyTypeOptions = [
    { value: "slim", label: t("slim") },
    { value: "athletic", label: t("athletic") },
    { value: "average", label: t("average") },
    { value: "curvy", label: t("curvy") },
    { value: "muscular", label: t("muscular") },
    { value: "plus-size", label: t("plusSize") },
    { value: "other", label: t("other") },
  ];

  // Race/Ethnicity options
  const raceEthnicityOptions = [
    { value: "asian", label: t("asian") },
    { value: "black", label: t("black") },
    { value: "hispanic", label: t("hispanic") },
    { value: "middleEastern", label: t("middleEastern") },
    { value: "nativeAmerican", label: t("nativeAmerican") },
    { value: "pacificIslander", label: t("pacificIslander") },
    { value: "white", label: t("white") },
    { value: "multiracial", label: t("multiracial") },
    { value: "other", label: t("other") },
  ];

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Age validation - must be a number between 18 and 120
    if (
      account.age &&
      (isNaN(account.age) || account.age < 18 || account.age > 120)
    ) {
      errors.age = t("invalidAge") || "Age must be between 18 and 120";
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
        age: account.age,
        raceEthnicity: account.raceEthnicity,
        hairColor: account.hairColor,
        bodyType: account.bodyType,
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
        {/* AGE */}
        <div className={`fc g5`}>
          <Input
            type="number"
            name="age"
            value={account.age}
            onChange={handleInputChange}
            className={`gray br5`}
            label={t("age") || "Age"}
            min={18}
            max={120}
            error={formErrors.age}
          />
        </div>

        {/* RACE / ETHNICITY */}
        {/* // ! don't uncomment this ! */}
        {/* <div className={`fc g5`}>
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
        </div> */}

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

        {/* SUBMIT BUTTON */}
        <Button type="submit" className={`bg-[--color-brand] white br5 p10 cp`}>
          {t("saveChanges") || "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
