"use client";

import { useState } from "react";
import Input from "@/components/ui/shared/Input/InputQookeys";
import AddPostFormInputRadio from "./AddPostFormInputRadio";
import { mongoCollectionSpecialFieldTypes } from "@/lib/utils/mongo/_settingsMongoCollectionSpecialFieldTypes";
import PhoneInput from "@/components/ui/shared/PhoneInput/PhoneInput";
import Textarea from "@/components/ui/shared/Textarea/Textarea";

export default function AddPostFormInputStringNumber({
  name,
  label,
  type,
  required,
  defaultValue,
  subtype,
  className,
  fieldSettings,
}) {
  // ! stop generating input for subtypes:
  if (fieldSettings?.subtype === "country") return null; // country is RESERVED name for country selector
  if (fieldSettings?.subtype === "state") return null; // state is RESERVED name for state selector;
  if (fieldSettings?.subtype === "text") return null;

  // * handle subtype radio
  if (subtype === "radio") {
    return (
      <AddPostFormInputRadio
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={className}
        options={fieldSettings.options}
      />
    );
  }

  // * handle subtype textarea
  if (subtype === "textarea") {
    return (
      <Textarea
        name={name}
        label={label}
        defaultValue={defaultValue}
        required={required}
        className={className}
      />
    );
  }

  // ! handle subtype tel
  const [phoneNumber, setPhoneNumber] = useState(defaultValue || "");

  if (subtype === "tel") {
    return (
      <div className="w-full">
        <PhoneInput
          label={label}
          useFlags={false}
          name={name}
          value={phoneNumber}
          onChange={setPhoneNumber}
          defaultCountry="US"
          required={!phoneNumber && required}
          className={className}
        />
      </div>
    );
  }
  // ? handle subtype tel

  return (
    <Input
      key={name}
      name={name}
      // ! make special inputs by special mongo collection field names (RESERVED)
      type={(() => {
        const specialType = mongoCollectionSpecialFieldTypes.find(
          (specialType) => name.includes(specialType)
        );
        return specialType ? specialType : type;
      })()}
      label={label}
      defaultValue={defaultValue}
      required={required}
      className={className}
      step="0.01" // TODO ?
    />
  );
}
