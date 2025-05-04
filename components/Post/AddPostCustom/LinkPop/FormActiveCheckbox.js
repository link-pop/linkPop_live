"use client";

import Switch2 from "@/components/ui/shared/Switch/Switch2";
import { useTranslation } from "@/components/Context/TranslationContext";

// TODO !!!!!!!! rename to FormActiveSwitch
export default function FormActiveCheckbox({
  isActive,
  onChange,
  className = "",
  customLabel,
  hideLabel = false,
}) {
  const { t } = useTranslation();
  const defaultLabel = t("active") || "Active";

  const handleChange = (checked) => {
    // Create an event-like object that mimics the checkbox onChange event
    onChange({
      target: {
        name: "active",
        checked,
        type: "checkbox",
      },
    });
  };

  const handleLabelClick = () => {
    // Toggle the switch when label is clicked
    handleChange(!isActive);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Switch2
        checked={isActive}
        onCheckedChange={handleChange}
        id="active-switch"
      />
      {!hideLabel && (
        <label
          className="ml-2 block text-sm font-medium cp"
          onClick={handleLabelClick}
        >
          {customLabel || defaultLabel}
        </label>
      )}
    </div>
  );
}
