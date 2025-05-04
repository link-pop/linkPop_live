export default function AnalyticPostSimilarity({
  countryCode,
  postCountryCode,
  platformType,
  postPlatformType,
  browserType,
  postBrowserType,
  systemType,
  postSystemType,
  emailProvider,
  postEmailProvider,
  language,
  postLanguage,
  screenResolution,
  postScreenResolution,
  deviceMemory,
  postDeviceMemory,
}) {
  // ! similarity
  const calculateSimilarity = () => {
    let matchCount = 0;
    let totalFields = 8;

    if (
      String(countryCode).toLowerCase() ===
      String(postCountryCode).toLowerCase()
    )
      matchCount++;
    if (
      String(platformType).toLowerCase() ===
      String(postPlatformType).toLowerCase()
    )
      matchCount++;
    if (
      String(browserType).toLowerCase() ===
      String(postBrowserType).toLowerCase()
    )
      matchCount++;
    if (
      String(systemType).toLowerCase() === String(postSystemType).toLowerCase()
    )
      matchCount++;
    if (
      String(emailProvider).toLowerCase() ===
      String(postEmailProvider).toLowerCase()
    )
      matchCount++;
    if (String(language).toLowerCase() === String(postLanguage).toLowerCase())
      matchCount++;
    if (
      String(screenResolution).toLowerCase() ===
      String(postScreenResolution).toLowerCase()
    )
      matchCount++;
    if (
      String(deviceMemory).toLowerCase() ===
      String(postDeviceMemory).toLowerCase()
    )
      matchCount++;

    return Math.round((matchCount / totalFields) * 100);
  };

  const similarityPercentage = calculateSimilarity();
  // ? similarity

  const getColor = (percentage) => {
    if (percentage >= 80) return "#4CAF50"; // green
    if (percentage >= 50) return "#FFC107"; // yellow
    return "#F44336"; // red
  };

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (similarityPercentage / 100) * circumference;
  const color = getColor(similarityPercentage);

  return (
    <div className="w250 border-[1px] br8 fc aic g5">
      <div className="gray wf tac">User Consistency: </div>
      <div className="relative mb5" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="absolute t0 l0" width={size} height={size}>
          <circle
            stroke="#e0e0e0"
            fill="none"
            strokeWidth={strokeWidth}
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
        </svg>
        {/* Progress circle */}
        <svg
          className="absolute t0 l0"
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress} ${circumference}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        {/* Percentage text */}
        <div
          className="absolute f aic jcc"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color,
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {similarityPercentage}%
        </div>
      </div>
    </div>
  );
}
