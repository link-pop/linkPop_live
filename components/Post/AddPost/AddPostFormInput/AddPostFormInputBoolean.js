import Switch from "@/components/ui/shared/Switch/Switch";
import Checkbox from "@/components/ui/shared/Checkbox/Checkbox";

export default function AddPostFormInputBoolean({
  col,
  name,
  required,
  label,
  defaultValue,
  className,
}) {
  // ! Checkbox
  if (col?.settings?.fields?.[name]?.subtype === "checkbox") {
    return (
      <Checkbox
        id={name}
        name={name}
        required={required}
        defaultChecked={defaultValue}
        className={className}
        label={label}
      />
    );
  }

  // ! Switch
  return (
    <Switch
      key={name}
      name={name}
      required={required}
      label={label}
      defaultValue={defaultValue}
      className={className}
    />
  );
}
