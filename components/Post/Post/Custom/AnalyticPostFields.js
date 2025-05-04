import { getBrowserEmoji } from "@/lib/utils/getBrowserInfo";
import { getPlatformEmoji } from "@/lib/utils/getPlatformInfo";
import { getSystemEmoji } from "@/lib/utils/getSystemInfo";

export default function AnalyticPostFields({
  country,
  countryCode,
  platformType,
  browserType,
  systemType,
  language,
  emailProvider,
  screenResolution,
  deviceMemory,
  title,
  showIcons = localStorage.getItem("showAnalyticIcons") === "true",
}) {
  const titleClassName = "fz12";

  return (
    <div className="w250 border-[1px] br8 fcc g15 px3">
      <div className="gray wf tac mba">{title}:</div>
      <div className="fc g0 -mt10 pb10">
        {countryCode && (
          <div className="f g3" title={`Country: ${country || countryCode}`}>
            {showIcons && (
              <img
                src={`https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`}
                style={{
                  width: "15px",
                  height: "auto",
                  alignSelf: "center",
                  marginLeft: 2,
                  marginRight: 2,
                }}
              />
            )}
            <span className={titleClassName}>{country || countryCode}</span>
          </div>
        )}
        {platformType && (
          <span className={titleClassName} title={`Device: ${platformType}`}>
            {showIcons && getPlatformEmoji(platformType)} {platformType}
          </span>
        )}
        {browserType && (
          <span className={titleClassName} title={`Browser: ${browserType}`}>
            {showIcons && getBrowserEmoji(browserType)} {browserType}
          </span>
        )}
        {systemType && (
          <span className={titleClassName} title={`OS: ${systemType}`}>
            {showIcons && getSystemEmoji(systemType)} {systemType}
          </span>
        )}
      </div>
      <div className="fc g0 -mt10 pb10">
        {language && (
          <span className={titleClassName} title={`Language: ${language}`}>
            {showIcons && "🌐"} {language.toUpperCase()}
          </span>
        )}
        {emailProvider && (
          <span className={titleClassName} title={`Email: ${emailProvider}`}>
            {showIcons && "📧"} {emailProvider.replace(".com", "")}
          </span>
        )}
        {screenResolution && (
          <span
            className={titleClassName}
            title={`Screen: ${screenResolution}`}
          >
            {showIcons && "🖥️"} {screenResolution}
          </span>
        )}
        {deviceMemory && (
          <span className={titleClassName} title={`RAM: ${deviceMemory}GB`}>
            {showIcons && "💾"} {deviceMemory}GB
          </span>
        )}
      </div>
    </div>
  );
}
