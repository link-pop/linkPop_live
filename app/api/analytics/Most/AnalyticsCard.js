"use client";

// ! don't modify this file - this is for CoolKeys project
export default function AnalyticsCard({
  title,
  data,
  showIcons = localStorage.getItem("showAnalyticIcons") === "true",
}) {
  return (
    <div className="p-4 maw900 wf mxa">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="bg-white rounded-lg shadow p-4 miw200 maw320 wf">
        <div className="space-y-2">
          {data.map(({ key, label, icon, percentage }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showIcons && (
                  <span className="text-xl" title={label}>
                    {icon}
                  </span>
                )}
                <span className="text-sm fw600">{label}</span>
              </div>
              <span className="text-sm font-medium brand">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
