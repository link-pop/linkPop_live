import { useEffect, useState } from "react";
import Switch from "@/components/ui/shared/Switch/Switch";

export default function SwitchShowAnalyticIcons() {
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    setIsToggled(localStorage.getItem("showAnalyticIcons") === "true");
  }, []);

  const handleToggle = () => {
    const newValue = !isToggled;
    setIsToggled(newValue);
    localStorage.setItem("showAnalyticIcons", newValue);
    window.location.reload();
  };

  return (
    <Switch
      isChecked={isToggled}
      onCheckedChange={handleToggle}
      label="show icons"
      className="my15 mxa"
    />
  );
}
