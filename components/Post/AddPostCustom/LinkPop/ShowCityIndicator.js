import { MapPin } from "lucide-react";

export default function ShowCityIndicator({
  city = "",
  distance = null,
  t = (k) => k,
  className = "",
  milesLabel = "mi",
  awayLabel = "away",
  youAreInLabel = "You are in",
  youAreNearLabel = "You are near",
  weAreOnlyLabel = "we are only",
  iconSize = 14,
  iconClassName = "ml5 miw20 mih20 landing-page-text opacity-75",
  textClassName = "text-xs landing-page-text",
  containerClassName = "fcc aic",
}) {
  return (
    <div
      className={
        containerClassName +
        (className ? ` ${className} ${textClassName}` : textClassName)
      }
    >
      <MapPin size={iconSize} className={iconClassName} />
      {city
        ? `${t("youAreIn") || youAreInLabel} ${city}`
        : `${t("youAreNear") || youAreNearLabel}`}
      {distance ? (
        <span className="ml-1">
          {t("weAreOnly") || weAreOnlyLabel} {distance}{" "}
          {t("miles") || milesLabel} {t("away") || awayLabel}!
        </span>
      ) : (
        <span className="ml-1">
          {t("weAreOnly") || weAreOnlyLabel} x {t("miles") || milesLabel}{" "}
          {t("away") || awayLabel}!
        </span>
      )}
    </div>
  );
}
