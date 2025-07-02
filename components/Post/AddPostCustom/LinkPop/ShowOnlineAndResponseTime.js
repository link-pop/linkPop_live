import { Clock } from "lucide-react";

export default function ShowOnlineAndResponseTime({
  showOnline,
  responseTime,
  t,
  className = "",
}) {
  const shouldShowResponseTime =
    responseTime && responseTime !== "none" && Number(responseTime) !== 0;

  return (
    <div className={`px10 f aic g10 wrap jcc ${className}`.trim()}>
      {showOnline && (
        <div className="f aic g5">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs landing-page-text">
            {t("online") || "Online"}
          </span>
        </div>
      )}
      {shouldShowResponseTime && (
        <div
          className="landing-page-text fcc fwn aic g5"
          title={`${t("reply") || "Reply"}: ${responseTime} ${t("min") || "m"}`}
        >
          <Clock size={14} className="opacity-75" />
          {responseTime}
          {t("min") || "m"}
        </div>
      )}
    </div>
  );
}
